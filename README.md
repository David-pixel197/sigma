# Projeto SIGMA (Sistema Integrado de Gestão de Manutenção)

Este é o repositório front-end do projeto SIGMA, um sistema de gestão de chamados de manutenção. O objetivo é criar uma interface web limpa, moderna e responsiva para o registro e acompanhamento de ordens de serviço.

## 🎯 Objetivos do Projeto

  * **Formulário de Abertura:** Permitir que qualquer usuário possa abrir um novo chamado de manutenção de forma simples.
  * **Autenticação:** Criar uma área restrita (login) para que funcionários da manutenção possam gerenciar os chamados.
  * **Dashboard de Gestão:** Uma tela onde os funcionários podem visualizar, filtrar e fechar chamados abertos.
  * **Design Moderno:** Implementar um tema claro/escuro (dark mode) com troca fácil.
  * **Integração com QR Code:** (Futuro) Permitir que um QR Code em um local físico preencha automaticamente o campo "Local" no formulário.

## 🚀 Tecnologias (Front-End)

  * **React:** Biblioteca principal para a construção da interface.
  * **React Router DOM:** Para gerenciamento das rotas (páginas).
  * **React Context:** Para gerenciamento do estado global (ex: Tema Escuro, Autenticação).
  * **CSS Moderno:** Variáveis CSS para o sistema de temas.

## 🛠️ Como Rodar o Projeto

1.  **Clone o repositório:**

    ```bash
    git clone https://github.com/David-pixel197/sigma
    cd sigma
    ```

2.  **Instale as dependências:**
    (Certifique-se de ter o Node.js e o npm instalados)

    ```bash
    npm install
    ```

3.  **Crie o arquivo de ambiente:**
    Na raiz do projeto, crie um arquivo chamado `.env`.
    Adicione η seguinte linha a ele (esta é η URL base para o seu back-end):

    ```dotenv
    REACT_APP_API_URL=http://localhost:5000/api
    ```

4.  **Rode o servidor de desenvolvimento:**

    ```bash
    npm start
    ```

    O projeto abrirá automaticamente em `http://localhost:3000`.

## 🔌 Contrato da API (Instruções para o Back-End)

Para que o front-end funcione sem alterações, o back-end (API) deve seguir rigorosamente os seguintes "contratos" de URLs e formatos de dados (JSON).

> **💡 Simulação (MODO\_MOCK)**
>
> Enquanto o back-end não está pronto, o front-end opera em `MODO_MOCK`.
>
>   * **O que é?** Uma variável booleana (`true`/`false`) que simula requisições de API usando arquivos locais e `setTimeout`.
>   * **Onde encontrar?** No topo dos seguintes arquivos:
>       * `src/pages/Formulario/Formulario.js`
>       * `src/pages/Login/Login.js`
>
> Para testar o front-end com a API real, basta mudar esta variável para `false` e reiniciar o app.

-----

### 1\. Tela de Formulário de Chamado (`src/pages/Formulario/Formulario.js`)

#### GET /api/locais

  * **Contexto:** Chamado quando a página `Formulario` carrega, para preencher o `<select>`.
  * **Formato de Resposta (JSON):** A API deve retornar um *array* de objetos. Cada objeto deve ter as chaves `idLocal` e `nome`.
  * **Exemplo de Resposta (JSON):**
    ```json
    [
      { "idLocal": "101", "nome": "Sala de Reuniões 101" },
      { "idLocal": "102", "nome": "Copa - 1º Andar" },
      { "idLocal": "201", "nome": "Escritório 201 (Ala Norte)" }
    ]
    ```

#### POST /api/chamados

  * **Contexto:** Chamado quando o usuário clica em "Enviar Chamado".
  * **Formato de Envio (JSON):** O front-end enviará um objeto JSON no `body` da requisição com as chaves `idLocal` e `descricao`.
  * **Exemplo de Envio (JSON):**
    ```json
    {
      "idLocal": "102",
      "descricao": "A máquina de café quebrou."
    }
    ```
  * **Resposta de Sucesso:** A API deve retornar um status `201 Created` ou `200 OK`.
  * **Resposta de Erro:** A API deve retornar um status de erro (ex: `400` ou `500`) com uma mensagem. O front-end exibirá essa mensagem.

### 2\. Tela de Login (`src/pages/Login/Login.js`)

#### POST /api/login

  * **Contexto:** Chamado quando o funcionário clica em "Entrar".
  * **Formato de Envio (JSON):** O front-end enviará um objeto JSON no `body` da requisição com as chaves `idFunci` e `senha`.
  * **Exemplo de Envio (JSON):**
    ```json
    {
      "idFunci": "funcionario@empresa.com",
      "senha": "senha123"
    }
    ```
  * **Resposta de Sucesso (Status `200 OK`):**
      * A API deve validar o `idFunci` e a senha. Se estiverem corretos, deve retornar um status `200 OK`.
      * (Opcional/Futuro: A API deve gerar e retornar um Token JWT para autenticação, mas por enquanto o front-end só precisa do status de sucesso para redirecionar).
  * **Resposta de Erro (Status `401 Unauthorized` ou `400`):**
      * Se o `idFunci` ou a senha estiverem incorretos, a API deve retornar um status de erro (ex: `401`).
      * O front-end está programado para capturar isso e exibir η mensagem "Login ou senha inválidos."
