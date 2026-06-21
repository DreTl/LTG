from datetime import date
from flask import Blueprint, jsonify
from models.tournament import Tournament
from models.team import Team
from models.match import Match

team_profile_bp = Blueprint('team_profile', __name__)


def _compute_standings(tournament_id):
  teams = Team.query.filter_by(tournament_id=tournament_id).all()
  matches = Match.query.filter_by(tournament_id=tournament_id).all()

  standings = {}
  for team in teams:
    standings[team.id] = {
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
      'form': [],
    }

  ordered = sorted(matches, key=lambda m: (m.played_date or date.min, m.id))
  for match in ordered:
    h, a = match.home_team_id, match.away_team_id
    if h not in standings or a not in standings:
      continue
    hg, ag = match.home_goals, match.away_goals
    standings[h]['played'] += 1
    standings[a]['played'] += 1
    standings[h]['goals_for'] += hg
    standings[h]['goals_against'] += ag
    standings[a]['goals_for'] += ag
    standings[a]['goals_against'] += hg
    if hg > ag:
      standings[h]['wins'] += 1
      standings[h]['points'] += 3
      standings[a]['losses'] += 1
      standings[h]['form'].append('W')
      standings[a]['form'].append('L')
    elif hg < ag:
      standings[a]['wins'] += 1
      standings[a]['points'] += 3
      standings[h]['losses'] += 1
      standings[h]['form'].append('L')
      standings[a]['form'].append('W')
    else:
      standings[h]['draws'] += 1
      standings[a]['draws'] += 1
      standings[h]['points'] += 1
      standings[a]['points'] += 1
      standings[h]['form'].append('D')
      standings[a]['form'].append('D')

  for entry in standings.values():
    entry['goal_difference'] = entry['goals_for'] - entry['goals_against']
    entry['form'] = entry['form'][-5:]

  ordered_standings = sorted(
    standings.values(),
    key=lambda x: (-x['points'], -x['goal_difference'], -x['goals_for']),
  )
  for i, entry in enumerate(ordered_standings, start=1):
    entry['position'] = i

  return ordered_standings


@team_profile_bp.route('/api/team-profile/<int:team_id>', methods=['GET'])
def get_team_profile(team_id):
  team = Team.query.get_or_404(team_id)
  tournament = Tournament.query.get(team.tournament_id)

  standings = _compute_standings(team.tournament_id)
  row = next((s for s in standings if s['team_id'] == team_id), None)

  if row is None:
    row = {
      'played': 0, 'wins': 0, 'draws': 0, 'losses': 0,
      'goals_for': 0, 'goals_against': 0, 'goal_difference': 0,
      'points': 0, 'form': [], 'position': None,
    }

  return jsonify({
    'team_id': team.id,
    'team_name': team.name,
    'logo': team.logo,
    'position': row['position'],
    'total_teams': len(standings),
    'matches': row['played'],
    'wins': row['wins'],
    'draws': row['draws'],
    'losses': row['losses'],
    'goals_for': row['goals_for'],
    'goals_against': row['goals_against'],
    'goal_difference': row['goal_difference'],
    'points': row['points'],
    'form': row['form'],
    'tournament_id': team.tournament_id,
    'tournament_name': tournament.name if tournament else '',
    'season': tournament.season if tournament else '',
  })
