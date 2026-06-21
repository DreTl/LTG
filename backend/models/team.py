from datetime import datetime
from extensions import db


class Team(db.Model):
  __tablename__ = 'teams'

  id = db.Column(db.Integer, primary_key=True)
  tournament_id = db.Column(db.Integer, db.ForeignKey('tournaments.id'), nullable=False)
  name = db.Column(db.String(200), nullable=False)
  logo = db.Column(db.String(500), nullable=True)
  created_at = db.Column(db.DateTime, default=datetime.utcnow)

  def to_dict(self):
    return {
      'id': self.id,
      'tournament_id': self.tournament_id,
      'name': self.name,
      'logo': self.logo,
      'created_at': self.created_at.isoformat() if self.created_at else None,
    }
