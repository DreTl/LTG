from datetime import datetime
from extensions import db


class Player(db.Model):
  __tablename__ = 'players'

  id = db.Column(db.Integer, primary_key=True)
  team_id = db.Column(db.Integer, db.ForeignKey('teams.id'), nullable=False)
  name = db.Column(db.String(200), nullable=False)
  position = db.Column(db.String(10), nullable=False, default='CM')
  jersey_number = db.Column(db.Integer, nullable=True)
  photo = db.Column(db.String(500), nullable=True)
  age = db.Column(db.Integer, nullable=True)
  nationality = db.Column(db.String(120), nullable=True)
  captain = db.Column(db.Boolean, nullable=False, default=False)
  created_at = db.Column(db.DateTime, default=datetime.utcnow)

  team = db.relationship(
    'Team',
    backref=db.backref('players', lazy=True, cascade='all, delete-orphan'),
  )

  def to_dict(self):
    team = self.team
    return {
      'id': self.id,
      'team_id': self.team_id,
      'team_name': team.name if team else None,
      'team_logo': team.logo if team else None,
      'tournament_id': team.tournament_id if team else None,
      'name': self.name,
      'position': self.position,
      'jersey_number': self.jersey_number,
      'photo': self.photo,
      'age': self.age,
      'nationality': self.nationality,
      'captain': bool(self.captain),
      'created_at': self.created_at.isoformat() if self.created_at else None,
    }
