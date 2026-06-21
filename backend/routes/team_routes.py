import os
import uuid
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from extensions import db
from models.team import Team
from models.tournament import Tournament

team_bp = Blueprint('teams', __name__)


def allowed_file(filename):
  return '.' in filename and \
    filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']


@team_bp.route('/api/teams', methods=['GET'])
def get_teams():
  tournament_id = request.args.get('tournament_id')
  query = Team.query
  if tournament_id:
    query = query.filter_by(tournament_id=tournament_id)
  teams = query.order_by(Team.name).all()
  return jsonify([t.to_dict() for t in teams])


@team_bp.route('/api/teams/<int:id>', methods=['GET'])
def get_team(id):
  team = Team.query.get_or_404(id)
  return jsonify(team.to_dict())


@team_bp.route('/api/teams', methods=['POST'])
def create_team():
  if request.content_type and 'multipart/form-data' in request.content_type:
    data = request.form
    logo_file = request.files.get('logo')
  else:
    data = request.get_json() or {}
    logo_file = None

  if not data:
    return jsonify({'error': 'No data provided'}), 400

  tournament_id = data.get('tournament_id')
  name = data.get('name')

  if not tournament_id or not name:
    return jsonify({'error': 'Tournament ID and team name are required'}), 400

  Tournament.query.get_or_404(int(tournament_id))

  logo_path = None
  if logo_file and logo_file.filename and allowed_file(logo_file.filename):
    ext = logo_file.filename.rsplit('.', 1)[1].lower()
    filename = f"{uuid.uuid4().hex}.{ext}"
    filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
    logo_file.save(filepath)
    logo_path = f"/uploads/{filename}"

  team = Team(
    tournament_id=int(tournament_id),
    name=name,
    logo=logo_path,
  )
  db.session.add(team)
  db.session.commit()
  return jsonify(team.to_dict()), 201


@team_bp.route('/api/teams/<int:id>', methods=['PUT'])
def update_team(id):
  team = Team.query.get_or_404(id)

  if request.content_type and 'multipart/form-data' in request.content_type:
    data = request.form
    logo_file = request.files.get('logo')
  else:
    data = request.get_json() or {}
    logo_file = None

  if data.get('name'):
    team.name = data['name']

  if logo_file and logo_file.filename and allowed_file(logo_file.filename):
    ext = logo_file.filename.rsplit('.', 1)[1].lower()
    filename = f"{uuid.uuid4().hex}.{ext}"
    filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
    logo_file.save(filepath)
    team.logo = f"/uploads/{filename}"

  db.session.commit()
  return jsonify(team.to_dict())


@team_bp.route('/api/teams/<int:id>', methods=['DELETE'])
def delete_team(id):
  team = Team.query.get_or_404(id)
  db.session.delete(team)
  db.session.commit()
  return jsonify({'message': 'Team deleted successfully'})
