from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
from extensions import db
from models.player import Player
from models.player_stats import PlayerStats
from models.match_event import MatchEvent
from models.match import Match
from models.team import Team
from models.tournament import Tournament
from services.player_stats import (
  recompute_player_stats,
  position_name,
  position_group,
)

player_stats_bp = Blueprint('player_stats', __name__)


def _week_start(d):
  return d - timedelta(days=d.weekday())


def _player_row(player, stats):
  data = player.to_dict()
  data['position_name'] = position_name(player.position)
  if stats:
    data.update({
      'matches_played': stats.matches_played,
      'goals': stats.goals,
      'assists': stats.assists,
      'yellow_cards': stats.yellow_cards,
      'red_cards': stats.red_cards,
      'clean_sheets': stats.clean_sheets,
      'minutes_played': stats.minutes_played,
      'player_rating': round(stats.player_rating, 1),
    })
  else:
    data.update({
      'matches_played': 0, 'goals': 0, 'assists': 0, 'yellow_cards': 0,
      'red_cards': 0, 'clean_sheets': 0, 'minutes_played': 0, 'player_rating': 0,
    })
  return data


def _players_with_stats(tournament_id):
  team_ids = [t.id for t in Team.query.filter_by(tournament_id=tournament_id).all()]
  if not team_ids:
    return []
  players = Player.query.filter(Player.team_id.in_(team_ids)).all()
  stats_map = {
    s.player_id: s
    for s in PlayerStats.query.filter_by(tournament_id=tournament_id).all()
  }
  return [_player_row(p, stats_map.get(p.id)) for p in players]


@player_stats_bp.route('/api/player-stats', methods=['GET'])
def get_player_stats():
  tournament_id = request.args.get('tournament_id')
  if not tournament_id:
    return jsonify({'error': 'tournament_id is required'}), 400
  rows = _players_with_stats(int(tournament_id))
  rows.sort(key=lambda r: (-r['player_rating'], -r['goals'], -r['assists']))
  return jsonify(rows)


@player_stats_bp.route('/api/top-scorers', methods=['GET'])
def get_top_scorers():
  tournament_id = request.args.get('tournament_id')
  if not tournament_id:
    return jsonify({'error': 'tournament_id is required'}), 400
  limit = request.args.get('limit', type=int)

  rows = _players_with_stats(int(tournament_id))
  rows = [r for r in rows if r['goals'] > 0 or r['assists'] > 0]
  rows.sort(key=lambda r: (-r['goals'], -r['assists'], -r['minutes_played']))
  for i, row in enumerate(rows, start=1):
    row['rank'] = i
  if limit:
    rows = rows[:limit]
  return jsonify(rows)


@player_stats_bp.route('/api/player-of-the-week', methods=['GET'])
def get_player_of_the_week():
  tournament_id = request.args.get('tournament_id')
  if not tournament_id:
    return jsonify({'error': 'tournament_id is required'}), 400
  tournament_id = int(tournament_id)
  Tournament.query.get_or_404(tournament_id)

  events = (
    db.session.query(MatchEvent, Match.played_date)
    .join(Match, MatchEvent.match_id == Match.id)
    .filter(MatchEvent.tournament_id == tournament_id)
    .all()
  )
  dated = [(ev, d) for ev, d in events if d]

  weeks = sorted({_week_start(d) for _, d in dated}, reverse=True)
  if not weeks:
    return jsonify({
      'week_start': None, 'week_end': None, 'available_weeks': [],
      'player_of_the_week': None, 'candidates': [],
    })

  requested = request.args.get('week_start')
  selected = None
  if requested:
    try:
      selected = _week_start(datetime.strptime(requested, '%Y-%m-%d').date())
    except ValueError:
      return jsonify({'error': 'week_start must be in YYYY-MM-DD format'}), 400
  if selected not in weeks:
    selected = weeks[0]

  agg = {}
  for ev, d in dated:
    if _week_start(d) != selected:
      continue
    a = agg.setdefault(ev.player_id, {
      'goals': 0, 'assists': 0, 'yellow_cards': 0, 'red_cards': 0,
      'clean_sheets': 0, 'minutes_played': 0, 'matches_played': 0,
    })
    a['goals'] += ev.goals
    a['assists'] += ev.assists
    a['yellow_cards'] += ev.yellow_cards
    a['red_cards'] += ev.red_cards
    a['clean_sheets'] += 1 if ev.clean_sheet else 0
    a['minutes_played'] += ev.minutes_played
    a['matches_played'] += 1

  players = {p.id: p for p in Player.query.filter(Player.id.in_(agg.keys())).all()} if agg else {}

  candidates = []
  for player_id, a in agg.items():
    player = players.get(player_id)
    if not player:
      continue
    score = a['goals'] * 10 + a['assists'] * 6 + a['clean_sheets'] * 5
    row = player.to_dict()
    row['position_name'] = position_name(player.position)
    row.update(a)
    row['week_score'] = score
    candidates.append(row)

  candidates.sort(key=lambda r: (-r['week_score'], -r['goals'], -r['assists']))
  for i, row in enumerate(candidates, start=1):
    row['rank'] = i

  return jsonify({
    'week_start': selected.isoformat(),
    'week_end': (selected + timedelta(days=6)).isoformat(),
    'available_weeks': [w.isoformat() for w in weeks],
    'player_of_the_week': candidates[0] if candidates else None,
    'candidates': candidates,
  })


@player_stats_bp.route('/api/player-profile/<int:player_id>', methods=['GET'])
def get_player_profile(player_id):
  player = Player.query.get_or_404(player_id)
  team = player.team
  tournament_id = team.tournament_id if team else None
  tournament = Tournament.query.get(tournament_id) if tournament_id else None

  stats = None
  if tournament_id:
    stats = PlayerStats.query.filter_by(
      player_id=player.id, tournament_id=tournament_id
    ).first()

  data = _player_row(player, stats)
  data['position_name'] = position_name(player.position)
  data['tournament_id'] = tournament_id
  data['tournament_name'] = tournament.name if tournament else ''
  data['season'] = tournament.season if tournament else ''

  recent = (
    db.session.query(MatchEvent, Match)
    .join(Match, MatchEvent.match_id == Match.id)
    .filter(MatchEvent.player_id == player.id)
    .order_by(Match.played_date.desc().nullslast(), MatchEvent.id.desc())
    .limit(5)
    .all()
  )
  data['recent_form'] = [
    {
      'match_id': ev.match_id,
      'played_date': m.played_date.isoformat() if m.played_date else None,
      'goals': ev.goals,
      'assists': ev.assists,
      'clean_sheet': bool(ev.clean_sheet),
      'minutes_played': ev.minutes_played,
    }
    for ev, m in recent
  ]
  return jsonify(data)


@player_stats_bp.route('/api/team-sheet/<int:team_id>', methods=['GET'])
def get_team_sheet(team_id):
  team = Team.query.get_or_404(team_id)
  tournament = Tournament.query.get(team.tournament_id)
  players = Player.query.filter_by(team_id=team_id).order_by(
    Player.jersey_number.asc(), Player.name.asc()
  ).all()

  groups = {'goalkeeper': [], 'defender': [], 'midfielder': [], 'forward': []}
  for p in players:
    row = p.to_dict()
    row['position_name'] = position_name(p.position)
    groups[position_group(p.position)].append(row)

  return jsonify({
    'team_id': team.id,
    'team_name': team.name,
    'team_logo': team.logo,
    'tournament_id': team.tournament_id,
    'tournament_name': tournament.name if tournament else '',
    'season': tournament.season if tournament else '',
    'total_players': len(players),
    'goalkeepers': groups['goalkeeper'],
    'defenders': groups['defender'],
    'midfielders': groups['midfielder'],
    'forwards': groups['forward'],
  })


@player_stats_bp.route('/api/matches/<int:match_id>/events', methods=['GET'])
def get_match_events(match_id):
  Match.query.get_or_404(match_id)
  events = MatchEvent.query.filter_by(match_id=match_id).all()
  return jsonify([e.to_dict() for e in events])


@player_stats_bp.route('/api/matches/<int:match_id>/events', methods=['POST'])
def save_match_events(match_id):
  match = Match.query.get_or_404(match_id)
  data = request.get_json() or {}
  events = data.get('events', [])
  if not isinstance(events, list):
    return jsonify({'error': 'events must be a list'}), 400

  valid_team_ids = {match.home_team_id, match.away_team_id}

  # Replace all events for this match with the submitted set.
  MatchEvent.query.filter_by(match_id=match_id).delete()

  for item in events:
    player_id = item.get('player_id')
    if not player_id:
      continue
    player = Player.query.get(player_id)
    if not player or player.team_id not in valid_team_ids:
      continue

    def _int(key):
      try:
        return max(0, int(item.get(key) or 0))
      except (TypeError, ValueError):
        return 0

    ev = MatchEvent(
      match_id=match_id,
      tournament_id=match.tournament_id,
      player_id=player.id,
      team_id=player.team_id,
      goals=_int('goals'),
      assists=_int('assists'),
      yellow_cards=_int('yellow_cards'),
      red_cards=_int('red_cards'),
      clean_sheet=bool(item.get('clean_sheet')),
      minutes_played=_int('minutes_played'),
    )
    db.session.add(ev)

  db.session.commit()
  recompute_player_stats(match.tournament_id)

  events = MatchEvent.query.filter_by(match_id=match_id).all()
  return jsonify([e.to_dict() for e in events]), 201
