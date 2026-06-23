from extensions import db


class PlayerStats(db.Model):
  """Season-based aggregate statistics for a player in one tournament.

  These rows are derived from MatchEvent records and are rebuilt whenever
  the underlying events change, so they always reflect recorded events.
  """

  __tablename__ = 'player_stats'

  id = db.Column(db.Integer, primary_key=True)
  player_id = db.Column(db.Integer, db.ForeignKey('players.id'), nullable=False)
  tournament_id = db.Column(db.Integer, db.ForeignKey('tournaments.id'), nullable=False)
  matches_played = db.Column(db.Integer, nullable=False, default=0)
  goals = db.Column(db.Integer, nullable=False, default=0)
  assists = db.Column(db.Integer, nullable=False, default=0)
  yellow_cards = db.Column(db.Integer, nullable=False, default=0)
  red_cards = db.Column(db.Integer, nullable=False, default=0)
  clean_sheets = db.Column(db.Integer, nullable=False, default=0)
  minutes_played = db.Column(db.Integer, nullable=False, default=0)
  player_rating = db.Column(db.Float, nullable=False, default=0)

  __table_args__ = (
    db.UniqueConstraint('player_id', 'tournament_id', name='uq_player_tournament_stats'),
  )

  player = db.relationship(
    'Player',
    backref=db.backref('stats', lazy=True, cascade='all, delete-orphan'),
  )

  def to_dict(self):
    return {
      'id': self.id,
      'player_id': self.player_id,
      'tournament_id': self.tournament_id,
      'matches_played': self.matches_played,
      'goals': self.goals,
      'assists': self.assists,
      'yellow_cards': self.yellow_cards,
      'red_cards': self.red_cards,
      'clean_sheets': self.clean_sheets,
      'minutes_played': self.minutes_played,
      'player_rating': round(self.player_rating, 1),
    }
