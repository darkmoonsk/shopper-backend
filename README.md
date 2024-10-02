# API de Leitura de Medidores de Água e Gás

## Descrição

uma API RESTful desenvolvida em Node.js com Nest, TypeScript e Postgres com uso da API do gemini para gerenciar a leitura individualizada de consumo de água e gás baseado em imagem. A API utiliza uma arquitetura limpa e respeita os padrões do Clean Code.

## Funcionalidades

A API possui três endpoints:

- **POST /upload**: responsável por receber uma imagem em base 64, consultar o Gemini e retornar a medida lida pela API.
- **PATCH /confirm**: responsável por confirmar ou corrigir o valor lido pelo LLM.
- **GET /:customerCode/list**: responsável por listar as medidas realizadas por um determinado cliente.

## Tecnologias Utilizadas

- Node.js
- Nest.js
- TypeScript
- Docker
- Google Gemini API

## Documentação de Instalação

1.  Clone o repositório.
2.  Instale as dependências com `npm install`.
3.  Configure o arquivo `.env` com a chave da API do Gemini.
4.  Execute o Docker Compose com `docker-compose up`.

## Documentação de Uso

- **POST /upload**:

  - Request Body: `{ "image": "base64", "customer_code": "string", "measure_datetime": "datetime", "measure_type": "WATER" ou "GAS" }`
  - Response Body: `200: { "image_url": string, "measure_value": integer, "measure_uuid": string }`

- **PATCH /confirm**:

  - Request Body: `{ "measure_uuid": "string", "confirmed_value": integer }`
  - Response Body: `200: {"success": true }`

- **GET /<customer code>/list**:

  - Request Query Parameters: `?measure_type=WATER` ou `?measure_type=GAS` (opcional)
  - Response Body: `200: {"customer_code": string, "measures": [ {...}, {...} ]}`

## Problemas Conhecidos

- [ Gemini API pode retornar erros inesperados ]

## Licença

Esse projeto é licenciado sob a licença MIT.
