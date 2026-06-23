import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

# Load variables from a local .env file when present (dev convenience).
# In production, real environment variables take precedence.
try:
  from dotenv import load_dotenv
  load_dotenv(os.path.join(BASE_DIR, '.env'))
except ImportError:
  pass


def _normalize_db_url(url):
  """Make a database URL safe for SQLAlchemy + psycopg v3.

  Managed providers (Heroku, Render, Railway, Supabase) often hand out
  'postgres://' URLs, but SQLAlchemy needs the 'postgresql://' scheme, and we
  pin the modern psycopg (v3) driver explicitly.
  """
  if not url:
    return None
  url = url.strip()
  if url.startswith('postgres://'):
    url = url.replace('postgres://', 'postgresql://', 1)
  if url.startswith('postgresql://') and '+psycopg' not in url:
    url = url.replace('postgresql://', 'postgresql+psycopg://', 1)
  return url


def _bool(value, default=False):
  if value is None:
    return default
  return str(value).strip().lower() in ('1', 'true', 'yes', 'on')


class Config:
  # Secret key MUST be overridden in production via the SECRET_KEY env var.
  SECRET_KEY = os.environ.get('SECRET_KEY', 'tablegen-secret-key-change-in-production')

  # Prefer a real database (PostgreSQL) via DATABASE_URL; fall back to a local
  # SQLite file so the app still runs out-of-the-box during development.
  _db_url = _normalize_db_url(os.environ.get('DATABASE_URL'))
  SQLALCHEMY_DATABASE_URI = _db_url or (
    f'sqlite:///{os.path.join(BASE_DIR, "database", "tablegen.db")}'
  )
  IS_POSTGRES = SQLALCHEMY_DATABASE_URI.startswith('postgresql')

  SQLALCHEMY_TRACK_MODIFICATIONS = False

  # Connection resilience. Managed Postgres closes idle connections, so we
  # verify and recycle them to avoid stale-connection errors under load.
  SQLALCHEMY_ENGINE_OPTIONS = {
    'pool_pre_ping': True,
    'pool_recycle': int(os.environ.get('DB_POOL_RECYCLE', 280)),
  }
  if IS_POSTGRES:
    SQLALCHEMY_ENGINE_OPTIONS.update({
      'pool_size': int(os.environ.get('DB_POOL_SIZE', 10)),
      'max_overflow': int(os.environ.get('DB_MAX_OVERFLOW', 20)),
      'pool_timeout': int(os.environ.get('DB_POOL_TIMEOUT', 30)),
    })

  # Runtime / deployment toggles.
  DEBUG = _bool(os.environ.get('FLASK_DEBUG'), default=False)

  # Comma-separated list of allowed origins for the API, or '*' for any.
  CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '*')

  # Uploads can be redirected to a mounted/persistent volume in production.
  UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER', os.path.join(BASE_DIR, 'uploads'))
  MAX_CONTENT_LENGTH = int(os.environ.get('MAX_CONTENT_LENGTH', 5 * 1024 * 1024))  # 5MB
  ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
