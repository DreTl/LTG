from extensions import db


class MatchEvent(db.Model):
  """A single player's recorded contribution within one match.

  Admins enter per-match totals (goals, assists, cards, minutes, clean sheet)
  for each player who featured. Season PlayerStats are aggregated from these.
  """

  __tablename__ = 'match_events'

  id = db.Column(db.Integer, primary_key=True)
  match_id = db.Column(db.Integer, db.ForeignKey('matches.id'), nullable=False)
  tournament_id = db.Column(db.Integer, db.ForeignKey('tournaments.id'), nullable=False)
  player_id = db.Column(db.Integer, db.ForeignKey('players.id'), nullable=False)
  team_id = db.Column(db.Integer, db.ForeignKey('teams.id'), nullable=False)
  goals = db.Column(db.Integer, nullable=False, default=0)
  assists = db.Column(db.Integer, nullable=False, default=0)
  yellow_cards = db.Column(db.Integer, nullable=False, default=0)
  red_cards = db.Column(db.Integer, nullable=False, default=0)
  clean_sheet = db.Column(db.Boolean, nullable=False, default=False)
  minutes_played = db.Column(db.Integer, nullable=False, default=0)

  __table_args__ = (
    db.UniqueConstraint('match_id', 'player_id', name='uq_match_player_event'),
  )

  match = db.relationship(
    'Match',
    backref=db.backref('events', lazy=True, cascade='all, delete-orphan'),
  )
  player = db.relationship(
    'Player',
    backref=db.backref('events', lazy=True, cascade='all, delete-orphan'),
  )

  def to_dict(self):
    player = self.player
    return {
      'id': self.id,
      'match_id': self.match_id,
      'tournament_id': self.tournament_id,
      'player_id': self.player_id,
      'player_name': player.name if player else None,
      'jersey_number': player.jersey_number if player else None,
      'position': player.position if player else None,
      'photo': player.photo if player else None,
      'team_id': self.team_id,
      'goals': self.goals,
      'assists': self.assists,
      'yellow_cards': self.yellow_cards,
      'red_cards': self.red_cards,
      'clean_sheet': bool(self.clean_sheet),
      'minutes_played': self.minutes_played,
    }
