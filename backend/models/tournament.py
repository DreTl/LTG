from datetime import datetime
from extensions import db


class Tournament(db.Model):
  __tablename__ = 'tournaments'

  id = db.Column(db.Integer, primary_key=True)
  name = db.Column(db.String(200), nullable=False)
  season = db.Column(db.String(100), nullable=False)
  number_of_teams = db.Column(db.Integer, nullable=False, default=0)
  created_at = db.Column(db.DateTime, default=datetime.utcnow)

  teams = db.relationship('Team', backref='tournament', lazy=True, cascade='all, delete-orphan')
  matches = db.relationship('Match', backref='tournament', lazy=True, cascade='all, delete-orphan')

  def to_dict(self):
    return {
      'id': self.id,
      'name': self.name,
      'season': self.season,
      'number_of_teams': self.number_of_teams,
      'created_at': self.created_at.isoformat() if self.created_at else None,
    }
