from datetime import date
from flask import Blueprint, request, jsonify
from extensions import db
from models.tournament import Tournament
from models.team import Team
from models.match import Match

tournament_bp = Blueprint('tournaments', __name__)


def _date_min():
  return date.min


@tournament_bp.route('/api/tournaments', methods=['GET'])
def get_tournaments():
  tournaments = Tournament.query.order_by(Tournament.created_at.desc()).all()
  return jsonify([t.to_dict() for t in tournaments])


@tournament_bp.route('/api/tournaments/<int:id>', methods=['GET'])
def get_tournament(id):
  tournament = Tournament.query.get_or_404(id)
  return jsonify(tournament.to_dict())


@tournament_bp.route('/api/tournaments', methods=['POST'])
def create_tournament():
  data = request.get_json()
  if not data or not data.get('name') or not data.get('season'):
    return jsonify({'error': 'Name and season are required'}), 400

  tournament = Tournament(
    name=data['name'],
    season=data['season'],
    number_of_teams=data.get('number_of_teams', 0),
  )
  db.session.add(tournament)
  db.session.commit()
  return jsonify(tournament.to_dict()), 201


@tournament_bp.route('/api/tournaments/<int:id>', methods=['PUT'])
def update_tournament(id):
  tournament = Tournament.query.get_or_404(id)
  data = request.get_json()

  if data.get('name'):
    tournament.name = data['name']
  if data.get('season'):
    tournament.season = data['season']
  if data.get('number_of_teams') is not None:
    tournament.number_of_teams = data['number_of_teams']

  db.session.commit()
  return jsonify(tournament.to_dict())


@tournament_bp.route('/api/tournaments/<int:id>', methods=['DELETE'])
def delete_tournament(id):
  tournament = Tournament.query.get_or_404(id)
  db.session.delete(tournament)
  db.session.commit()
  return jsonify({'message': 'Tournament deleted successfully'})


@tournament_bp.route('/api/standings/<int:tournament_id>', methods=['GET'])
def get_standings(tournament_id):
  Tournament.query.get_or_404(tournament_id)
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

  # Chronological order so recent-form is read oldest -> newest.
  ordered_matches = sorted(
    matches,
    key=lambda m: (m.played_date or _date_min(), m.id),
  )
  for match in ordered_matches:
    home_id = match.home_team_id
    away_id = match.away_team_id
    if home_id not in standings or away_id not in standings:
      continue
    hg, ag = match.home_goals, match.away_goals
    if hg > ag:
      standings[home_id]['form'].append('W')
      standings[away_id]['form'].append('L')
    elif hg < ag:
      standings[home_id]['form'].append('L')
      standings[away_id]['form'].append('W')
    else:
      standings[home_id]['form'].append('D')
      standings[away_id]['form'].append('D')

  # Keep only the last 5 results (most recent last).
  for entry in standings.values():
    entry['form'] = entry['form'][-5:]

  for match in matches:
    home_id = match.home_team_id
    away_id = match.away_team_id
    if home_id not in standings or away_id not in standings:
      continue

    hg = match.home_goals
    ag = match.away_goals

    standings[home_id]['played'] += 1
    standings[away_id]['played'] += 1
    standings[home_id]['goals_for'] += hg
    standings[home_id]['goals_against'] += ag
    standings[away_id]['goals_for'] += ag
    standings[away_id]['goals_against'] += hg

    if hg > ag:
      standings[home_id]['wins'] += 1
      standings[home_id]['points'] += 3
      standings[away_id]['losses'] += 1
    elif hg < ag:
      standings[away_id]['wins'] += 1
      standings[away_id]['points'] += 3
      standings[home_id]['losses'] += 1
    else:
      standings[home_id]['draws'] += 1
      standings[home_id]['points'] += 1
      standings[away_id]['draws'] += 1
      standings[away_id]['points'] += 1

  for entry in standings.values():
    entry['goal_difference'] = entry['goals_for'] - entry['goals_against']

  sorted_standings = sorted(
    standings.values(),
    key=lambda x: (-x['points'], -x['goal_difference'], -x['goals_for'])
  )

  for i, entry in enumerate(sorted_standings, start=1):
    entry['position'] = i

  return jsonify(sorted_standings)
