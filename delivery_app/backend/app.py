# app.py
from flask import Flask, g, jsonify, Response, request
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from sqlalchemy import text
from dotenv import load_dotenv
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_jwt_extended import JWTManager
from extensions import db, redis
from decorators.jwt_required_custom import jwt_required_custom
from decorators.tenant_required import tenant_required

# Importar os Blueprints
from blueprints.cardapio_routes import cardapio_api
from blueprints.painel_routes import painel_api
from blueprints.logs_routes import log_api
from blueprints.auth_routes import auth_api

load_dotenv()

app = Flask(__name__)

# Configuração do CORS
CORS(app, supports_credentials=True)

limiter = Limiter(get_remote_address, app=app)

# Load environment variables
import os
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")

# Database config
app.config["SQLALCHEMY_DATABASE_URI"] = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config['JWT_SECRET_KEY'] = JWT_SECRET_KEY
app.config['JWT_TOKEN_LOCATION'] = ['cookies']
app.config['JWT_COOKIE_SECURE'] = False
app.config['JWT_COOKIE_SAMESITE'] = 'Strict'
app.config['JWT_ACCESS_COOKIE_PATH'] = '/'
app.config['JWT_COOKIE_CSRF_PROTECT'] = True

# Inicializar extensoes
jwt = JWTManager(app)
db.init_app(app)
migrate = Migrate(app, db)

# Registrar os Blueprints
app.register_blueprint(cardapio_api)
app.register_blueprint(painel_api)
app.register_blueprint(log_api)
app.register_blueprint(auth_api)

@app.route('/test_redis', methods=['GET'])
def test_redis():
    redis.incr('hits')
    return 'This page has been visited {} times.'.format(redis.get('hits'))

@app.route('/test_db_connection')
@jwt_required_custom
@tenant_required
def test_db_connection():
    try:
        with db.engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        response = {"message": "Conexão com o banco de dados bem-sucedida!", "tenant": g.tenant_id}
        return Response(jsonify(response), content_type="application/json; charset=utf-8"), 200
    except Exception as e:
        response = {"error": "Falha na conexão com o banco de dados", "details": str(e)}
        return Response(jsonify(response), content_type="application/json; charset=utf-8"), 500

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
