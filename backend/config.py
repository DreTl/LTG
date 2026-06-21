import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
  SECRET_KEY = os.environ.get('SECRET_KEY', 'tablegen-secret-key-change-in-production')
  SQLALCHEMY_DATABASE_URI = os.environ.get(
    'DATABASE_URL',
    f'sqlite:///{os.path.join(BASE_DIR, "database", "tablegen.db")}'
  )
  SQLALCHEMY_TRACK_MODIFICATIONS = False
  UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
  MAX_CONTENT_LENGTH = 5 * 1024 * 1024  # 5MB
  ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
