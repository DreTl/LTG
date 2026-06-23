from datetime import datetime
from flask import Blueprint, request, jsonify
from extensions import db
from models.match import Match
from models.team import Team
from models.tournament import Tournament

match_bp = Blueprint('matches', __name__)


@match_bp.route('/api/matches', methods=['GET'])
def get_matches():
  tournament_id = request.args.get('tournament_id')
  query = Match.query
  if tournament_id:
    query = query.filter_by(tournament_id=tournament_id)
  matches = query.order_by(Match.played_date.desc()).all()
  return jsonify([m.to_dict() for m in matches])


@match_bp.route('/api/matches/<int:id>', methods=['GET'])
def get_match(id):
  match = Match.query.get_or_404(id)
  return jsonify(match.to_dict())


@match_bp.route('/api/matches', methods=['POST'])
def create_match():
  data = request.get_json()
  if not data:
    return jsonify({'error': 'No data provided'}), 400

  required = ['tournament_id', 'home_team_id', 'away_team_id', 'home_goals', 'away_goals']
  for field in required:
    if field not in data:
      return jsonify({'error': f'{field} is required'}), 400

  if data['home_team_id'] == data['away_team_id']:
    return jsonify({'error': 'Home and away teams must be different'}), 400

  Tournament.query.get_or_404(data['tournament_id'])
  Team.query.get_or_404(data['home_team_id'])
  Team.query.get_or_404(data['away_team_id'])

  played_date = None
  if data.get('played_date'):
    played_date = datetime.strptime(data['played_date'], '%Y-%m-%d').date()

  match = Match(
    tournament_id=data['tournament_id'],
    home_team_id=data['home_team_id'],
    away_team_id=data['away_team_id'],
    home_goals=int(data['home_goals']),
    away_goals=int(data['away_goals']),
    played_date=played_date,
  )
  db.session.add(match)
  db.session.commit()
  return jsonify(match.to_dict()), 201


@match_bp.route('/api/matches/<int:id>', methods=['PUT'])
def update_match(id):
  match = Match.query.get_or_404(id)
  data = request.get_json()

  if not data:
    return jsonify({'error': 'No data provided'}), 400

  home_id = data.get('home_team_id', match.home_team_id)
  away_id = data.get('away_team_id', match.away_team_id)

  if home_id == away_id:
    return jsonify({'error': 'Home and away teams must be different'}), 400

  if data.get('home_team_id'):
    Team.query.get_or_404(data['home_team_id'])
    match.home_team_id = data['home_team_id']
  if data.get('away_team_id'):
    Team.query.get_or_404(data['away_team_id'])
    match.away_team_id = data['away_team_id']
  if data.get('home_goals') is not None:
    match.home_goals = int(data['home_goals'])
  if data.get('away_goals') is not None:
    match.away_goals = int(data['away_goals'])
  if data.get('played_date'):
    match.played_date = datetime.strptime(data['played_date'], '%Y-%m-%d').date()

  db.session.commit()
  return jsonify(match.to_dict())


@match_bp.route('/api/matches/<int:id>', methods=['DELETE'])
def delete_match(id):
  from services.player_stats import recompute_player_stats
  match = Match.query.get_or_404(id)
  tournament_id = match.tournament_id
  db.session.delete(match)
  db.session.commit()
  # Player season stats are derived from match events, which cascade-delete
  # with the match, so rebuild the affected tournament's aggregates.
  recompute_player_stats(tournament_id)
  return jsonify({'message': 'Match deleted successfully'})
