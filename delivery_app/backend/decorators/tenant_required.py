from functools import wraps
from flask import g, jsonify
from flask_jwt_extended import get_jwt_identity
import json

def tenant_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            identidade = get_jwt_identity()

            if isinstance(identidade, str):
                try:
                    identidade = json.loads(identidade)
                except json.JSONDecodeError:
                    return jsonify({"msg": "Erro ao decodificar identidade JSON."}), 401

            tenant_id = str(identidade.get("tenant_id"))

            # Converte todos os tenants permitidos para string antes da checagem
            tenants_autorizados = [str(t) for t in g.tenants]

            if not tenant_id or tenant_id not in tenants_autorizados:
                return jsonify({"msg": "Tenant não encontrado ou não autorizado."}), 401

            g.tenant_id = tenant_id  # Armazena como string também, para consistência

            return fn(*args, **kwargs)
        except Exception as e:
            print(f"Erro no tenant_required: {e}")
            return jsonify({"msg": "Erro ao validar o tenant"}), 500
    return wrapper
