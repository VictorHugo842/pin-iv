from extensions import db
from datetime import datetime, timezone

class Tenant(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    estabelecimento_id = db.Column(db.Integer, db.ForeignKey('estabelecimento.id'), nullable=False)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario_painel.id'), nullable=False)
    slug = db.Column(db.String(100), unique=True, nullable=False)
    logo_path = db.Column(db.String(255)) 
    data_ativacao = db.Column(db.DateTime)
    data_expiracao = db.Column(db.DateTime)
    status = db.Column(db.String(20), default='ativo') 
    limite_usuarios = db.Column(db.Integer, default=100)
    plano_assinatura = db.Column(db.String(50), default='básico')
    integracoes = db.Column(db.JSON)
