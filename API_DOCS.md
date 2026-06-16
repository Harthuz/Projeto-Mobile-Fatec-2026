# Documentação da Pokémon API

Esta documentação detalha os endpoints da **Pokémon API** extraídos a partir da coleção do Postman.

A API é dividida em dois domínios principais:
1. **Autenticação e Perfil (Auth API)**: Registro, login e gerenciamento de estatísticas/perfil do usuário.
2. **Gerenciamento de Pokémons (Pokemon API)**: Gerenciamento do time e dos Pokémons capturados pelo usuário.

---

## 🌐 Endereços Base (Base URLs)

A maioria dos endpoints consome o ambiente de produção na AWS, com exceção do endpoint de atualizar o time, que está configurado como localhost por padrão na coleção fornecida.

*   **Ambiente de Produção (AWS):**
    `https://lnh1dhp1mj.execute-api.us-east-1.amazonaws.com/api-pokemon`
*   **Ambiente Local (Desenvolvimento):**
    `http://localhost:8080/api-pokemon`

> [!WARNING]
> O endpoint **Atualizar Time** está configurado para `localhost:8080` na coleção original. Lembre-se de alterar para a URL da AWS no ambiente de produção se necessário.

---

## 🔑 Autenticação

Todos os endpoints na coleção fornecida estão marcados como **No Auth** (Sem autenticação direta por cabeçalhos como Bearer Token). A identificação do usuário é feita por meio do `user-id` passado como parâmetro de rota (Path) ou na query da requisição (Query Parameter).

---

## 📁 1. Autenticação e Estatísticas (Auth API)

### Registrar Usuário
Cria uma nova conta de usuário para interagir com o sistema de Pokémons.

*   **Método:** `POST`
*   **Endpoint:** `/auth/v1/register`
*   **URL Completa:** `https://lnh1dhp1mj.execute-api.us-east-1.amazonaws.com/api-pokemon/auth/v1/register`
*   **Corpo da Requisição (JSON):**
    ```json
    {
      "username": "kleber",
      "password": "Senha@Senha"
    }
    ```
*   **Exemplo de Chamada (cURL):**
    ```bash
    curl -X POST "https://lnh1dhp1mj.execute-api.us-east-1.amazonaws.com/api-pokemon/auth/v1/register" \
         -H "Content-Type: application/json" \
         -d '{"username": "kleber", "password": "Senha@Senha"}'
    ```

---

### Login de Usuário
Autentica o usuário e permite obter seu identificador único.

*   **Método:** `POST`
*   **Endpoint:** `/auth/v1/login`
*   **URL Completa:** `https://lnh1dhp1mj.execute-api.us-east-1.amazonaws.com/api-pokemon/auth/v1/login`
*   **Corpo da Requisição (JSON):**
    ```json
    {
      "username": "kleber",
      "password": "Senha@Senha"
    }
    ```
*   **Exemplo de Chamada (cURL):**
    ```bash
    curl -X POST "https://lnh1dhp1mj.execute-api.us-east-1.amazonaws.com/api-pokemon/auth/v1/login" \
         -H "Content-Type: application/json" \
         -d '{"username": "kleber", "password": "Senha@Senha"}'
    ```

---

### Retornar Perfil (Estatísticas)
Recupera os dados de perfil (como nível, vitórias e derrotas) associados a um usuário.

*   **Método:** `GET`
*   **Endpoint:** `/auth/v1/stats/{user-id}`
*   **URL Completa:** `https://lnh1dhp1mj.execute-api.us-east-1.amazonaws.com/api-pokemon/auth/v1/stats/65888ffb-ed2a-4446-89c7-31723970c612`
*   **Parâmetros de Rota (Path Params):**
    *   `user-id` (String/UUID): ID do usuário cujos dados de perfil serão buscados.
*   **Exemplo de Chamada (cURL):**
    ```bash
    curl -X GET "https://lnh1dhp1mj.execute-api.us-east-1.amazonaws.com/api-pokemon/auth/v1/stats/65888ffb-ed2a-4446-89c7-31723970c612"
    ```

---

### Atualizar Perfil (Estatísticas)
Atualiza as estatísticas do usuário (nível, vitórias e derrotas).

*   **Método:** `PUT`
*   **Endpoint:** `/auth/v1/stats/{user-id}`
*   **URL Completa:** `https://lnh1dhp1mj.execute-api.us-east-1.amazonaws.com/api-pokemon/auth/v1/stats/65888ffb-ed2a-4446-89c7-31723970c612`
*   **Parâmetros de Rota (Path Params):**
    *   `user-id` (String/UUID): ID do usuário cujas estatísticas serão atualizadas.
*   **Corpo da Requisição (JSON):**
    ```json
    {
      "level": "1",
      "vitorias": "1",
      "derrotas": "0"
    }
    ```
*   **Exemplo de Chamada (cURL):**
    ```bash
    curl -X PUT "https://lnh1dhp1mj.execute-api.us-east-1.amazonaws.com/api-pokemon/auth/v1/stats/65888ffb-ed2a-4446-89c7-31723970c612" \
         -H "Content-Type: application/json" \
         -d '{"level": "1", "vitorias": "1", "derrotas": "0"}'
    ```

---

## 📁 2. Gerenciamento de Pokémons e Times (Pokemon API)

### Retornar Time
Retorna o time atual de Pokémons ativos do usuário.

*   **Método:** `GET`
*   **Endpoint:** `/pokemon/v1/team`
*   **URL Completa:** `https://lnh1dhp1mj.execute-api.us-east-1.amazonaws.com/api-pokemon/pokemon/v1/team?user-id=65888ffb-ed2a-4446-89c7-31723970c612`
*   **Parâmetros de Query (Query Params):**
    *   `user-id` (String/UUID): O identificador do usuário.
*   **Exemplo de Chamada (cURL):**
    ```bash
    curl -X GET "https://lnh1dhp1mj.execute-api.us-east-1.amazonaws.com/api-pokemon/pokemon/v1/team?user-id=65888ffb-ed2a-4446-89c7-31723970c612"
    ```

---

### Atualizar Time
Substitui um Pokémon por outro no time do usuário.

*   **Método:** `PUT`
*   **Endpoint:** `/pokemon/v1/team`
*   **URL Completa (Original):** `localhost:8080/api-pokemon/pokemon/v1/team?user-id=d1a89d64-8298-4999-9011-00bbe3b2c415&removed-pokemon=29&new-pokemon=100`
*   **URL Completa (Produção AWS):** `https://lnh1dhp1mj.execute-api.us-east-1.amazonaws.com/api-pokemon/pokemon/v1/team?user-id=d1a89d64-8298-4999-9011-00bbe3b2c415&removed-pokemon=29&new-pokemon=100`
*   **Parâmetros de Query (Query Params):**
    *   `user-id` (String/UUID): ID do usuário do time.
    *   `removed-pokemon` (Integer/String): ID do Pokémon a ser removido (ex: `29`).
    *   `new-pokemon` (Integer/String): ID do Pokémon a ser adicionado (ex: `100`).
*   **Corpo da Requisição:** Vazio.
*   **Exemplo de Chamada (cURL):**
    ```bash
    curl -X PUT "https://lnh1dhp1mj.execute-api.us-east-1.amazonaws.com/api-pokemon/pokemon/v1/team?user-id=d1a89d64-8298-4999-9011-00bbe3b2c415&removed-pokemon=29&new-pokemon=100" \
         -H "Content-Length: 0"
    ```

---

### Adicionar Pokémon Capturado
Adiciona um novo Pokémon à lista de capturas do usuário.

*   **Método:** `PUT`
*   **Endpoint:** `/pokemon/v1/captured`
*   **URL Completa:** `https://lnh1dhp1mj.execute-api.us-east-1.amazonaws.com/api-pokemon/pokemon/v1/captured?user-id=65888ffb-ed2a-4446-89c7-31723970c61&pokemon-id=100`
*   **Parâmetros de Query (Query Params):**
    *   `user-id` (String/UUID): ID do usuário.
    *   `pokemon-id` (Integer/String): ID do Pokémon capturado (ex: `100`).
*   **Corpo da Requisição:** Vazio.
*   **Exemplo de Chamada (cURL):**
    ```bash
    curl -X PUT "https://lnh1dhp1mj.execute-api.us-east-1.amazonaws.com/api-pokemon/pokemon/v1/captured?user-id=65888ffb-ed2a-4446-89c7-31723970c61&pokemon-id=100" \
         -H "Content-Length: 0"
    ```

---

### Deletar Pokémon Capturado
Remove um Pokémon da lista de capturados do usuário.

*   **Método:** `DELETE`
*   **Endpoint:** `/pokemon/v1/captured`
*   **URL Completa:** `https://lnh1dhp1mj.execute-api.us-east-1.amazonaws.com/api-pokemon/pokemon/v1/captured?user-id=65888ffb-ed2a-4446-89c7-31723970c612&pokemon-id=100`
*   **Parâmetros de Query (Query Params):**
    *   `user-id` (String/UUID): ID do usuário.
    *   `pokemon-id` (Integer/String): ID do Pokémon a ser removido (ex: `100`).
*   **Exemplo de Chamada (cURL):**
    ```bash
    curl -X DELETE "https://lnh1dhp1mj.execute-api.us-east-1.amazonaws.com/api-pokemon/pokemon/v1/captured?user-id=65888ffb-ed2a-4446-89c7-31723970c612&pokemon-id=100"
    ```
