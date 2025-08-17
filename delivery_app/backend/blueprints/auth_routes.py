from flask import Blueprint, jsonify, g
from decorators.jwt_required_custom import jwt_required_custom
from decorators.tenant_required import tenant_required
from models.tenant import Tenant
from models.estabelecimento import Estabelecimento
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required,
    get_jwt_identity, set_access_cookies, unset_jwt_cookies,
    get_csrf_token
)
import json

auth_api = Blueprint('auth', __name__, url_prefix='/auth')

# checa autenticação JWT
@auth_api.route("/check_auth", methods=["GET", "POST"])
@jwt_required_custom
def check_auth():
    return jsonify({"message": "Acesso permitido!"}), 200

# checa autenticação JWT e o Tenant_ID
@auth_api.route("/check_auth_tenant", methods=["GET", "POST"])
@jwt_required_custom
@tenant_required
def check_auth_tenant():
    return jsonify({"message": "Acesso permitido!"}), 200

# retorna todos os tenants correspondente ao usuario
@auth_api.route("/get_tenant", methods=["GET"])
@jwt_required_custom
def get_tenant():
    if not g.tenants:
        return jsonify({"msg": "Nenhum tenant disponível para escolha."}), 400

    # Busca tenants com os IDs de g.tenants
    tenants = Tenant.query.filter(Tenant.id.in_(g.tenants)).all()

    if not tenants:
        return jsonify({"msg": "Nenhum tenant válido encontrado."}), 404

    tenant_list = []
    for tenant in tenants:
        estabelecimento = Estabelecimento.query.get(tenant.estabelecimento_id)
        if estabelecimento:
            tenant_list.append({
                "id": tenant.id,
                "slug": tenant.slug,
                "estabelecimento_id": estabelecimento.id,
                "estabelecimento_nome": estabelecimento.nome,  # O nome que vai para a pasta
            })
        else:
            # Se quiser ignorar tenants sem estabelecimento válido
            pass

    if not tenant_list:
        return jsonify({"msg": "Nenhum tenant com estabelecimento válido encontrado."}), 404
    print(tenant_list)
    return jsonify({"msg": "Escolha um tenant", "tenants": tenant_list}), 200



# seta o tenant_id no token por identity   
@auth_api.route("/set_tenant/<int:tenant_id>", methods=["POST"])
@jwt_required_custom
def set_tenant(tenant_id):
    # Verifica se o tenant existe nos tenants armazenados em g
    if tenant_id not in g.tenants:
        return jsonify({"msg": "Tenant inválido ou não autorizado."}), 403

    g.tenant_id = tenant_id  # Armazena o tenant no contexto da requisição

    # Atualiza a identidade com o novo tenant_id
    identidade = get_jwt_identity()

    if isinstance(identidade, str):
        try:
            identidade = json.loads(identidade)
        except json.JSONDecodeError:
            return jsonify({"msg": "Erro ao decodificar identidade JSON."}), 401

    # Atualiza o tenant_id na identidade
    identidade['tenant_id'] = tenant_id

    # Regenera o access_token com a identidade atualizada
    try:
        access_token = create_access_token(identity=json.dumps(identidade), fresh=True)
    except Exception as e:
        return jsonify({"msg": "Erro ao gerar o access token", "error": str(e)}), 500

    response = jsonify({"msg": "Tenant associado com sucesso"})
    
    # Define o token nos cookies
    set_access_cookies(response, access_token)

    return response

@auth_api.route("/check_setup_status", methods=["GET", "POST"])
def tenant_setup_status():
    return 200
    # estabelecimento_id = g.estabelecimento_id
    # estabelecimento = Estabelecimento.query.filter_by(id=estabelecimento_id).first()

    # if estabelecimento and estabelecimento.setup_completo:
    #     return jsonify({"setup_completo": True}), 200
    # else:
    #     return jsonify({"setup_completo": False}), 200