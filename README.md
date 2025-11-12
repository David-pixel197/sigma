# Projeto SIGMA (Sistema Integrado de Gestão de Manutenção)

Este é um projeto de um sistema de gestão de chamados de manutenção (Ordens de Serviço), focado no registro e acompanhamento de chamados para infraestrutura e equipamentos.

## 🎯 Funcionalidades Planejadas

  * **Formulário de Abertura:** Usuários (funcionários ou visitantes) podem abrir um novo chamado, selecionando o local e descrevendo o problema.
  * **Autenticação:** Funcionários podem logar com `idFunci` (ou email) e senha.
  * **Dashboard de Gerenciamento:**
      * Listagem de todos os chamados.
      * Filtros personalizados (por status, atribuição).
      * Ordenação (por data, local).
      * Sistema de "Autoridade": Usuários com autoridade podem gerenciar funcionários e locais, e atribuir chamados livremente.
      * Usuários normais podem se atribuir a chamados não designados.
      * Cards de chamado expansíveis para ver detalhes (descrição do problema e do local).
      * Funcionários podem fechar e reabrir chamados.
  * **Gerenciamento (Admin):**
      * CRUD completo (Criar, Ler, Atualizar, Deletar) para Funcionários.
      * CRUD completo (Criar, Ler, Atualizar, Deletar) para Locais.
  * **Modo Claro/Escuro:** O app possui um seletor de tema que persiste no navegador.

-----

## 🔌 Contrato da API (Back-End)

Para que o front-end (React) funcione corretamente no "Modo Real" (`MODO_MOCK = false`), o back-end deve implementar os seguintes endpoints:

### Geral

  * **CORS:** A API deve habilitar o CORS (Cross-Origin Resource Sharing) para a URL do front-end (ex: `http://localhost:3000`).
  * **Formato:** Todas as requisições e respostas devem ser no formato **JSON**.
  * **Erros:** A API deve retornar códigos de status HTTP apropriados (ex: `400`, `401`, `404`, `500`) em caso de falha. O front-end está programado para exibir a mensagem de erro da API.

### Tela de Login

#### POST /api/login

  * **O que faz:** Autentica um usuário.
  * **JSON enviado pelo Front-end:**
    ```json
    {
      "idFunci": "david@empresa.com",
      "senha": "123"
    }
    ```
  * **Resposta Esperada (Sucesso: 200 OK):**
    O front-end espera receber de volta um objeto `user` que contenha pelo menos:
    ```json
    {
      "user": {
        "idFunc": "f123",
        "nome": "David (Admin)",
        "email": "david@empresa.com",
        "autoridade": true
      }
      // "token": "jwt.token.aqui" (Opcional, mas recomendado)
    }
    ```
  * **Resposta (Falha: 401 Unauthorized):** Se o login ou senha estiverem errados.

### Tela de Formulário de Chamado

#### GET /api/locais

  * **O que faz:** Busca a lista de todos os locais para preencher o `<select>`.
  * **Resposta Esperada (Sucesso: 200 OK):**
    Um array de objetos. As chaves `idLocal` e `nome` são obrigatórias.
    ```json
    [
      { "idLocal": "101", "nome": "Sala de Reuniões 101", "descricao": "..." },
      { "idLocal": "102", "nome": "Copa - 1º Andar", "descricao": "..." }
    ]
    ```

#### POST /api/chamados

  * **O que faz:** Cria um novo chamado.
  * **JSON enviado pelo Front-end:**
    ```json
    {
      "idLocal": "101",
      "descricao": "O projetor não está ligando."
    }
    ```
  * **Resposta Esperada (Sucesso: 201 Created):** Opcional. Pode retornar o chamado criado.

### Tela do Dashboard

#### GET /api/me (Recomendado para Autenticação)

  * **O que faz:** Busca os dados do usuário atualmente logado (usando um token).
  * **Resposta Esperada (Sucesso: 200 OK):**
    O objeto do usuário (o mesmo do `POST /api/login`).
    ```json
    {
      "idFunci": "f123",
      "nome": "David (Admin)",
      "email": "david@empresa.com",
      "autoridade": true
    }
    ```

#### GET /api/chamados

  * **O que faz:** Busca a lista de todos os chamados.
  * **Resposta Esperada (Sucesso: 200 OK):**
    Um array de objetos. As chaves devem ser consistentes com o banco de dados.
    ```json
    [
      {
        "idChamado": "c001",
        "descricao": "O projetor...",
        "dataAbertura": "2023-10-28",
        "horaAbertura": "09:15:00",
        "aberto": true,
        "fk_Local_idLocal": "101",
        "fk_Funcionario_idFunc": "f123"
      }
    ]
    ```

#### GET /api/funcionarios

  * **O que faz:** Busca a lista de funcionários (para o `<select>` de atribuição do admin).
  * **Resposta Esperada (Sucesso: 200 OK):**
    Um array de objetos. `idFunc` e `nome` são obrigatórios.
    ```json
    [
      { "idFunc": "f123", "nome": "David (Admin)" },
      { "idFunc": "f456", "nome": "Ana Supervisora" }
    ]
    ```

#### PATCH /api/chamados/:idChamado

  * **O que faz:** Atualiza um chamado existente. O front-end usa isso para atribuir um funcionário ou mudar o status (aberto/fechado).
  * **URL (Exemplo):** `/api/chamados/c001`
  * **JSON enviado (Para atribuir):**
    ```json
    {
      "fk_Funcionario_idFunc": "f456"
    }
    ```
  * **JSON enviado (Para fechar):**
    ```json
    {
      "aberto": false
    }
    ```
  * **Resposta Esperada (Sucesso: 200 OK):**
    O objeto do chamado completo e atualizado.
    ```json
    {
      "idChamado": "c001"
      // ... todos os campos do chamado
    }
    ```

### Telas de Gerenciamento (Admin)

Estes endpoints são para as páginas de CRUD (`/admin/funcionarios` e `/admin/locais`).

#### POST /api/funcionarios

  * **O que faz:** Cria um novo funcionário.
  * **JSON enviado pelo Front-end:**
    ```json
    {
      "nome": "Novo Usuário",
      "email": "novo@email.com",
      "senha": "nova-senha-123",
      "autoridade": false
    }
    ```
  * **Resposta Esperada (Sucesso: 201 Created):** O objeto do novo funcionário criado.

#### PUT /api/funcionarios/:idFunc

  * **O que faz:** Atualiza um funcionário existente.
  * **URL (Exemplo):** `/api/funcionarios/f123`
  * **JSON enviado pelo Front-end:**
    (A senha é opcional; se for enviada em branco, o back-end deve ignorá-la).
    ```json
    {
      "idFunc": "f123",
      "nome": "Nome Atualizado",
      "email": "email@atualizado.com",
      "senha": "",
      "autoridade": true
    }
    ```
  * **Resposta Esperada (Sucesso: 200 OK):** O objeto do funcionário atualizado.

#### DELETE /api/funcionarios/:idFunc

  * **O que faz:** Deleta um funcionário.
  * **URL (Exemplo):** `/api/funcionarios/f456`
  * **Resposta Esperada (Sucesso: 204 No Content):** Uma resposta vazia.

#### POST /api/locais

  * **O que faz:** Cria um novo local.
  * **JSON enviado pelo Front-end:**
    ```json
    {
      "nome": "Nova Sala",
      "descricao": "Nova descrição do local..."
    }
    ```
  * **Resposta Esperada (Sucesso: 201 Created):** O objeto do novo local criado.

#### PUT /api/locais/:idLocal

  * **O que faz:** Atualiza um local existente.
  * **URL (Exemplo):** `/api/locais/101`
  * **JSON enviado pelo Front-end:**
    ```json
    {
      "idLocal": "101",
      "nome": "Nome do Local Atualizado",
      "descricao": "Descrição atualizada."
    }
    ```
  * **Resposta Esperada (Sucesso: 200 OK):** O objeto do local atualizado.

#### DELETE /api/locais/:idLocal

  * **O que faz:** Deleta um local.
  * **URL (Exemplo):** `/api/locais/101`
  * **Resposta Esperada (Sucesso: 204 No Content):** Uma resposta vazia.

-----

## 💡 Simulação (MODO\_MOCK)

Enquanto o back-end não está pronto, o front-end opera em `MODO_MOCK = true`.

  * **Onde configurar:** A flag `MODO_MOCK` está no topo dos seguintes arquivos:
      * `src/context/AuthContext.js`
      * `src/pages/Formulario/Formulario.js`
      * `src/pages/Login/Login.js`
      * `src/pages/Dashboard/Dashboard.js`
      * `src/pages/AdminFuncionarios/AdminFuncionarios.js`
      * `src/pages/AdminLocais/AdminLocais.js`
  * **Dados Falsos:** Os dados de simulação estão na pasta `public/mock/`. Você pode editar esses arquivos JSON para testar diferentes cenários.
