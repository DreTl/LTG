import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from config import Config
from extensions import db


def create_app():
  app = Flask(__name__)
  app.config.from_object(Config)

  os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
  os.makedirs(os.path.join(os.path.dirname(__file__), 'database'), exist_ok=True)

  CORS(app, resources={r"/api/*": {"origins": "*"}})
  db.init_app(app)

  from models.tournament import Tournament
  from models.team import Team
  from models.match import Match
  from routes.tournament_routes import tournament_bp
  from routes.team_routes import team_bp
  from routes.match_routes import match_bp
  from routes.best_team_routes import best_team_bp
  from routes.fixtures_routes import fixtures_bp
  from routes.team_profile_routes import team_profile_bp

  app.register_blueprint(tournament_bp)
  app.register_blueprint(team_bp)
  app.register_blueprint(match_bp)
  app.register_blueprint(best_team_bp)
  app.register_blueprint(fixtures_bp)
  app.register_blueprint(team_profile_bp)

  @app.route('/uploads/<path:filename>')
  def uploaded_file(filename):
    response = send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response

  @app.route('/api/stats', methods=['GET'])
  def get_stats():
    return {
      'total_tournaments': Tournament.query.count(),
      'total_teams': Team.query.count(),
      'total_matches': Match.query.count(),
    }

  @app.route('/api/health', methods=['GET'])
  def health():
    return {'status': 'ok', 'message': 'TableGen API is running'}

  with app.app_context():
    db.create_all()

  return app


app = create_app()

if __name__ == '__main__':
  port = int(os.environ.get('PORT', 5002))
  app.run(debug=True, port=port)
