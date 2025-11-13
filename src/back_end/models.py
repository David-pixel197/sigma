import os
import datetime
from dotenv import load_dotenv
from pathlib import Path
from supabase import create_client, Client
#from werkzeug.security import generate_password_hash, check_password_hash
from flask_argon2 import Argon2

argon2 = Argon2()
dotenvCaminho = Path(__file__).resolve().parent.parent.parent 
load_dotenv(dotenv_path=dotenvCaminho / '.env')

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
if not url or not key:
    raise ValueError("Variáveis SUPABASE_URL ou SUPABASE_KEY não encontradas .env, adicione e tente novamente!")
supabase: Client = create_client(url, key)
print("banco de dados carregado.")

TABELA_FUNCIONARIOS = 'Funcionario'
TABELA_LOCAIS = 'Local'
TABELA_CHAMADOS = 'Chamado'

def atualizarLocal(id_local, dados_atualizados):
    dados_update = {}
    get_campos = {'nome', 'descricao'}

    for campo in get_campos:
        if campo in dados_atualizados and dados_atualizados[campo] is not None:
            dados_update[campo] = dados_atualizados[campo]
    
    if not dados_update: 
        print(f'Nenhuma informação válida fornecida para atualizar o funcionário {id_local}.')
        try:
             response = supabase.table(TABELA_LOCAIS).select('*').eq('idLocal', id_local).limit(1).execute()
             return response.data[0] if response.data else None
        except Exception:
             return None
    
    try:
        response = supabase.table(TABELA_LOCAIS).update(dados_update).eq('idLocal', id_local).execute()
        if response.data:
            print(f'As informações do local {id_local} foi atualizada no banco de dados!')
            return response.data[0]
    except Exception as e:
        print('Falha ao editar local!')
        return None

def deletarLocal(id_local):
    response = supabase.table(TABELA_LOCAIS).select('*').eq('idLocal', id_local).limit(1).execute()
    dados = response.data[0]
    if len(response.data) > 0:
        delete = supabase.table(TABELA_LOCAIS).delete().eq('idLocal', id_local).execute()
        if len(delete.data) > 0:
            print(f'O local {dados.get('nome')} foi excluido do banco de dados')
            return True
        else:
            print(f'Erro ao tentar deletar o {dados.get('nome')}')
            return  False
    else: 
        print(f'Erro ao tentar deletar o {dados.get('nome')}')
        return  False


def criarLocal(nome, descricao):
    response_nome = supabase.table(TABELA_LOCAIS).select('nome').eq('nome', nome).limit(1).execute()
    if len(response_nome.data) > 0:
        return print('O local já existe no banco de dados!')
    dados_insert = {
        'nome': nome,
        'descricao': descricao
    }
    response = supabase.table(TABELA_LOCAIS).insert(dados_insert, count=None).execute()
    if len(response.data) > 0:
        print(f'Um novo local chamado {nome} foi adicionado!')
        return True
    else: return False

def atualizarChamado(idChamado, dados_atualizados):
    campos_permitidos = {'fk_Funcionario_idFunci', 'aberto'}
    dados_filtrados = {k: v for k, v in dados_atualizados.items() if k in campos_permitidos}

    if not dados_filtrados:
        print(f"Nenhum campo válido fornecido para atualizar o chamado {idChamado}.")
        try:
            response = supabase.table(TABELA_CHAMADOS).select('*').eq('idChamado', idChamado).limit(1).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print("Erro ao buscar chamado:", e)
            return None
    
    try:
        response = supabase.table(TABELA_CHAMADOS).update(dados_filtrados).eq('idChamado', idChamado).execute()
        if response.data:
            return response.data[0]
        else: return None
    except Exception as e:
        print('Erro ao atualizar o chamado!', e)
        return False

def deletarFuncionario(id_funci):
    response = supabase.table(TABELA_FUNCIONARIOS).select('idFunci').eq('idFunci', id_funci).limit(1).execute()

    if len(response.data) > 0:
        try:
            delete = supabase.table(TABELA_FUNCIONARIOS).delete().eq('idFunci', id_funci).execute()
            if len(delete.data) > 0:
                print(f'O usuário ID {id_funci} foi exluido do banco de dados!')
                return True
            else: return False
        except Exception as e:
            print('Erro no banco de dados após tentativa de excluir usuário!')
            return False
    else: return False

def atualizarFuncionario(id_funci, dados_atualizados):
    dados_update = {}
    get_campos = {'nome', 'email', 'autoridade'}

    for campo in get_campos:
        if campo in dados_atualizados and dados_atualizados[campo] is not None:
            dados_update[campo] = dados_atualizados[campo]
    
    senha = dados_atualizados.get('senha')
    if senha:
        if isinstance(senha, str) and senha.strip() != "":
            try:
                cripto_senha = argon2.generate_password_hash(senha)
                dados_update['senha'] = cripto_senha
            except Exception as e:
                print('Falha ao encriptar a senha, verifique o codigo!')
                return None
    
    if not dados_update: 
        print(f'Nenhuma informação válida fornecida para atualizar o funcionário {id_funci}.')
        try:
             response = supabase.table(TABELA_FUNCIONARIOS).select('*').eq('idFunci', id_funci).limit(1).execute()
             return response.data[0] if response.data else None
        except Exception:
             return None
    
    try:
        response = supabase.table(TABELA_FUNCIONARIOS).update(dados_update).eq('idFunci', id_funci).execute()
        if response.data:
            print(f'As informações do usuario {id_funci} foi atualizada no banco de dados!')
            return response.data[0]
    except Exception as e:
        print('Falha ao editar funcionario!')
        return None

def criar_id_personalizado_funci(ultimo_id):
    if not ultimo_id:
        return 'f001'
    id_atual = int(ultimo_id[1:])
    id = id_atual+1
    novoID = f'f{id:03d}'
    return novoID

def adicionar_usuario(email, nome, senha, getBool):
    response_ultimo = supabase.table(TABELA_FUNCIONARIOS).select('idFunci').order('idFunci', desc=True).limit(1).execute() 
    ultimo_id = None
    if response_ultimo.data:
        ultimo_id = response_ultimo.data[0]['idFunci']
    id_funci = criar_id_personalizado_funci(ultimo_id)

    response = supabase.table(TABELA_FUNCIONARIOS).select('idFunci').eq('idFunci', id_funci).limit(1).execute()
    if len(response.data) > 0:
        return print(f"Usuário '{id_funci}' já existe no banco de dados.")
    cripto_senha = argon2.generate_password_hash(senha)
    dados_insert = {
        'idFunci': id_funci, 
        'email': email, 
        'nome': nome, 
        'senha': cripto_senha,
        'autoridade': getBool
    }
    return_ = supabase.table(TABELA_FUNCIONARIOS).insert(dados_insert, count=None).execute()
    print(f"Usuário '{nome}' foi adicionado no banco de dados.")
    return True

def VerificarLogin(email, senha):
    response = supabase.table(TABELA_FUNCIONARIOS).select('*').eq('email', email).limit(1).execute()
    if len(response.data) > 0:
        funcionario = response.data[0]
        cripto_senha = funcionario.get('senha')
        if argon2.check_password_hash(cripto_senha, senha) == True:
            return response.data[0]
        else: return None
    else: return None

def criar_id_personalizado_chamado(ultimo_id):
    if not ultimo_id:
        return 'c001'
    id_atual = int(ultimo_id[1:])
    id = id_atual+1
    novoID = f'c{id:03d}'
    return novoID


def adicionarChamado(id_local, descricao):
    response = supabase.table(TABELA_LOCAIS).select('idLocal').eq('idLocal', id_local).limit(1).execute()
    if len(response.data) > 0:
        response_ultimo = supabase.table(TABELA_CHAMADOS).select('idChamado').order('idChamado', desc=True).limit(1).execute()
        
        ultimo_id = None
        if response_ultimo.data:
            ultimo_id = response_ultimo.data[0]['idChamado']
        id = criar_id_personalizado_chamado(ultimo_id)

        data_hora_atual = datetime.datetime.now()
        data = data_hora_atual.date().isoformat()
        hora = data_hora_atual.time().isoformat()
        dados_insert = {
            'idChamado': id,
            'descricao': descricao,
            'dataAbertura': data,
            'dataFechamento': None,
            'horaAbertura': hora,
            'horaFechamento': None,
            'aberto': True,
            'fk_Local_idLocal': id_local,
            'fk_Funcionario_idFunci': None
        }
        supabase.table(TABELA_CHAMADOS).insert(dados_insert, count=None).execute()
        print(f'O chamado foi adicionado')
        return True

def carregarChamados():
    try:
        response = supabase.table(TABELA_CHAMADOS).select('*').execute()
        return response.data
    except Exception as e:
        print('Erro ao carregar os chamados')
        return []

def carregarLocais():
    try:
        response = supabase.table(TABELA_LOCAIS).select('*').execute()
        return response.data
    except Exception as e:
        print('Erro ao carregar os locais')
        return []

def carregarFuncionarios():
    try:
        response = supabase.table(TABELA_FUNCIONARIOS).select('*').execute()
        return response.data
    except Exception as e:
        print('Erro ao carregar os funcionarios!')
        return []

#if __name__=='__main__':
    #adicionar_usuario_teste('gabriel.izidoro@sigma.com', 'Gabriel', 'Fatec123', True)