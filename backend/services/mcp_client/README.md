# MCP Orchestrator - API REST

Orquestrador de múltiplos MCP servers usando Gemini para decisão inteligente de ferramentas.

## Servidores MCP Conectados

- **browser-use**: Navegação web automatizada
- **pubmedmcp**: Busca de artigos científicos no PubMed
- **ia-local-classifier**: Classificação de imagens com IA local (Ollama)

## Instalação

```bash
cd backend/services/mcp_client
npm install
```

## Configuração

### API Key do Gemini (Obrigatória)

```bash
export GEMINI_API_KEY="sua-chave-aqui"
```

**⚠️ IMPORTANTE:** A API key do Gemini é obrigatória para o sistema funcionar. Sem ela, todas as requisições ao `/query` retornarão erro estruturado solicitando retry.

## Executar

```bash
npm start
```

Ou em modo desenvolvimento (auto-reload):

```bash
npm run dev
```

O servidor inicia em: `http://localhost:3000`

## API Endpoints

### 1. Health Check

```bash
GET /health
```

**Resposta:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-12T20:00:00.000Z",
  "orchestrator": "connected"
}
```

### 2. Listar Ferramentas

Lista todas as ferramentas disponíveis de todos os servidores MCP.

```bash
GET /tools
```

**Resposta:**
```json
{
  "tools": [
    {
      "serverName": "ia-local-classifier",
      "name": "classify_image",
      "description": "Classifica uma imagem como GRÁFICO ou NÃO-GRÁFICO...",
      "inputSchema": {...}
    },
    ...
  ],
  "total": 3
}
```

### 3. Processar Consulta (Orquestração Inteligente)

O Gemini decide qual ferramenta usar baseado na consulta.

```bash
POST /query
Content-Type: application/json

{
  "query": "Classifique esta imagem: um gráfico de barras com dados de vendas"
}
```

**Resposta:**
```json
{
  "query": "Classifique esta imagem...",
  "timestamp": "2025-01-12T20:00:00.000Z",
  "success": true,
  "decision": {
    "tool_name": "classify_image",
    "server_name": "ia-local-classifier",
    "arguments": {
      "image_description": "um gráfico de barras com dados de vendas"
    },
    "reasoning": "Detectei intenção de classificação de imagem"
  },
  "result": [
    {
      "type": "text",
      "text": "Resultado da classificação:\n\n{...}"
    }
  ]
}
```

### 4. Executar Ferramenta Específica

Executa uma ferramenta diretamente sem passar pelo Gemini.

```bash
POST /execute
Content-Type: application/json

{
  "server_name": "ia-local-classifier",
  "tool_name": "classify_image",
  "arguments": {
    "image_description": "Um gráfico de pizza com 3 fatias coloridas"
  }
}
```

**Resposta:**
```json
{
  "server_name": "ia-local-classifier",
  "tool_name": "classify_image",
  "timestamp": "2025-01-12T20:00:00.000Z",
  "success": true,
  "result": [
    {
      "type": "text",
      "text": "Resultado da classificação:\n\n{...}"
    }
  ]
}
```

## Exemplos de Uso

### Com curl

```bash
# Health check
curl http://localhost:3000/health

# Listar ferramentas
curl http://localhost:3000/tools

# Consulta inteligente
curl -X POST http://localhost:3000/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Buscar artigos sobre COVID-19"}'

# Executar ferramenta específica
curl -X POST http://localhost:3000/execute \
  -H "Content-Type: application/json" \
  -d '{
    "server_name": "ia-local-classifier",
    "tool_name": "classify_image",
    "arguments": {
      "image_description": "Gráfico de linha mostrando temperatura ao longo do tempo"
    }
  }'
```

### Com JavaScript (fetch)

```javascript
// Consulta inteligente
const response = await fetch('http://localhost:3000/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'Classifique uma imagem de gráfico de barras'
  })
});

const result = await response.json();
console.log(result);
```

## Tratamento de Erros

O sistema retorna erros estruturados com códigos específicos que facilitam o tratamento no frontend.

### Estrutura de Erro

```json
{
  "success": false,
  "error": {
    "code": "GEMINI_OVERLOADED",
    "message": "O modelo Gemini está sobrecarregado. Tente novamente em alguns instantes.",
    "retryable": true,
    "retryAfter": 10,
    "timestamp": "2025-01-15T10:30:00.000Z"
  },
  "query": "buscar artigos sobre COVID-19"
}
```

### Códigos de Erro

#### Erros de Validação (4xx - não retryable)
- `MISSING_QUERY`: Campo 'query' não fornecido (400)
- `MISSING_PARAMETERS`: Campos obrigatórios ausentes (400)
- `INVALID_JSON`: JSON mal formatado (400)
- `ROUTE_NOT_FOUND`: Endpoint não existe (404)
- `SERVER_NOT_FOUND`: Servidor MCP não encontrado (404)

#### Erros do Gemini (5xx - retryable)
- `GEMINI_OVERLOADED`: Modelo sobrecarregado (503) - retry após 10s
- `GEMINI_RATE_LIMIT`: Limite de requisições atingido (429) - retry após 60s
- `GEMINI_UNAVAILABLE`: Serviço indisponível (503) - retry após 30s
- `GEMINI_PARSE_ERROR`: Erro ao interpretar resposta (500) - retry após 5s

#### Erros de Execução (5xx)
- `ORCHESTRATOR_NOT_INITIALIZED`: Serviço não inicializado (503) - retry após 5s
- `TOOL_EXECUTION_FAILED`: Erro ao executar ferramenta (500) - retry após 3s
- `INTERNAL_ERROR`: Erro interno genérico (500)

### Exemplo de Tratamento no Frontend

```javascript
async function queryMCP(userQuery) {
  try {
    const response = await fetch('http://localhost:3000/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: userQuery })
    });

    const result = await response.json();

    if (!result.success) {
      // Erro estruturado
      const { error } = result;

      if (error.retryable) {
        // Mostrar mensagem ao usuário
        alert(`${error.message}. Retente em ${error.retryAfter} segundos.`);

        // Retentar automaticamente
        setTimeout(() => queryMCP(userQuery), error.retryAfter * 1000);
      } else {
        // Erro não recuperável
        alert(`Erro: ${error.message}`);
      }
      return;
    }

    // Sucesso
    console.log(result.result);
  } catch (err) {
    console.error('Erro de rede:', err);
  }
}
```

## Documentação OpenAPI (Swagger)

A API está totalmente documentada usando OpenAPI 3.0. Veja o arquivo `openapi.yaml` para detalhes completos de todos os endpoints, schemas e exemplos de resposta.

### Visualizar Documentação

Você pode visualizar a documentação interativa usando qualquer ferramenta Swagger:

**Online (Swagger Editor):**
1. Acesse https://editor.swagger.io/
2. Cole o conteúdo de `openapi.yaml`

**Local (Swagger UI via Docker):**
```bash
docker run -p 8080:8080 -e SWAGGER_JSON=/app/openapi.yaml -v $(pwd)/openapi.yaml:/app/openapi.yaml swaggerapi/swagger-ui
```

Acesse: http://localhost:8080

## Arquitetura

```
┌─────────────┐
│   Cliente   │
└──────┬──────┘
       │ HTTP REST
       ▼
┌─────────────────────────────┐
│   MCP Orchestrator (API)    │
│  - Servidor HTTP (Node.js)  │
│  - Roteamento de requisições│
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│     Orchestrator.js         │
│  - Gemini (decisão)         │
│  - Gerenciamento de clients │
└──────┬──────────────────────┘
       │
       ├──────────┬──────────┬──────────┐
       ▼          ▼          ▼          ▼
   ┌────────┐ ┌────────┐ ┌────────┐
   │browser │ │pubmed  │ │ia-local│
   │  -use  │ │  mcp   │ │classify│
   └────────┘ └────────┘ └────────┘
```

## Troubleshooting

### ❌ Problema: "Connection closed" ao iniciar MCP Server

**Sintoma:** Servidor inicia mas logo mostra erro de conexão com um MCP específico.

**Causa:** Caminho incorreto ou absoluto no `.mcp.json`.

**Solução:**

1. Abra `backend/.mcp.json`
2. **Use caminhos relativos** ao invés de absolutos:

```json
{
  "mcpServers": {
    "test-mcp": {
      "command": "node",
      "args": ["../test_mcp/mcp_server_test.js"],  // ✅ Correto (relativo)
      "env": {}
    }
  }
}
```

**Evite:**
```json
"args": ["C:/projetos/nefarm-ai/backend/services/test_mcp/mcp_server_test.js"]  // ❌ Errado
```

---

### ❌ Problema: Erros do Gemini

**Sintoma:** Logs mostram erros relacionados ao Gemini (GEMINI_OVERLOADED, GEMINI_RATE_LIMIT, etc.).

**Causas possíveis:**

#### 1. Serviço Gemini sobrecarregado (503)

Este é um erro temporário. O sistema retorna:
```json
{
  "success": false,
  "error": {
    "code": "GEMINI_OVERLOADED",
    "retryable": true,
    "retryAfter": 10
  }
}
```

**Solução:** Aguarde o tempo especificado e retente automaticamente.

#### 2. Dotenv não instalado ou não configurado

**Verificar:**
```bash
npm list dotenv
```

**Solução:**
```bash
npm install dotenv
```

Certifique-se que `index.js` tem:
```javascript
import "dotenv/config";  // Deve ser a PRIMEIRA linha
```

#### 2. Arquivo `.env` no local errado

O arquivo `.env` deve estar em: `backend/services/mcp_client/.env`

**Verificar se a chave está sendo carregada:**

Adicione no `index.js` após a linha 7:
```javascript
if (process.env.GEMINI_API_KEY) {
  console.log("✅ Chave Gemini encontrada");
} else {
  console.log("❌ Chave Gemini não definida");
}
```

#### 3. Modelo Gemini desatualizado

**Sintoma:** Logs mostram erro específico do Gemini.

**Solução:** Atualize o modelo em `orchestrator.js`:

```javascript
// ❌ Desatualizado
this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });

// ✅ Atualizado
this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
```

#### 4. API Key inválida ou expirada

**Verificar:**
1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Gere uma nova API key
3. Substitua no `.env`:

```bash
GEMINI_API_KEY=sua-nova-chave-aqui
```

---

### ❌ Problema: "Porta 3000 já em uso"

**Sintoma:** Servidor não inicia com erro `EADDRINUSE`.

**Solução 1 - Usar outra porta:**
```bash
PORT=3001 npm start
```

**Solução 2 - Matar processo na porta 3000:**

**Windows:**
```cmd
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
lsof -i :3000
kill -9 <PID>
```

---

### ❌ Problema: MCP específico não conecta

**Sintoma:** Um MCP não aparece em `/tools` ou falha ao executar.

**Diagnóstico:**

1. **Verifique os logs de inicialização:**
   - Se ver `✅ Conectado: nome-do-mcp` → OK
   - Se ver `❌ Erro ao conectar nome-do-mcp` → Problema

2. **Verifique dependências do MCP:**

   - **test-mcp**: Requer Node.js e `@modelcontextprotocol/sdk`
   - **ia-local-classifier**: Requer Ollama rodando
   - **pubmedmcp**: Requer Python 3.12 e uvx
   - **browser-use**: Requer Python e uvx

3. **Teste o MCP isoladamente:**

```bash
# Exemplo: testar test_mcp
cd backend/services/test_mcp
node mcp_server_test.js
```

Se não funcionar sozinho, o problema está no MCP, não no orquestrador.

**Solução:** Remova temporariamente do `.mcp.json` até resolver.

---

### ❌ Problema: Query não retorna ferramenta esperada

**Sintoma:** `/query` retorna `"Nenhuma ferramenta apropriada encontrada"`.

**Causa:** O Gemini pode não reconhecer a ferramenta. Verifique:

1. **A ferramenta está listada em `/tools`?**
```bash
curl http://localhost:3000/tools
```

2. **O schema da ferramenta é claro?**

Melhore a `description` no MCP server:
```javascript
{
  name: "math_add",
  description: "Soma dois números. Use quando o usuário pedir para somar, adicionar ou calcular a soma de números.",  // ✅ Mais descritivo
}
```

---

### ❌ Problema: JSON inválido no curl (Windows)

**Sintoma:** Erro de parse JSON ao usar curl no Windows CMD.

**Solução - Use PowerShell:**

```powershell
$body = '{"query":"some os números 25 e 17"}'
Invoke-RestMethod -Uri http://localhost:3000/query -Method Post -Body $body -ContentType "application/json"
```

**Ou - Use arquivo JSON:**

```bash
echo {"query":"teste"} > test.json
curl -X POST http://localhost:3000/query -H "Content-Type: application/json" -d @test.json
```

---

### ✅ Como verificar se está tudo funcionando

Execute os seguintes testes:

```bash
# 1. Health check
curl http://localhost:3000/health
# Deve retornar: {"status":"ok",...}

# 2. Listar ferramentas
curl http://localhost:3000/tools
# Deve listar pelo menos as ferramentas do test-mcp

# 3. Testar execute direto
curl -X POST http://localhost:3000/execute \
  -H "Content-Type: application/json" \
  -d '{"server_name":"test-mcp","tool_name":"echo","arguments":{"message":"teste"}}'
# Deve retornar: {"success":true,"result":[{"type":"text","text":"📢 Echo: teste"}]}

# 4. Testar query (PowerShell)
$body = '{"query":"some os números 5 e 3"}'
Invoke-RestMethod -Uri http://localhost:3000/query -Method Post -Body $body -ContentType "application/json"
# Deve retornar resultado com math_add
```

---

### 📋 Checklist de Diagnóstico

Use este checklist quando algo não funcionar:

- [ ] Node.js versão >= 18 instalado
- [ ] Dependências instaladas (`npm install`)
- [ ] Arquivo `.env` existe em `backend/services/mcp_client/.env`
- [ ] `dotenv` instalado e configurado no `index.js`
- [ ] Porta 3000 disponível (ou outra porta via `PORT=XXXX`)
- [ ] `.mcp.json` com caminhos **relativos**
- [ ] Modelo Gemini atualizado (`gemini-2.5-flash` ou mais recente)
- [ ] MCPs listados em `/tools` ao iniciar
- [ ] Logs não mostram erros de conexão MCP

---

### 🆘 Ainda com problemas?

1. **Adicione logs detalhados:**

Em `orchestrator.js`, linha 156, verifique se tem:
```javascript
console.log("❌ Erro do Gemini:", error.message);
```

2. **Reinicie completamente:**

```bash
# Pare o servidor (Ctrl+C)
# Reinstale dependências
rm -rf node_modules package-lock.json
npm install
# Inicie novamente
npm start
```

3. **Verifique versões:**

```bash
node --version  # >= 18
npm --version   # >= 9
```

## Próximos Passos

- [ ] Adicionar autenticação JWT
- [ ] Implementar rate limiting
- [ ] Adicionar logging estruturado
- [ ] Cache de respostas do Gemini
- [ ] Métricas e monitoramento
