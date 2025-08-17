from extensions import db
from datetime import datetime, timezone

class Estabelecimento(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    telefone_whatsapp_business = db.Column(db.String(20))
    tipo_estabelecimento = db.Column(db.String(50))
    integrar_whatsapp = db.Column(db.Boolean, default=False)
    modo_operacao = db.Column(db.JSON, default='')
    criado_em = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    setup_completo = db.Column(db.Boolean, default=False)

    # Relacionamento com Tenant (já com nome diferente)
    tenants_list = db.relationship('Tenant', backref='estabelecimento_rel', lazy=True)
