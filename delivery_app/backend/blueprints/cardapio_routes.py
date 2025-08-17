from flask import Blueprint, jsonify

cardapio_api = Blueprint('cardapio', __name__, url_prefix='/cardapio')

# Simulação de "banco de dados"
lojas = {
    "loja_teste": {
        "name": "Doceria GG",
        "menu": ["Bolo de cenoura", "Torta de limão", "Brigadeiro"]
    },
    "pizzaria_top": {
        "name": "Pizzaria Top",
        "menu": ["Pizza Margherita", "Pizza Calabresa", "Pizza Quatro Queijos"]
    }
}

@cardapio_api.route('/<slug>', methods=['GET'])
def get_loja_by_slug(slug):
    loja = lojas.get(slug)
    if not loja:
        return jsonify({"error": "Loja não encontrada"}), 404

    return jsonify({
        "loja": loja["name"],
        "menu": loja["menu"]
    })

@cardapio_api.route('/')
def index():
    return jsonify({
        "message": "API is running!",
        "people": ["FRONT-END cardapio", "FRONT-END cardapio"],
    })
