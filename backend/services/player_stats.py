"""Shared player-position metadata and season-statistics computation.

Stats are derived from MatchEvent rows so they can always be rebuilt
deterministically whenever events (or matches) change.
"""

from extensions import db
from models.player import Player
from models.player_stats import PlayerStats
from models.match_event import MatchEvent
from models.team import Team

# Position code -> human readable name (ordered for display).
POSITIONS = [
  ('GK', 'Goalkeeper'),
  ('CB', 'Centre Back'),
  ('RB', 'Right Back'),
  ('LB', 'Left Back'),
  ('CDM', 'Defensive Midfielder'),
  ('CM', 'Central Midfielder'),
  ('CAM', 'Attacking Midfielder'),
  ('RW', 'Right Wing'),
  ('LW', 'Left Wing'),
  ('ST', 'Striker'),
  ('CF', 'Centre Forward'),
]

POSITION_NAMES = dict(POSITIONS)

# Grouping used by the rating formula and team-sheet sections.
_GROUPS = {
  'GK': 'goalkeeper',
  'CB': 'defender',
  'RB': 'defender',
  'LB': 'defender',
  'CDM': 'midfielder',
  'CM': 'midfielder',
  'CAM': 'midfielder',
  'RW': 'forward',
  'LW': 'forward',
  'ST': 'forward',
  'CF': 'forward',
}


def position_group(position):
  return _GROUPS.get((position or '').upper(), 'midfielder')


def position_name(position):
  return POSITION_NAMES.get((position or '').upper(), position or '')


def compute_rating(position, goals, assists, red_cards, clean_sheets):
  """Season player rating scaled to the 0-100 range.

  Formulas (per the Player Center spec):
    Forwards/Strikers : goals*10 + assists*6 - red_cards*5
    Midfielders       : goals*8  + assists*8
    Defenders         : clean_sheets*8 + goals*5
    Goalkeepers       : clean_sheets*10
  """
  group = position_group(position)
  if group == 'forward':
    raw = goals * 10 + assists * 6 - red_cards * 5
  elif group == 'midfielder':
    raw = goals * 8 + assists * 8
  elif group == 'defender':
    raw = clean_sheets * 8 + goals * 5
  else:  # goalkeeper
    raw = clean_sheets * 10
  return float(max(0, min(100, raw)))


def recompute_player_stats(tournament_id):
  """Rebuild every PlayerStats row for a tournament from its MatchEvents."""
  team_ids = [t.id for t in Team.query.filter_by(tournament_id=tournament_id).all()]
  if not team_ids:
    PlayerStats.query.filter_by(tournament_id=tournament_id).delete()
    db.session.commit()
    return

  players = Player.query.filter(Player.team_id.in_(team_ids)).all()
  events = MatchEvent.query.filter_by(tournament_id=tournament_id).all()

  by_player = {}
  for ev in events:
    by_player.setdefault(ev.player_id, []).append(ev)

  existing = {
    s.player_id: s
    for s in PlayerStats.query.filter_by(tournament_id=tournament_id).all()
  }

  seen = set()
  for player in players:
    evs = by_player.get(player.id, [])
    goals = sum(e.goals for e in evs)
    assists = sum(e.assists for e in evs)
    yellow = sum(e.yellow_cards for e in evs)
    red = sum(e.red_cards for e in evs)
    clean = sum(1 for e in evs if e.clean_sheet)
    minutes = sum(e.minutes_played for e in evs)
    matches = len(evs)
    rating = compute_rating(player.position, goals, assists, red, clean)

    row = existing.get(player.id)
    if row is None:
      row = PlayerStats(player_id=player.id, tournament_id=tournament_id)
      db.session.add(row)
    row.matches_played = matches
    row.goals = goals
    row.assists = assists
    row.yellow_cards = yellow
    row.red_cards = red
    row.clean_sheets = clean
    row.minutes_played = minutes
    row.player_rating = rating
    seen.add(player.id)

  # Drop stale rows for players that no longer exist in the tournament.
  for player_id, row in existing.items():
    if player_id not in seen:
      db.session.delete(row)

  db.session.commit()
