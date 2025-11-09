import os
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

def adicionar_usuario_teste(id_funci, nome, senha, getBool):
    response = supabase.table(TABELA_FUNCIONARIOS).select('idFunci').eq('idFunci', id_funci).limit(1).execute()
    if len(response.data) > 0:
        return print(f"Usuário '{id_funci}' já existe no banco de dados.")
    cripto_senha = argon2.generate_password_hash(senha)
    dados_insert = {
        'idFunci': id_funci, 
        'nome': nome, 
        'senha': cripto_senha,
        'autoridade': getBool
    }
    supabase.table(TABELA_FUNCIONARIOS).insert(dados_insert, count=None).execute()
    print(f"Usuário '{id_funci}' foi adicionado no banco de dados.")

def adicionarLocais(id_local, nome, descricao):
    response = supabase.table(TABELA_LOCAIS).select('idLocal').eq('idLocal', id_local).limit(1).execute()
    if len(response.data) > 0:
        return print('O local já existe no banco de dados!')
    dados_insert = {
        'idLocal': id_local,
        'nome': nome,
        'descricao': descricao
    }
    supabase.table(TABELA_LOCAIS).insert(dados_insert, count=None).execute()
    print(f'Local {nome}[{id_local}] foi adicionado no banco de dados')

def carregarLocais():
    try:
        response = supabase.table(TABELA_LOCAIS).select('*').execute()
        return response.data
    except Exception as e:
        print('Erro ao carregar os locais')
        return []


def VerificarLogin(id_funci, senha):
    response = supabase.table(TABELA_FUNCIONARIOS).select('*').eq('idFunci', id_funci).limit(1).execute()
    if len(response.data) > 0:
        funcionario = response.data[0]
        cripto_senha = funcionario.get('senha')
        if argon2.check_password_hash(cripto_senha, senha) == True:
            return response.data[0]
        else: return None
    else: return None  

#if __name__=='__main__':