from datetime import datetime
from extensions import db


class Match(db.Model):
  __tablename__ = 'matches'

  id = db.Column(db.Integer, primary_key=True)
  tournament_id = db.Column(db.Integer, db.ForeignKey('tournaments.id'), nullable=False)
  home_team_id = db.Column(db.Integer, db.ForeignKey('teams.id'), nullable=False)
  away_team_id = db.Column(db.Integer, db.ForeignKey('teams.id'), nullable=False)
  home_goals = db.Column(db.Integer, nullable=False, default=0)
  away_goals = db.Column(db.Integer, nullable=False, default=0)
  played_date = db.Column(db.Date, nullable=True)

  home_team = db.relationship('Team', foreign_keys=[home_team_id])
  away_team = db.relationship('Team', foreign_keys=[away_team_id])

  def to_dict(self):
    return {
      'id': self.id,
      'tournament_id': self.tournament_id,
      'home_team_id': self.home_team_id,
      'away_team_id': self.away_team_id,
      'home_team_name': self.home_team.name if self.home_team else None,
      'away_team_name': self.away_team.name if self.away_team else None,
      'home_goals': self.home_goals,
      'away_goals': self.away_goals,
      'played_date': self.played_date.isoformat() if self.played_date else None,
    }
