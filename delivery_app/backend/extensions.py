from flask_sqlalchemy import SQLAlchemy
from redis import Redis

db = SQLAlchemy()
redis = Redis(host='redis', port=6379)