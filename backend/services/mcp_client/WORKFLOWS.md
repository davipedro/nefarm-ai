# Sistema de Workflows - MCP Client

## Visão Geral

O sistema de workflows permite que a IA (Gemini) crie e execute **sequências de chamadas de ferramentas** (tools) com **mapeamento dinâmico de dados** entre os steps.

## Arquitetura

### Abordagem: **Workflow Semi-fixo**
- ✅ Workflows base pré-definidos em `workflows.json`
- ✅ IA pode modificar, adicionar ou remover steps
- ✅ IA decide o mapping de dados entre steps
- ✅ Execução no backend (orchestrator.js)

---

## Como Funciona

### 1. Usuário Envia Query
```bash
POST /query
{
  "query": "buscar artigos sobre propofol e extrair gráficos"
}
```

### 2. Gemini Cria Workflow
```json
{
  "workflow_id": "search_and_extract_graphs",
  "custom_workflow": false,
  "steps": [
    {
      "step": 1,
      "tool_name": "search_articles",
      "server_name": "pmc-mcp",
      "arguments": { "query": "propofol" },
      "description": "Buscar artigos"
    },
    {
      "step": 2,
      "tool_name": "extract_figures",
      "server_name": "pmc-mcp",
      "input_mapping": {
        "pmcid": "$step.1.result[0].pmcid"
      },
      "description": "Extrair figuras do primeiro artigo"
    },
    {
      "step": 3,
      "tool_name": "extract_graph_data",
      "server_name": "graph-extractor",
      "input_mapping": {
        "image_path": "$step.2.result.figures[0].path"
      },
      "description": "Extrair dados do primeiro gráfico"
    }
  ],
  "reasoning": "Workflow completo de busca e extração"
}
```

### 3. Orchestrator Executa Steps
1. **Step 1**: Busca artigos → pega `pmcid` do primeiro
2. **Step 2**: Extrai figuras usando o `pmcid` do Step 1
3. **Step 3**: Extrai dados usando o `image_path` do Step 2

---

## Input Mapping

### Sintaxe de Referências

#### `$step.N.result.path`
Pega valor do resultado do step N:
```json
"input_mapping": {
  "pmcid": "$step.1.result[0].pmcid"
}
```

#### `$context.path`
Pega valor do contexto global (futuro):
```json
"input_mapping": {
  "user_id": "$context.user_id"
}
```

#### Valores Fixos
Valores que não dependem de steps anteriores:
```json
"arguments": {
  "query": "propofol",
  "limit": 10
}
```

### Exemplo Completo

```json
{
  "step": 2,
  "tool_name": "extract_figures",
  "server_name": "pmc-mcp",
  "arguments": {
    "format": "jpg"
  },
  "input_mapping": {
    "pmcid": "$step.1.result[0].pmcid"
  }
}
```

Resolve para:
```json
{
  "pmcid": "PMC12345678",
  "format": "jpg"
}
```

---

## Workflows Pré-definidos

### 1. `search_and_extract_graphs`
Busca artigos, extrai imagens e dados de gráficos.

**Use cases:**
- "buscar artigos sobre X e extrair gráficos"
- "pesquisar X e obter dados dos gráficos"

**Steps base:**
1. `search_articles` (pmc-mcp)
2. `extract_figures` (pmc-mcp)
3. `extract_graph_data` (graph-extractor)

---

### 2. `extract_from_image`
Extrai dados de uma imagem de gráfico fornecida.

**Use cases:**
- "extrair dados do gráfico em /path/image.jpg"
- "analisar gráfico da imagem"

**Steps base:**
1. `extract_graph_data` (graph-extractor)

---

### 3. `extract_from_pdf`
Extrai gráficos de um PDF e seus dados.

**Use cases:**
- "extrair gráficos do artigo.pdf"
- "analisar gráficos do PDF"

**Steps base:**
1. `extract_figures` (pmc-mcp)
2. `extract_graph_data` (graph-extractor)

---

### 4. `search_only`
Apenas busca artigos científicos.

**Use cases:**
- "buscar artigos sobre propofol"
- "pesquisar estudos de X"

**Steps base:**
1. `search_articles` (pmc-mcp)

---

## API Endpoints

### `GET /workflows`
Lista todos os workflows disponíveis.

**Response:**
```json
{
  "workflows": [
    {
      "id": "search_and_extract_graphs",
      "name": "Buscar artigo e extrair gráficos",
      "description": "...",
      "use_cases": ["..."],
      "base_steps": [...]
    }
  ],
  "total": 4
}
```

---

### `POST /query`
Processa query e executa workflow automaticamente.

**Request:**
```json
{
  "query": "buscar artigos sobre propofol e extrair gráficos"
}
```

**Response (Workflow):**
```json
{
  "success": true,
  "query": "...",
  "workflow_id": "search_and_extract_graphs",
  "custom_workflow": false,
  "reasoning": "...",
  "steps": [
    {
      "step": 1,
      "tool": "search_articles",
      "success": true,
      "result": {...}
    },
    {
      "step": 2,
      "tool": "extract_figures",
      "success": true,
      "result": {...}
    }
  ],
  "final_result": {...}
}
```

**Response (Single Tool):**
```json
{
  "success": true,
  "query": "...",
  "workflow_id": "search_only",
  "single_step": true,
  "result": {...}
}
```

---

## Modificar Workflows

### Adicionar Novo Workflow

Edite `workflows.json`:

```json
{
  "id": "novo_workflow",
  "name": "Nome do Workflow",
  "description": "Descrição clara",
  "use_cases": [
    "Quando usuário pede X",
    "Exemplo: 'fazer X'"
  ],
  "base_steps": [
    {
      "step": 1,
      "tool": "nome_tool",
      "server": "nome_server",
      "description": "O que faz",
      "input_mapping": {
        "arg": "$step.X.result.path"
      }
    }
  ]
}
```

Reinicie o servidor para recarregar.

---

## Tratamento de Erros

### Step Falha
- Workflow para imediatamente
- Retorna erro do step que falhou
- Steps anteriores bem-sucedidos são mantidos no contexto

### Exemplo:
```json
{
  "success": false,
  "steps": [
    { "step": 1, "success": true, "result": {...} },
    { "step": 2, "success": false, "error": {...} }
  ]
}
```

---

## Debugging

### Logs do Console

```
🔄 Executando workflow (3 steps)
📋 Workflow ID: search_and_extract_graphs

⚙️  Step 1: Buscar artigos
  🔧 Tool: search_articles @ pmc-mcp
  📥 Arguments: {"query": "propofol"}
  ✅ Step 1 concluído

⚙️  Step 2: Extrair figuras
  📌 Mapping resolvido: pmcid = "PMC12345678"
  🔧 Tool: extract_figures @ pmc-mcp
  ✅ Step 2 concluído

✅ Workflow finalizado
```

---

## Backward Compatibility

✅ **Single tools continuam funcionando**
- Se workflow tem apenas 1 step, executa diretamente
- Response tem flag `single_step: true`
- Compatível com código antigo

---

## Limitações Atuais

1. ⚠️ **Execução Sequencial**: Steps executam um após o outro (sem paralelização)
2. ⚠️ **Falha para tudo**: Se um step falha, workflow inteiro para
3. ⚠️ **Sem retry**: Steps falhos não tentam novamente automaticamente
4. ⚠️ **Mapping manual**: IA precisa especificar paths exatos

## Próximos Passos (Futuro)

- 🔮 Execução paralela de steps independentes
- 🔮 Retry automático com exponential backoff
- 🔮 Workflows condicionais (if/else)
- 🔮 Validação de schema automática
- 🔮 Cache de resultados intermediários
