# 🧪 Guia de Teste do MCP Client

Este guia mostra como testar o MCP Client usando dois terminais.

---

## 📋 Pré-requisitos

- Node.js instalado ✅
- Dependências instaladas ✅
- `.mcp.json` configurado em `backend/.mcp.json` ✅
- Test MCP Server criado ✅

---

## 🚀 Passo 1: Iniciar o MCP Client

### Terminal 1 (Servidor):

```bash
cd backend/services/mcp_client
npm start
```

**Ou com porta customizada:**

```bash
PORT=3000 npm start
```

**Você deve ver:**

```
🚀 Iniciando servidor MCP Orchestrator...
🚀 Inicializando orquestrador MCP...
📡 Conectando ao servidor: test-mcp...
✅ Conectado: test-mcp
✅ Orquestrador inicializado com 3 ferramentas

✅ Servidor rodando em http://localhost:3000

📋 Rotas disponíveis:
   GET  http://localhost:3000/health
   GET  http://localhost:3000/tools
   POST http://localhost:3000/query
   POST http://localhost:3000/execute
```

---

## 🧪 Passo 2: Testar os Endpoints

### Terminal 2 (Testes):

Abra um **novo terminal** e execute os comandos abaixo.

---

### ✅ Teste 1: Health Check

**Windows (PowerShell):**
```powershell
curl http://localhost:3000/health
```

**Windows (cmd):**
```cmd
curl http://localhost:3000/health
```

**Linux/Mac:**
```bash
curl http://localhost:3000/health
```

**Resultado esperado:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-15T20:15:00.000Z",
  "orchestrator": "connected"
}
```

---

### ✅ Teste 2: Listar Ferramentas

**Comando:**
```bash
curl http://localhost:3000/tools
```

**Resultado esperado:**
```json
{
  "tools": [
    {
      "serverName": "test-mcp",
      "name": "echo",
      "description": "Retorna o texto que você enviar..."
    },
    {
      "serverName": "test-mcp",
      "name": "greet",
      "description": "Retorna uma saudação personalizada"
    },
    {
      "serverName": "test-mcp",
      "name": "math_add",
      "description": "Soma dois números..."
    }
  ],
  "total": 3
}
```

---

### ✅ Teste 3: Executar Ferramenta - Echo

**Windows (PowerShell):**
```powershell
$body = @{
    server_name = "test-mcp"
    tool_name = "echo"
    arguments = @{
        message = "Testando MCP Client!"
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:3000/execute -Method Post -Body $body -ContentType "application/json"
```

**Linux/Mac/Git Bash:**
```bash
curl -X POST http://localhost:3000/execute \
  -H "Content-Type: application/json" \
  -d '{
    "server_name": "test-mcp",
    "tool_name": "echo",
    "arguments": {
      "message": "Testando MCP Client!"
    }
  }'
```

**Windows (cmd) - Uma linha:**
```cmd
curl -X POST http://localhost:3000/execute -H "Content-Type: application/json" -d "{\"server_name\":\"test-mcp\",\"tool_name\":\"echo\",\"arguments\":{\"message\":\"Testando!\"}}"
```

**Resultado esperado:**
```json
{
  "server_name": "test-mcp",
  "tool_name": "echo",
  "timestamp": "2025-11-15T20:20:00.000Z",
  "success": true,
  "result": [
    {
      "type": "text",
      "text": "📢 Echo: Testando MCP Client!"
    }
  ]
}
```

---

### ✅ Teste 4: Executar Ferramenta - Greet

**PowerShell:**
```powershell
$body = @{
    server_name = "test-mcp"
    tool_name = "greet"
    arguments = @{
        name = "João"
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:3000/execute -Method Post -Body $body -ContentType "application/json"
```

**Linux/Mac/Git Bash:**
```bash
curl -X POST http://localhost:3000/execute \
  -H "Content-Type: application/json" \
  -d '{
    "server_name": "test-mcp",
    "tool_name": "greet",
    "arguments": {
      "name": "João"
    }
  }'
```

**Resultado esperado:**
```json
{
  "success": true,
  "result": [
    {
      "type": "text",
      "text": "👋 Olá, João! Bem-vindo ao MCP Test Server!"
    }
  ]
}
```

---

### ✅ Teste 5: Executar Ferramenta - Math Add

**PowerShell:**
```powershell
$body = @{
    server_name = "test-mcp"
    tool_name = "math_add"
    arguments = @{
        a = 15
        b = 27
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:3000/execute -Method Post -Body $body -ContentType "application/json"
```

**Linux/Mac/Git Bash:**
```bash
curl -X POST http://localhost:3000/execute \
  -H "Content-Type: application/json" \
  -d '{
    "server_name": "test-mcp",
    "tool_name": "math_add",
    "arguments": {
      "a": 15,
      "b": 27
    }
  }'
```

**Resultado esperado:**
```json
{
  "success": true,
  "result": [
    {
      "type": "text",
      "text": "🧮 Resultado: 15 + 27 = 42"
    }
  ]
}
```

---

### ✅ Teste 6: Orquestração via Query (Modo Mock)

**PowerShell:**
```powershell
$body = @{
    query = "classificar uma imagem de gráfico"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:3000/query -Method Post -Body $body -ContentType "application/json"
```

**Linux/Mac/Git Bash:**
```bash
curl -X POST http://localhost:3000/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "classificar uma imagem de gráfico"
  }'
```

**Resultado esperado (modo mock sem Gemini):**
```json
{
  "query": "classificar uma imagem de gráfico",
  "success": false,
  "message": "Servidor ia-local-classifier não encontrado"
}
```

**Explicação:** O modo mock detectou a keyword "classificar" + "imagem" e tentou usar o `ia-local-classifier`, mas esse MCP não está configurado no `.mcp.json`. Isso **prova que a orquestração está funcionando!**

---

## 🛠️ Teste 7: Testar com Query Inválida

**Comando:**
```bash
curl -X POST http://localhost:3000/query \
  -H "Content-Type: application/json" \
  -d '{"query": "fazer um café"}'
```

**Resultado esperado:**
```json
{
  "success": false,
  "message": "Nenhuma ferramenta apropriada encontrada para esta consulta"
}
```

---

## 🔧 Teste 8: Testar Erro (Ferramenta Inexistente)

**Comando:**
```bash
curl -X POST http://localhost:3000/execute \
  -H "Content-Type: application/json" \
  -d '{
    "server_name": "test-mcp",
    "tool_name": "nao_existe",
    "arguments": {}
  }'
```

**Resultado esperado:**
```json
{
  "success": true,
  "result": [
    {
      "type": "text",
      "text": "❌ Erro: Ferramenta 'nao_existe' não encontrada."
    }
  ]
}
```

---

## 🎯 Checklist de Testes

Execute todos e marque:

- [ ] **Teste 1:** Health check retorna status "ok"
- [ ] **Teste 2:** Lista 3 ferramentas (echo, greet, math_add)
- [ ] **Teste 3:** Echo retorna a mensagem enviada
- [ ] **Teste 4:** Greet retorna saudação personalizada
- [ ] **Teste 5:** Math_add retorna soma correta
- [ ] **Teste 6:** Query detecta keywords (modo mock)
- [ ] **Teste 7:** Query inválida retorna erro apropriado
- [ ] **Teste 8:** Ferramenta inexistente retorna erro

---

## 📊 Interpretando os Logs (Terminal 1)

Enquanto você testa no Terminal 2, observe o Terminal 1:

```
🔍 Processando: "classificar uma imagem de gráfico"
💭 Decisão: {
  "tool_name": "classify_image",
  "server_name": "ia-local-classifier",
  ...
}
⚙️  Executando: classify_image no servidor ia-local-classifier
```

Isso mostra:
1. Query recebida
2. Decisão do Gemini/mock
3. Tentativa de execução

---

## 🐛 Troubleshooting

### Erro: "Cannot connect to localhost:3000"

**Solução:** Certifique-se que o servidor está rodando no Terminal 1.

```bash
# Verificar se a porta 3000 está em uso
netstat -ano | findstr :3000   # Windows
lsof -i :3000                  # Linux/Mac
```

---

### Erro: "Connection closed" ao iniciar

**Causa:** Caminho do MCP Server incorreto no `.mcp.json`.

**Solução:** Edite `backend/.mcp.json` e use caminho absoluto:

```json
{
  "mcpServers": {
    "test-mcp": {
      "command": "node",
      "args": ["C:/projetos/nefarm-ai/backend/services/test_mcp/mcp_server_test.js"],
      "env": {}
    }
  }
}
```

---

### Erro: "JSON inválido"

**Windows cmd:** Escape de aspas duplas pode ser complicado.

**Solução:** Use PowerShell ou crie um arquivo `.json` e envie:

```bash
# Criar arquivo
echo {"query":"teste"} > test.json

# Enviar
curl -X POST http://localhost:3000/query -H "Content-Type: application/json" -d @test.json
```

---

## 🎓 Próximos Passos

Após validar que tudo funciona:

1. ✅ **MCP Client validado** (Nível 1 completo!)
2. 🔄 **Adicionar mais MCPs** (PMC, Browser Use)
3. 🔐 **Desenvolver API Gateway** (autenticação)
4. 🎨 **Conectar Frontend**

---

## 📝 Comandos Rápidos (Cola)

### Para Windows PowerShell:

```powershell
# Health
curl http://localhost:3000/health

# Tools
curl http://localhost:3000/tools

# Execute (Echo)
$body = '{"server_name":"test-mcp","tool_name":"echo","arguments":{"message":"Teste!"}}'
Invoke-RestMethod -Uri http://localhost:3000/execute -Method Post -Body $body -ContentType "application/json"

# Query
$body = '{"query":"classificar imagem"}'
Invoke-RestMethod -Uri http://localhost:3000/query -Method Post -Body $body -ContentType "application/json"
```

### Para Linux/Mac/Git Bash:

```bash
# Health
curl http://localhost:3000/health

# Tools
curl http://localhost:3000/tools | jq  # jq para formatar JSON

# Execute (Echo)
curl -X POST http://localhost:3000/execute \
  -H "Content-Type: application/json" \
  -d '{"server_name":"test-mcp","tool_name":"echo","arguments":{"message":"Teste!"}}'

# Query
curl -X POST http://localhost:3000/query \
  -H "Content-Type: application/json" \
  -d '{"query":"classificar imagem"}'
```

---

**Documento criado:** 2025-11-15
**Localização:** `backend/TESTE-MCP-CLIENT.md`
