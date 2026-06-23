import os
import uuid
from flask import Blueprint, request, jsonify, current_app
from extensions import db
from models.player import Player
from models.team import Team
from services.player_stats import POSITIONS, POSITION_NAMES

player_bp = Blueprint('players', __name__)

VALID_POSITIONS = {code for code, _ in POSITIONS}


def allowed_file(filename):
  return '.' in filename and \
    filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']


def _save_photo(photo_file):
  if photo_file and photo_file.filename and allowed_file(photo_file.filename):
    ext = photo_file.filename.rsplit('.', 1)[1].lower()
    filename = f"{uuid.uuid4().hex}.{ext}"
    filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
    photo_file.save(filepath)
    return f"/uploads/{filename}"
  return None


def _to_int(value):
  try:
    return int(value)
  except (TypeError, ValueError):
    return None


def _jersey_taken(team_id, jersey_number, exclude_id=None):
  if jersey_number is None:
    return False
  query = Player.query.filter_by(team_id=team_id, jersey_number=jersey_number)
  if exclude_id is not None:
    query = query.filter(Player.id != exclude_id)
  return db.session.query(query.exists()).scalar()


@player_bp.route('/api/positions', methods=['GET'])
def get_positions():
  return jsonify([{'code': code, 'name': name} for code, name in POSITIONS])


@player_bp.route('/api/players', methods=['GET'])
def get_players():
  tournament_id = request.args.get('tournament_id')
  team_id = request.args.get('team_id')
  position = request.args.get('position')
  search = (request.args.get('search') or '').strip()

  query = Player.query.join(Team, Player.team_id == Team.id)

  if tournament_id:
    query = query.filter(Team.tournament_id == int(tournament_id))
  if team_id:
    query = query.filter(Player.team_id == int(team_id))
  if position:
    query = query.filter(Player.position == position.upper())
  if search:
    like = f"%{search}%"
    conditions = [Player.name.ilike(like), Team.name.ilike(like)]
    digits = _to_int(search)
    if digits is not None:
      conditions.append(Player.jersey_number == digits)
    query = query.filter(db.or_(*conditions))

  players = query.order_by(Player.jersey_number.asc(), Player.name.asc()).all()
  return jsonify([p.to_dict() for p in players])


@player_bp.route('/api/players/<int:id>', methods=['GET'])
def get_player(id):
  player = Player.query.get_or_404(id)
  data = player.to_dict()
  data['position_name'] = POSITION_NAMES.get(player.position, player.position)
  return jsonify(data)


@player_bp.route('/api/players', methods=['POST'])
def create_player():
  if request.content_type and 'multipart/form-data' in request.content_type:
    data = request.form
    photo_file = request.files.get('photo')
  else:
    data = request.get_json() or {}
    photo_file = None

  if not data:
    return jsonify({'error': 'No data provided'}), 400

  team_id = _to_int(data.get('team_id'))
  name = (data.get('name') or '').strip()
  position = (data.get('position') or 'CM').upper()

  if not team_id or not name:
    return jsonify({'error': 'Team and player name are required'}), 400
  if position not in VALID_POSITIONS:
    return jsonify({'error': 'Invalid position'}), 400

  Team.query.get_or_404(team_id)

  jersey_number = _to_int(data.get('jersey_number'))
  if jersey_number is not None and _jersey_taken(team_id, jersey_number):
    return jsonify({'error': f'Jersey number {jersey_number} is already taken in this team'}), 400

  player = Player(
    team_id=team_id,
    name=name,
    position=position,
    jersey_number=jersey_number,
    photo=_save_photo(photo_file),
    age=_to_int(data.get('age')),
    nationality=(data.get('nationality') or '').strip() or None,
    captain=str(data.get('captain')).lower() in ('1', 'true', 'yes', 'on'),
  )
  db.session.add(player)
  db.session.commit()
  return jsonify(player.to_dict()), 201


@player_bp.route('/api/players/<int:id>', methods=['PUT'])
def update_player(id):
  player = Player.query.get_or_404(id)

  if request.content_type and 'multipart/form-data' in request.content_type:
    data = request.form
    photo_file = request.files.get('photo')
  else:
    data = request.get_json() or {}
    photo_file = None

  if data.get('team_id'):
    team_id = _to_int(data.get('team_id'))
    Team.query.get_or_404(team_id)
    player.team_id = team_id
  if data.get('name'):
    player.name = data['name'].strip()
  if data.get('position'):
    position = data['position'].upper()
    if position not in VALID_POSITIONS:
      return jsonify({'error': 'Invalid position'}), 400
    player.position = position

  if 'jersey_number' in data:
    jersey_number = _to_int(data.get('jersey_number'))
    if jersey_number is not None and _jersey_taken(player.team_id, jersey_number, exclude_id=player.id):
      return jsonify({'error': f'Jersey number {jersey_number} is already taken in this team'}), 400
    player.jersey_number = jersey_number

  if 'age' in data:
    player.age = _to_int(data.get('age'))
  if 'nationality' in data:
    player.nationality = (data.get('nationality') or '').strip() or None
  if 'captain' in data:
    player.captain = str(data.get('captain')).lower() in ('1', 'true', 'yes', 'on')

  new_photo = _save_photo(photo_file)
  if new_photo:
    player.photo = new_photo

  db.session.commit()
  return jsonify(player.to_dict())


@player_bp.route('/api/players/<int:id>', methods=['DELETE'])
def delete_player(id):
  player = Player.query.get_or_404(id)
  db.session.delete(player)
  db.session.commit()
  return jsonify({'message': 'Player deleted successfully'})
