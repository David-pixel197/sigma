from flask import Flask, request, jsonify
from flask_cors import CORS
from models import VerificarLogin, carregarLocais, adicionarChamado, carregarChamados, carregarFuncionarios, atualizarFuncionario, adicionar_usuario, deletarFuncionario, atualizarChamado, criarLocal, deletarLocal, atualizarLocal

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/api/locais/<string:idLocal>', methods=['PUT'])
def att_Local(idLocal):
    get_local = request.get_json()
    if not get_local:
        return jsonify({"message": "Nenhuma informação foi recebida"}), 404

    try:
        update_local = atualizarLocal(idLocal, get_local)
        if update_local:
           return jsonify(update_local), 200 
        else: return jsonify({'message': 'Erro ao atualizar o local!'}), 406 
    except Exception as e:
        return jsonify({'message': 'Erro ao atualizar o local!'}), 408 

@app.route('/api/locais/<int:idLocal>', methods=['DELETE'])
def delete_local(idLocal):
    try:
        delete = deletarLocal(idLocal)
        if delete:
            return '', 200
        else: return jsonify({'message': 'Erro ao tentar excluir o local!'}), 406
    except Exception as e:
        print(f"Erro no processamento do local: {e}")
        return jsonify({"message": "Erro interno do servidor."}), 500

@app.route('/api/locais', methods=['POST'])
def criar_local():
    get_dados = request.get_json()
    if not get_dados or 'nome' not in get_dados or 'descricao' not in get_dados:
        return jsonify({'message': 'Preencha todos os campos!'}), 404
    nome = get_dados['nome']
    descricao = get_dados['descricao']
    try: 
        local = criarLocal(nome, descricao)
        if local:
            return jsonify(local), 201
        else: return jsonify({'message': 'Erro ao tentar criar o local!'}), 406
    except Exception as e:
        print(f"Erro no processamento do local: {e}")
        return jsonify({"message": "Erro interno do servidor."}), 500

@app.route('/api/chamados/<string:idChamado>', methods=['PATCH'])
def attChamado(idChamado):
    dados = request.get_json()
    print(dados)
    if not dados:
        return jsonify({'message': 'Nenhuma informação foi recebida!'}), 404

    try:
        chamado = atualizarChamado(idChamado, dados)
        if chamado:
            return jsonify(chamado), 200
        else: return jsonify({'message': 'Erro ao tentar atualizar o chamado!'}), 404
    except Exception as e:
        print(e)
        return jsonify({'message': 'Erro ao tentar atualizar o chamado!'}), 406


@app.route('/api/funcionarios/<string:idFunci>', methods=['DELETE'])
def deletar_usuario(idFunci):
    if not idFunci:
        return jsonify({'message': 'Erro ao pegar o ID do usuário!'})
    deletar = deletarFuncionario(idFunci)
    if deletar:
        return '', 204
    else: return jsonify({'message': 'Erro ao tentar excluir usuário!'}), 404


@app.route('/api/funcionarios', methods=['POST'])
def criarFunci():
    get_credenciais = request.get_json()
    if not get_credenciais or 'nome' not in get_credenciais or 'email' not in get_credenciais or 'senha' not in get_credenciais or 'autoridade' not in get_credenciais:
        return jsonify({'message': 'Preencha todos os campos!'})
    nome = get_credenciais['nome']
    email = get_credenciais['email']
    senha = get_credenciais['senha']
    autoridade = get_credenciais['autoridade']
    try:
        funci = adicionar_usuario(email, nome, senha, autoridade)
        if funci:
            return jsonify(funci), 201
        else: return jsonify({"message": "Erro, não foi possivel adicionar o usuário!"}), 401

    except Exception as e:
        print(f"Erro no processamento do usuário: {e}")
        return jsonify({"message": "Erro interno do servidor."}), 500

@app.route('/api/funcionarios/<string:idFunc>', methods=['PUT'])
def att_Funcionario(idFunc):
    get_funci = request.get_json()
    if not get_funci:
        return jsonify({"message": "Nenhuma informação foi recebida"}), 400

    try:
        update_funci = atualizarFuncionario(idFunc, get_funci)
        if update_funci:
           return jsonify(update_funci), 200 
        else: return jsonify({'message': 'Erro ao atualizar o funcionario!'}), 400 
    except Exception as e:
        return jsonify({'message': 'Erro ao atualizar o funcionario!'}), 400 

@app.route('/api/funcionarios', methods=['GET'])
def get_funcionarios():
    funcionarios = carregarFuncionarios()

    if funcionarios is not None and isinstance(funcionarios, list):
        return jsonify(funcionarios), 200
    else: return jsonify({"message": "Não foi possivel carregar os funcionarios!"}), 500

@app.route('/api/chamados', methods=['GET'])
def get_chamados():
    chamados = carregarChamados()

    if chamados is not None and isinstance(chamados, list):
        return jsonify(chamados), 200
    else: return jsonify({"message": "Não foi possivel carregar os chamados!"}), 500

@app.route('/api/chamados', methods=['POST'])
def chamados():
    get_chamado = request.get_json()
    if not get_chamado or 'idLocal' not in get_chamado or 'descricao' not in get_chamado:
        return jsonify({'message': 'Local e descrição é obrigatório!'})
    id_local = get_chamado['idLocal']
    descricao = get_chamado['descricao']

    try:
        chamado = adicionarChamado(id_local, descricao)
        if chamado == True:
            return jsonify({"message": "Chamado adicionado, aguarde..."}), 201
        else: return jsonify({"message": "Erro, não foi possivel adicionar o chamado!"}), 401

    except Exception as e:
        print(f"Erro no processamento do chamdado: {e}")
        return jsonify({"message": "Erro interno do servidor."}), 500

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
                    "email": funcionario['email'],
                    "nome": funcionario.get('nome'), 
                    "autoridade": funcionario.get('autoridade')
                }
            }), 200
        else:
            return jsonify({"message": "email do Funcionário ou senha inválidos."}), 401
            
    except Exception as e:
        print(f"Erro no processamento do login: {e}")
        return jsonify({"message": "Erro interno do servidor."}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
