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

### API Key do Gemini (Opcional)

```bash
export GEMINI_API_KEY="sua-chave-aqui"
```

Se não configurar, o sistema usa um modo **mock** com lógica básica de decisão.

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

## Modo Mock (Sem Gemini)

Quando a API key do Gemini não está configurada, o sistema usa lógica simples:

- **Palavras-chave para classificação**: "imagem", "classificar" → `ia-local-classifier`
- **Palavras-chave para busca**: "buscar", "pesquisar", "artigo" → `pubmedmcp`
- **Palavras-chave para navegação**: "navegar", "site", "web" → `browser-use`

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

### Erro ao conectar aos servidores MCP

Certifique-se de que:
1. O Ollama está rodando (para ia-local-classifier)
2. Python/uvx está instalado (para browser-use e pubmedmcp)
3. As variáveis de ambiente estão configuradas

### Servidor não inicializa

Verifique se a porta 3000 está disponível:
```bash
lsof -i :3000  # Linux/Mac
netstat -ano | findstr :3000  # Windows
```

## Próximos Passos

- [ ] Adicionar autenticação JWT
- [ ] Implementar rate limiting
- [ ] Adicionar logging estruturado
- [ ] Cache de respostas do Gemini
- [ ] Métricas e monitoramento
