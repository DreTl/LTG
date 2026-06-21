import random
from flask import Blueprint, request, jsonify
from models.tournament import Tournament
from models.team import Team

fixtures_bp = Blueprint('fixtures', __name__)

BYE = '__BYE__'

# Kickoff window: 2:00 PM (14:00) to 4:00 PM (16:00), 15-minute slots.
KICKOFF_START_MIN = 14 * 60
KICKOFF_END_MIN = 16 * 60
KICKOFF_STEP = 15


def _random_kickoff():
  """Pick an unbiased random kickoff time between 2:00 PM and 4:00 PM."""
  slots = list(range(KICKOFF_START_MIN, KICKOFF_END_MIN + 1, KICKOFF_STEP))
  minutes = random.choice(slots)
  hour24, minute = divmod(minutes, 60)
  suffix = 'AM' if hour24 < 12 else 'PM'
  hour12 = hour24 % 12 or 12
  return f"{hour12}:{minute:02d} {suffix}"


def _round_robin(team_names):
  """Circle-method round-robin scheduling. Returns a list of rounds,
  each round being a list of (home, away) name tuples."""
  teams = list(team_names)
  if len(teams) < 2:
    return []

  if len(teams) % 2:
    teams.append(BYE)

  n = len(teams)
  half = n // 2
  rounds = []

  for r in range(n - 1):
    pairs = []
    for i in range(half):
      home = teams[i]
      away = teams[n - 1 - i]
      if home == BYE or away == BYE:
        continue
      # Alternate home/away each round for fairness.
      if r % 2 == 1:
        home, away = away, home
      pairs.append((home, away))
    rounds.append(pairs)
    # Rotate, keeping the first team fixed.
    teams = [teams[0]] + [teams[-1]] + teams[1:-1]

  return rounds


def _build_response(team_names, double_round):
  cleaned = [t.strip() for t in team_names if t and t.strip()]
  # De-duplicate while preserving order.
  seen = set()
  unique = []
  for name in cleaned:
    key = name.lower()
    if key not in seen:
      seen.add(key)
      unique.append(name)

  if len(unique) < 2:
    return None, 'At least 2 teams are required to generate fixtures'

  base_rounds = _round_robin(unique)
  all_rounds = list(base_rounds)
  if double_round:
    for pairs in base_rounds:
      all_rounds.append([(away, home) for (home, away) in pairs])

  rounds = []
  for idx, pairs in enumerate(all_rounds, start=1):
    rounds.append({
      'round': idx,
      'matches': [
        {'home': home, 'away': away, 'time': _random_kickoff()}
        for (home, away) in pairs
      ],
    })

  return {
    'teams': unique,
    'team_count': len(unique),
    'double_round': bool(double_round),
    'total_rounds': len(rounds),
    'total_matches': sum(len(r['matches']) for r in rounds),
    'rounds': rounds,
  }, None


@fixtures_bp.route('/api/fixtures/generate', methods=['POST'])
def generate_fixtures():
  data = request.get_json() or {}
  teams = data.get('teams')
  if not isinstance(teams, list):
    return jsonify({'error': 'teams must be a list of names'}), 400

  result, error = _build_response(teams, data.get('double_round', False))
  if error:
    return jsonify({'error': error}), 400
  return jsonify(result)


@fixtures_bp.route('/api/fixtures/<int:tournament_id>', methods=['GET'])
def fixtures_from_tournament(tournament_id):
  Tournament.query.get_or_404(tournament_id)
  double_round = request.args.get('double_round', '0') in ('1', 'true', 'True')
  teams = Team.query.filter_by(tournament_id=tournament_id).order_by(Team.name).all()
  names = [t.name for t in teams]

  result, error = _build_response(names, double_round)
  if error:
    return jsonify({'error': error}), 400
  return jsonify(result)
