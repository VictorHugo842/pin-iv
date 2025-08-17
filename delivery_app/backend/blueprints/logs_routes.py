# painel_logs.py
from flask import Blueprint, request, jsonify
import logging
import os

log_api = Blueprint('logs', __name__, url_prefix='/logs')

# Garante que a pasta 'logs' exista
os.makedirs('logs', exist_ok=True)

# Configura logger
logger = logging.getLogger('painel_logger')
logger.setLevel(logging.ERROR)

# Evita duplicidade de handlers ao reiniciar server
if not logger.handlers:
    file_handler = logging.FileHandler('logs/painel_logs.log')
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)

@log_api.route('/log_error', methods=['POST'])
def log_error():
    data = request.get_json()
    msg = data.get('message', 'Erro não especificado')
    details = data.get('details', 'Sem detalhes')
    
    # Salva o log no arquivo
    logger.error(f'{msg} | Detalhes: {details}')
    
    # Responde ao frontend com sucesso silencioso
    return jsonify({'status': 'logged'}), 200
