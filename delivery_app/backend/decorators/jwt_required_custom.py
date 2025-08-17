from functools import wraps
from flask import g, jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
import json

# Decorador customizado para verificar o JWT
def jwt_required_custom(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            # Verifica se existe JWT válido na requisição
            try:
                verify_jwt_in_request()
            except Exception as e:
                return jsonify({"msg": f"Erro na verificação do JWT: {str(e)}"}), 401

            # Obtém a identidade do token
            try:
                identidade = get_jwt_identity()
            except Exception as e:
                return jsonify({"msg": f"Erro ao obter a identidade do JWT: {str(e)}"}), 401

            # Se a identidade for string, tenta carregar como JSON
            if isinstance(identidade, str):
                try:
                    identidade = json.loads(identidade)
                except json.JSONDecodeError as e:
                    return jsonify({"msg": f"Erro ao decodificar identidade JSON: {str(e)}"}), 401

            if not isinstance(identidade, dict):
                return jsonify({"msg": "Erro: Identidade não é um dicionário válido."}), 401

            # Verifica se a identidade contém os dados essenciais
            if "usuario_id" not in identidade or "estabelecimento_id" not in identidade:
                return jsonify({"msg": "Erro: Usuário ou Estabelecimento não autenticados."}), 401

            # Guarda usuário e estabelecimento no contexto da requisição
            g.usuario_id = identidade["usuario_id"]
            g.estabelecimento_id = identidade["estabelecimento_id"]

            # Verifica se o array de tenants está presente e contém pelo menos um tenant
            tenants = identidade["tenants"]
            if not tenants or not isinstance(tenants, list):
                return jsonify({"msg": "Erro: Nenhum tenant encontrado no JWT."}), 401

            # Salva a lista de tenants no contexto
            g.tenants = tenants
            return fn(*args, **kwargs)

        except Exception as e:
            return jsonify({"msg": f"Erro inesperado no wrapper: {str(e)}"}), 500
    return wrapper


# .ENV PARA secure=False , FALSE É DEV E TRUE É PROD
# FAZER TESSTE COM O secure=True E secure=False
# fazer teste pra verse os cookies não são salvos no navegador
# fazer teste pra ver se o cookie é salvo no navegador
# COMPREENDER MELHOR o sistema de cookies do flask_jwt_extended