# SIGMA (Sistema Integrado de Gestão de Manutenção)

Este é o repositório do projeto SIGMA, um sistema de gestão de chamados de manutenção. O projeto é composto por um front-end moderno em React e (futuramente) uma API de back-end para gerenciar os dados.

## 1\. Objetivo do Projeto

O objetivo principal é criar uma interface web simples e intuitiva para o registro e acompanhamento de ordens de serviço (O.S.) focadas na manutenção de infraestrutura e equipamentos.

O sistema deve atender a dois perfis de usuário:

  * **Usuário Padrão (Colaborador):** Qualquer pessoa que precise abrir um chamado. A interface deve ser rápida, de preferência com preenchimento automático do local (via QR Code).
  * **Usuário Técnico (Funcionário da Manutenção):** Um usuário logado que pode visualizar todos os chamados abertos, gerenciar seus status (ex: "Aberto", "Em Andamento", "Fechado") e tomar as ações necessárias.

## 2\. Funcionalidades Planejadas

  - [x] **Interface de Formulário:** Tela inicial para abertura de novos chamados, com seleção de local e campo de descrição.
  - [x] **Páginas e Navegação:** Estrutura de rotas (Home, Login, Dashboard) usando `react-router-dom`.
  - [x] **Modo Escuro (Dark/Light):** Botão no cabeçalho para alternar o tema da aplicação, com persistência no `localStorage`.
  - [x] **Lógica de API Simulada (Mock):** O front-end está pronto para se conectar a uma API, usando dados falsos (`mock/locais.json`) por enquanto.
  - [ ] **Back-End (API):** Servidor para conectar ao banco de dados e gerenciar a lógica de negócios.
  - [ ] **Sistema de Login:** Autenticação para os funcionários da manutenção.
  - [ ] **Painel de Gerenciamento:** Tela onde os funcionários logados verão e atualizarão os chamados.
  - [ ] **Leitura de QR Code:** Funcionalidade para ler um QR Code e preencher automaticamente o campo "Local" no formulário.

## 3\. Tecnologias (Front-End)

  * **React:** Biblioteca principal para a construção da interface.
  * **React Router (`react-router-dom`):** Para gerenciamento das rotas e navegação entre páginas.
  * **React Context:** Utilizado para o gerenciamento global do Tema (Modo Escuro).
  * **Variáveis de Ambiente (`.env`):** Para armazenar a URL da API de forma segura e organizada.

## 4\. Como Rodar o Front-End (Desenvolvimento)

1.  Clone este repositório:
    ```bash
    git clone https://github.com/David-pixel197/sigma
    cd sigma
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  Crie o arquivo de variáveis de ambiente. Na raiz do projeto (`sigma/`), crie um arquivo chamado `.env` e adicione a URL base da sua API (mesmo que ela ainda não exista):
    ```dotenv
    # .env
    REACT_APP_API_URL=http://localhost:5000/api
    ```
4.  Inicie o servidor de desenvolvimento:
    ```bash
    npm start
    ```
    O aplicativo estará disponível em `http://localhost:3000`.

> **Sobre o Modo de Simulação (Mock Mode):**
> Enquanto o Back-End não está pronto, o projeto roda em `MODO_MOCK = true`. Esta constante pode ser encontrada no topo do arquivo `src/pages/Formulario/Formulario.js`. Ao mudar para `false`, o componente tentará se conectar à API real definida no `.env`.

## 5\. Tutorial: Como Construir a API (Back-End)

Para que o front-end pare de usar dados simulados, o seu servidor de back-end (API) precisa seguir um "contrato" específico.

> **NOTA IMPORTANTE:** As instruções abaixo referem-se apenas à tela de Formulário de Chamado (`src/pages/Formulario/Formulario.js`). As futuras telas (como Login e Dashboard) terão seus próprios requisitos de API (ex: `POST /api/login`, `GET /api/dashboard/chamados`, etc.).

### Ponto 1: O Contrato de Formato (JSON)

Sua API deve enviar e receber dados no formato JSON. O front-end está programado para entender chaves (keys) com nomes específicos.

**A. Para a Lista de Locais (GET)**

  * **Endpoint Esperado:** `GET /api/locais`
  * **O que o Front-end espera receber:** Um array de objetos.
  * **Chaves Obrigatórias:** `idLocal` e `nome`.
  * Exemplo de resposta JSON válida da API:
    ```json
    [
      { "idLocal": "101", "nome": "Sala de Reuniões 101" },
      { "idLocal": "102", "nome": "Copa - 1º Andar" }
    ]
    ```

**B. Para Enviar um Novo Chamado (POST)**

  * **Endpoint Esperado:** `POST /api/chamados`
  * **O que o Front-end vai enviar:** Um objeto no corpo (body) da requisição.
  * **Chaves Enviadas:** `idLocal` e `descricao`.
  * Exemplo de JSON que a API vai receber:
    ```json
    {
      "idLocal": "102",
      "descricao": "A máquina de café quebrou."
    }
    ```

### Ponto 2: A Armadilha do CORS

Como seu React (Front-End) roda na porta 3000 (`localhost:3000`) e sua API (Back-End) provavelmente rodará em outra (ex: `localhost:5000`), o navegador vai bloquear a comunicação por padrão.

**Solução:** Sua API precisa permitir requisições vindas do `http://localhost:3000`.

Se você usar **Flask (Python)**, a biblioteca `flask-cors` resolve isso com uma linha de código:

```python
from flask_cors import CORS

CORS(app) # Permite todas as origens

# ou
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}}) # Mais seguro
```

### Ponto 3: Métodos e Status HTTP

O front-end reage de acordo com o código de status da sua API.

  * **`GET /api/locais`:**
      * **Sucesso:** Retorne os dados com status `200 OK`.
  * **`POST /api/chamados`:**
      * **Sucesso:** Retorne uma confirmação (pode ser o chamado criado) com status `201 Created` ou `200 OK`.
  * **Qualquer Erro:**
      * Se algo der errado (ex: dados faltando, banco de dados fora do ar), não retorne um status `200`. Retorne um status de erro, como `400 Bad Request` ou `500 Internal Server Error`.
      * O front-end está programado (`if (!response.ok)`) para capturar esses erros e mostrar a mensagem de falha ao usuário.

-----

O documento está formatado\! O tutorial do back-end menciona o uso de Python/Flask. Você gostaria de ajuda para criar o código básico dessa API em Flask para seguir esse "contrato"?