# 📋 Níveis de Aceitação - PMC MCP

**Serviço:** PMC MCP - Busca e Extração de Artigos Científicos

**Responsável:** -

**Última atualização:** 2025-11-15

---

## 📊 Status Atual

**Nível Atual:** Nível 0 (0% completo)

**Progresso no Nível Atual:** 0%

**Bloqueado por:** MCP Client precisa estar em Nível 1

---

## ⚙️ Nível 0: Setup Inicial

**Meta:** Estrutura básica pronta para desenvolvimento

### Checklist

- [ ] Diretório criado em `backend/services/pmc_mcp/`
- [ ] `requirements.txt` criado com dependências:
  - [ ] `mcp` (Model Context Protocol SDK)
  - [ ] `requests`
  - [ ] `beautifulsoup4`
  - [ ] `lxml`
- [ ] `mcp_server.py` (arquivo principal) criado
- [ ] README.md básico criado
- [ ] `.gitignore` configurado (incluir `__pycache__`, `*.pyc`, `venv/`)

### Critério de Aceitação
✅ **Nível 0 completo quando:**
- Estrutura de pastas existe
- `requirements.txt` criado
- Arquivo principal `mcp_server.py` existe (pode estar vazio)
- README com descrição do serviço

**Status:** ⚪ 0%

---

## ⭐ Nível 1: Funcionalidade Básica

**Meta:** MCP funcional com ferramentas básicas de busca e extração

### Checklist

#### Implementação
- [ ] **MCP Server implementado** (`mcp_server.py`)
  - [ ] Importações do MCP SDK
  - [ ] Servidor configurado com stdio transport
  - [ ] Handler para `ListToolsRequest`
  - [ ] Handler para `CallToolRequest`

- [ ] **Tool 1: `search_articles`**
  - [ ] Busca artigos no Europe PMC
  - [ ] Parâmetros:
    - `query` (string, obrigatório)
    - `max_results` (int, opcional, padrão: 10)
  - [ ] Retorna: lista de artigos com título, autores, ano, PMCID, URL
  - [ ] Código migrado de `PMC-MCP-testes/busca-metadados.py`

- [ ] **Tool 2: `extract_figures`**
  - [ ] Extrai figuras de um artigo por PMCID
  - [ ] Parâmetros:
    - `pmcid` (string, obrigatório, ex: "PMC9423874")
    - `download_images` (bool, opcional, padrão: false)
  - [ ] Retorna: lista de figuras com ID, título, legenda, URL
  - [ ] Código migrado de `PMC-MCP-testes/extrair-figuras-legendas.py`

- [ ] **Roda localmente sem erros**

#### Integração Básica
- [ ] Adicionado ao `.mcp.json` na raiz:
  ```json
  "pmc-mcp": {
    "command": "python",
    "args": ["backend/services/pmc_mcp/mcp_server.py"],
    "env": {}
  }
  ```
- [ ] MCP Client consegue conectar e listar tools

#### Documentação Mínima
- [ ] README atualizado com:
  - [ ] Como instalar (`pip install -r requirements.txt`)
  - [ ] Como executar (standalone e via MCP Client)
  - [ ] Exemplo de uso de cada tool

### Teste Manual
```bash
# 1. Instalar dependências
cd backend/services/pmc_mcp
pip install -r requirements.txt

# 2. Testar standalone (opcional)
python mcp_server.py

# 3. Testar via MCP Client
cd ../../mcp_client
npm start

# 4. Listar tools
curl http://localhost:3000/tools
# Deve aparecer: search_articles, extract_figures

# 5. Testar search_articles
curl -X POST http://localhost:3000/execute \
  -H "Content-Type: application/json" \
  -d '{
    "server_name": "pmc-mcp",
    "tool_name": "search_articles",
    "arguments": {"query": "molecular docking", "max_results": 3}
  }'

# 6. Testar extract_figures
curl -X POST http://localhost:3000/execute \
  -H "Content-Type: application/json" \
  -d '{
    "server_name": "pmc-mcp",
    "tool_name": "extract_figures",
    "arguments": {"pmcid": "PMC9423874"}
  }'
```

### Critério de Aceitação
✅ **Nível 1 completo quando:**
- MCP Server funcional com 2 tools
- `search_articles` busca artigos corretamente
- `extract_figures` extrai figuras corretamente
- Integrado com MCP Client
- README com instruções de execução

**Status:** ⚪ 0%

---

## ⭐⭐ Nível 2: Validado

**Meta:** MCP testado e integração validada

### Checklist

#### Testes Básicos (Happy Path)
- [ ] **Teste 1:** `search_articles` com query válida retorna resultados
- [ ] **Teste 2:** `extract_figures` com PMCID válido retorna figuras
- [ ] **Teste 3:** MCP Client lista as 2 tools do PMC MCP
- [ ] Pelo menos **3 testes** passando (pytest)

#### Integração Validada
- [ ] MCP Client lista tools corretamente via `/tools`
- [ ] Execução via `/execute` funciona para ambas as tools
- [ ] Orquestração via `/query` funciona:
  - Query: "Buscar artigos sobre COVID-19" → chama `search_articles`
  - Query: "Extrair figuras do artigo PMC9423874" → chama `extract_figures`

#### Documentação
- [ ] README com exemplos completos de ambas as tools
- [ ] Instruções de teste (`pytest`)
- [ ] Troubleshooting:
  - PMC offline
  - PMCID inválido
  - Rate limiting do PMC

### Executar Testes
```bash
cd backend/services/pmc_mcp
pytest tests/
```

### Critério de Aceitação
✅ **Nível 2 completo quando:**
- Mínimo 3 testes básicos passando
- Integração com MCP Client validada
- Orquestração funcional
- README com exemplos completos

**Status:** ⚪ 0%

---

## ⭐⭐⭐ Nível 3: Robusto

**Meta:** MCP confiável com tratamento de erros completo

### Checklist

#### Tratamento de Erros
- [ ] Validação de parâmetros:
  - [ ] `query` não vazia
  - [ ] `pmcid` no formato correto (PMC + números)
  - [ ] `max_results` entre 1 e 100
- [ ] Timeout de requisições ao PMC (30s)
- [ ] Tratamento de PMC indisponível (erro 503)
- [ ] Tratamento de PMCID não encontrado (erro 404)
- [ ] Mensagens de erro amigáveis
- [ ] Rate limiting respeitado (aguarda se bloqueado)

#### Testes Completos
- [ ] Testes de casos extremos:
  - [ ] Query vazia
  - [ ] PMCID inválido (sem "PMC", só números, etc.)
  - [ ] max_results = 0 ou negativo
  - [ ] PMC retorna 0 resultados
  - [ ] Timeout de rede
- [ ] Pelo menos **10 testes** no total
- [ ] Cobertura de testes ≥ 60%

#### Logs Estruturados
- [ ] Biblioteca de logs (logging padrão do Python)
- [ ] Logs em formato estruturado
- [ ] Níveis apropriados (DEBUG, INFO, WARNING, ERROR)
- [ ] Informações logadas:
  - [ ] Timestamp
  - [ ] Tool chamada
  - [ ] Parâmetros (sem dados sensíveis)
  - [ ] Tempo de resposta
  - [ ] Erros

#### Features Adicionais
- [ ] **Tool 3 (opcional):** `get_article_metadata`
  - Busca metadados completos por PMCID
  - Retorna: abstract, keywords, DOI, journal, etc.

### Critério de Aceitação
✅ **Nível 3 completo quando:**
- Validação robusta de todos os parâmetros
- Tratamento completo de erros de rede e API
- Mínimo 10 testes (incluindo edge cases)
- Logs estruturados
- Sistema confiável

**Status:** ⚪ 0%

---

## ⭐⭐⭐⭐ Nível 4: Produção Ready

**Meta:** MCP pronto para deploy em produção

### Checklist

#### Observabilidade
- [ ] Logs incluem métricas:
  - [ ] Taxa de sucesso/falha
  - [ ] Tempo médio de resposta
  - [ ] Artigos retornados por query
- [ ] (Opcional) Integração com sistema de métricas

#### Performance
- [ ] Cache de resultados (5 min TTL) para queries repetidas
- [ ] Limite de max_results configurável via variável de ambiente
- [ ] Retry logic para falhas temporárias do PMC (max 3 tentativas)

#### Docker
- [ ] Dockerfile criado:
  ```dockerfile
  FROM python:3.11-slim
  WORKDIR /app
  COPY requirements.txt .
  RUN pip install --no-cache-dir -r requirements.txt
  COPY . .
  CMD ["python", "mcp_server.py"]
  ```
- [ ] Imagem otimizada (< 200MB)
- [ ] Usuário não-root

#### Documentação Completa
- [ ] Documentação de cada tool:
  - Parâmetros (tipo, obrigatório/opcional, padrão)
  - Retorno (estrutura, exemplos)
  - Erros possíveis
- [ ] Guia de troubleshooting completo
- [ ] Exemplos de integração com orquestrador
- [ ] Limitações conhecidas (rate limiting do PMC, etc.)

#### Segurança
- [ ] Validação rigorosa de PMCID (prevenir injection)
- [ ] Sanitização de query antes de enviar ao PMC
- [ ] Logs não contêm dados sensíveis
- [ ] Timeout para prevenir DoS

### Critério de Aceitação
✅ **Nível 4 completo quando:**
- Cache implementado
- Retry logic funcional
- Documentação completa de API
- Docker otimizado
- Pronto para produção

**Status:** ⚪ 0%

---

## 📝 Notas e Observações

### Decisões Técnicas
- **Código base:** Migrar de `PMC-MCP-testes/` (já validado)
- **API:** Europe PMC REST API
- **Parser HTML:** BeautifulSoup4

### Bloqueios e Dependências
- **Nível 1:** Bloqueado até MCP Client estar em Nível 1
- **Nível 2:** Depende de MCP Client estar funcional

### Melhorias Futuras (Pós-Nível 4)
- [ ] Suporte a download de PDFs completos
- [ ] Extração de tabelas (além de figuras)
- [ ] Busca em múltiplas bases (PubMed, arXiv, etc.)
- [ ] OCR para extrair dados de gráficos rasterizados

---

## 🔄 Histórico de Progresso

| Data | Evento | Responsável |
|------|--------|-------------|
| 2025-11-15 | Planejamento criado | - |
