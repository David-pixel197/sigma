from flask import Flask, request, jsonify
from flask_cors import CORS
from models import VerificarLogin, carregarLocais

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/api/locais', methods=['GET'])
def locais():
    locais = carregarLocais()

    if locais is not None and isinstance(locais, list):
        return jsonify(locais), 200
    else:
        return jsonify({"message": "Não foi possivel carregar os locais!"}), 500

@app.route('/api/login', methods=['POST'])
def login():
    get_credenciais = request.get_json()
    if not get_credenciais or 'idFunci' not in get_credenciais or 'senha' not in get_credenciais:
        return jsonify({"message": "ID do Funcionário e senha são obrigatórios."}), 400
    email = get_credenciais['idFunci']
    senha = get_credenciais['senha']
    try:
        funcionario = VerificarLogin(email, senha)
        
        if funcionario:
            return jsonify({
                "message": "Login bem-sucedido!",
                "isAuthenticated": True,
                "user": {
                    "idFunci": funcionario['idFunci'],
                    "nome": funcionario.get('nome'), 
                    "autoridade": funcionario.get('autoridade')
                }
            }), 200
        else:
            return jsonify({"message": "ID do Funcionário ou senha inválidos."}), 401
            
    except Exception as e:
        print(f"Erro no processamento do login: {e}")
        return jsonify({"message": "Erro interno do servidor."}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
