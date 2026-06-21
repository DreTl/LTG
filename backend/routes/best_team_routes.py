from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
from models.tournament import Tournament
from models.team import Team
from models.match import Match

best_team_bp = Blueprint('best_team', __name__)


def _week_start(d):
  """Return the Monday of the ISO week for a given date."""
  return d - timedelta(days=d.weekday())


def _empty_stats(team):
  return {
    'team_id': team.id,
    'team': team.name,
    'logo': team.logo,
    'played': 0,
    'wins': 0,
    'draws': 0,
    'losses': 0,
    'goals_for': 0,
    'goals_against': 0,
    'goal_difference': 0,
    'points': 0,
    'performance_score': 0,
  }


def _rank_key(entry):
  return (
    -entry['performance_score'],
    -entry['points'],
    -entry['goal_difference'],
    -entry['goals_for'],
    -entry['wins'],
  )


@best_team_bp.route('/api/best-team/<int:tournament_id>', methods=['GET'])
def get_best_team(tournament_id):
  Tournament.query.get_or_404(tournament_id)
  teams = Team.query.filter_by(tournament_id=tournament_id).all()
  matches = Match.query.filter_by(tournament_id=tournament_id).all()

  team_map = {team.id: team for team in teams}

  # Only matches with a recorded date can be assigned to a week.
  dated_matches = [m for m in matches if m.played_date]

  # Distinct week start dates (Mondays), most recent first.
  available_weeks = sorted(
    {_week_start(m.played_date) for m in dated_matches},
    reverse=True,
  )

  if not available_weeks:
    return jsonify({
      'week_start': None,
      'week_end': None,
      'available_weeks': [],
      'best_team': None,
      'candidates': [],
    })

  requested = request.args.get('week_start')
  selected_week = None
  if requested:
    try:
      parsed = datetime.strptime(requested, '%Y-%m-%d').date()
      selected_week = _week_start(parsed)
    except ValueError:
      return jsonify({'error': 'week_start must be in YYYY-MM-DD format'}), 400

  if selected_week not in available_weeks:
    selected_week = available_weeks[0]

  week_end = selected_week + timedelta(days=6)

  stats = {}
  for match in dated_matches:
    if _week_start(match.played_date) != selected_week:
      continue
    home_id = match.home_team_id
    away_id = match.away_team_id
    if home_id not in team_map or away_id not in team_map:
      continue

    for tid in (home_id, away_id):
      if tid not in stats:
        stats[tid] = _empty_stats(team_map[tid])

    hg = match.home_goals
    ag = match.away_goals

    stats[home_id]['played'] += 1
    stats[away_id]['played'] += 1
    stats[home_id]['goals_for'] += hg
    stats[home_id]['goals_against'] += ag
    stats[away_id]['goals_for'] += ag
    stats[away_id]['goals_against'] += hg

    if hg > ag:
      stats[home_id]['wins'] += 1
      stats[home_id]['points'] += 3
      stats[away_id]['losses'] += 1
    elif hg < ag:
      stats[away_id]['wins'] += 1
      stats[away_id]['points'] += 3
      stats[home_id]['losses'] += 1
    else:
      stats[home_id]['draws'] += 1
      stats[away_id]['draws'] += 1
      stats[home_id]['points'] += 1
      stats[away_id]['points'] += 1

  for entry in stats.values():
    entry['goal_difference'] = entry['goals_for'] - entry['goals_against']
    # Weighted performance: points dominate, then goal difference, then goals scored.
    entry['performance_score'] = (
      entry['points'] * 10 + entry['goal_difference'] * 3 + entry['goals_for']
    )

  candidates = sorted(stats.values(), key=_rank_key)
  for i, entry in enumerate(candidates, start=1):
    entry['position'] = i

  best_team = candidates[0] if candidates else None

  return jsonify({
    'week_start': selected_week.isoformat(),
    'week_end': week_end.isoformat(),
    'available_weeks': [w.isoformat() for w in available_weeks],
    'best_team': best_team,
    'candidates': candidates,
  })
