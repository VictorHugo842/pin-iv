from flask import Blueprint, request, jsonify, g
from flask_sqlalchemy import SQLAlchemy
from extensions import db, redis
from models.usuario_painel import UsuarioPainel
from models.estabelecimento import Estabelecimento
from models.tenant import Tenant
from slugify import slugify
from werkzeug.security import generate_password_hash, check_password_hash  # para segurança de senha
from decorators.jwt_required_custom import jwt_required_custom
from decorators.tenant_required import tenant_required
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required,
    get_jwt_identity, set_access_cookies, unset_jwt_cookies,
    get_csrf_token
)
import json
import os
from werkzeug.utils import secure_filename
from datetime import datetime

painel_api = Blueprint('painel', __name__, url_prefix='/painel')

UPLOAD_FOLDER = 'uploads/logos' 
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# @painel_api.route('/test_redis2', methods=['GET'])
# @jwt_required_custom
# @tenant_required
# def painel_test_redis():
#     redis.incr('painel_hits')  # incrementa contador no Redis
#     hits = redis.get('painel_hits')  # pega o contador atualizado
#     return jsonify({
#         'message': f'This painel page has been visited {hits.decode()} times.'
#     })


@painel_api.route("/delivery", methods=["GET"])
@jwt_required_custom
@tenant_required
def delivery():
    user_id = g.usuario_id
    tenant_id = g.tenant_id  
    estabelecimento_id = g.estabelecimento_id  

    # Verificar se os dados já estão no cache do Redis
    cache_key = f"delivery_data:{user_id}:{tenant_id}"
    cached_data = redis.get(cache_key)

    if cached_data:
        print("Dados recuperados do cache:", cached_data)
        return jsonify(json.loads(cached_data))

    # Buscar o tenant e validar
    tenant = Tenant.query.get(tenant_id)
    if not tenant:
        return jsonify({"msg": "Tenant não encontrado"}), 404

    # Validar se o tenant pertence ao usuário logado
    if tenant.usuario_id != user_id:
        return jsonify({"msg": "Usuário não autorizado para este tenant"}), 403

    # Validar se o tenant está associado ao estabelecimento correto
    if tenant.estabelecimento_id != estabelecimento_id:
        return jsonify({"msg": "Estabelecimento não pertence a este tenant"}), 403

    # Buscar o usuário
    usuario = UsuarioPainel.query.get(user_id)
    if not usuario:
        return jsonify({"msg": "Usuário não encontrado"}), 404

    # Buscar o estabelecimento
    estabelecimento = Estabelecimento.query.get(estabelecimento_id)
    if not estabelecimento:
        return jsonify({"msg": "Estabelecimento não encontrado"}), 404

    # Preparar os dados a serem retornados
    data = {
        "message": "Dados do Estabelecimento e cliente",
        "store": estabelecimento.nome,
        "store_type": estabelecimento.tipo_estabelecimento,
        "client_name": usuario.nome,
        "client_email": usuario.email,
        "tenant_id": str(tenant_id)  # Garantir string
    }

    # Armazenar os dados no cache do Redis com expiração de 1 hora
    redis.setex(cache_key, 3600, json.dumps(data))
    print("Dados armazenados no cache:", data)

    return jsonify(data)


@painel_api.route("/registrar", methods=["POST"])
def registrar_usuario():
    data = request.form
    files = request.files

    # Dados principais
    nome_estabelecimento = data.get("nome_estabelecimento")
    telefone = data.get("telefone")
    telefone_whatsapp_business = data.get("telefoneWhatsappBusiness")
    nome_usuario = data.get("nome_usuario")
    documento = data.get("documento")
    email = data.get("email")
    integrar_whatsapp = data.get("integrarWhatsapp", "false").lower() == "true"
    tipo_estabelecimento = data.get("tipo_estabelecimento")
    senha = data.get("senha")
    confirmar_senha = data.get("confirmar_senha")

    # Extrair unidades manualmente do formData
    unidades = []
    index = 0
    while True:
        nome_unidade = data.get(f'unidades[{index}][nome]')
        logo_unidade = files.get(f'unidades[{index}][logo]')
        if nome_unidade is None:
            break  # Quando acabar, para

        unidades.append({
            "nome": nome_unidade,
            "logo": logo_unidade
        })
        index += 1

    print(data)
    print(files)
    print(unidades)

    if not all([nome_estabelecimento, telefone, nome_usuario, documento, email, senha, tipo_estabelecimento, confirmar_senha]) or not unidades:
        return jsonify({"msg": "Preencha todos os campos obrigatórios"}), 400

    if senha != confirmar_senha:
        return jsonify({"msg": "As senhas não coincidem"}), 400

    # Verificações
    if UsuarioPainel.query.filter_by(email=email).first():
        return jsonify({"msg": "Email já cadastrado"}), 409
    if UsuarioPainel.query.filter_by(documento=documento).first():
        return jsonify({"msg": "Documento já cadastrado"}), 409
    if Estabelecimento.query.filter_by(nome=nome_estabelecimento).first():
        return jsonify({"msg": "Nome do Estabelecimento já cadastrado"}), 409

    # Criar Estabelecimento
    try:
        estabelecimento = Estabelecimento(
            nome=nome_estabelecimento,
            telefone_whatsapp_business=telefone_whatsapp_business,
            tipo_estabelecimento=tipo_estabelecimento,
            integrar_whatsapp=integrar_whatsapp,
        )
        db.session.add(estabelecimento)
        db.session.commit()
    except Exception as e:
        return jsonify({"msg": "Erro ao criar o estabelecimento", "error": str(e)}), 500

    # Criar usuário
    try:
        senha_hash = generate_password_hash(senha)
        usuario = UsuarioPainel(
            documento=documento,
            nome=nome_usuario,
            telefone=telefone,
            funcao="administrador",
            email=email,
            senha_hash=senha_hash
        )
        db.session.add(usuario)
        db.session.commit()
    except Exception as e:
        print(e)
        return jsonify({"msg": "Erro ao criar o usuário", "error": str(e)}), 500
    
    # Criar tenants com logo salva no disco
    tenants = []
    try:
        for index, unidade in enumerate(unidades):
            nome_unidade = unidade["nome"]
            slug_tenant = nome_unidade.lower().replace(' ', '_')

            logo_file = unidade.get("logo")
            logo_path = None

            if logo_file:
                filename = secure_filename(logo_file.filename)
                timestamp = int(datetime.now().timestamp())
                filename = f"{slug_tenant}_{timestamp}_{filename}"

                full_path = os.path.join(UPLOAD_FOLDER, filename)
                logo_file.save(full_path)

                # Salva o caminho relativo para o banco (exemplo: 'uploads/logos/arquivo.png')
                logo_path = full_path

            tenant = Tenant(
                estabelecimento_id=estabelecimento.id,
                usuario_id=usuario.id,
                slug=slug_tenant,
                logo_path=logo_path  # caminho do arquivo no banco
            )
            db.session.add(tenant)
            tenants.append(tenant)

        db.session.commit()
    except Exception as e:
        db.session.rollback()
        print(e)
        return jsonify({"msg": "Erro ao salvar tenants", "detalhes": str(e)}), 500


    # Gerar token
    identity = {
        "usuario_id": usuario.id,
        "estabelecimento_id": estabelecimento.id,
        "tenants": [tenant.id for tenant in tenants],
        "tenant_id": ""
    }

    identity_string = json.dumps(identity)

    try:
        access_token = create_access_token(identity=identity_string, fresh=True)
    except Exception as e:
        return jsonify({"msg": "Erro ao gerar o access token", "error": str(e)}), 500

    response = jsonify({"msg": "Usuário, Estabelecimento e Tenants registrados com sucesso"})
    set_access_cookies(response, access_token)
    return response, 201


@painel_api.route("/login", methods=["POST"])
def login_usuario():
    data = request.json
    email = data.get("email")
    senha = data.get("senha")

    if not email or not senha:
        return jsonify({"msg": "Preencha email e senha"}), 400

    usuario = UsuarioPainel.query.filter_by(email=email).first()
    if not usuario or not check_password_hash(usuario.senha_hash, senha):
        return jsonify({"msg": "Email ou senha inválidos"}), 401

    tenants = Tenant.query.filter_by(usuario_id=usuario.id).all()

    if not tenants:
        return jsonify({"msg": "Usuário não vinculado a nenhum tenant"}), 404

    # Criar o dicionário de identidade
    identity = {
        "usuario_id": usuario.id,
        "estabelecimento_id": tenants[0].estabelecimento_id,  # Pegando o estabelecimento do primeiro tenant
        "tenants": [tenant.id for tenant in tenants],
        "tenant_id": ""
    }

    identity_string = json.dumps(identity)

    try:
        access_token = create_access_token(identity=identity_string, fresh=True)
    except Exception as e:
        return jsonify({"msg": "Erro ao gerar o access token", "error": str(e)}), 500

    response = jsonify({"msg": "Login realizado com sucesso"})
    set_access_cookies(response, access_token)

    return response, 200


@painel_api.route("/logout", methods=["POST","GET"])
@jwt_required_custom
def logout_usuario():
    response = jsonify({"msg": "Logout realizado com sucesso"})

    # Limpa cookies de autenticação
    try:
        unset_jwt_cookies(response)
    except Exception as e:
        return jsonify({"msg": "Erro ao limpar cookies", "error": str(e)}), 500

    return response, 200