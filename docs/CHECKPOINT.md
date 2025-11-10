# 📍 CHECKPOINT - Estado Atual do Projeto Nefarm AI

**Data:** 2025-11-06
**Status:** 🟢 Estrutura base completa, pronto para implementação dos MCPs

---

## ✅ O Que Foi Feito

### 1. Documentação Arquitetural Completa

#### **Arquitetura Pré-Modelagem** ✅
- `docs/1. pre-modelagem-de-ameaca/resumo.md` - Visão geral do sistema
- `docs/1. pre-modelagem-de-ameaca/links.md` - Referências

#### **Arquitetura Técnica** ✅
- `docs/2. arquitetura-tecnica/arquitetura-detalhada.md` - Documento principal completo
- `docs/2. arquitetura-tecnica/estrutura-projeto.md` - Organização de código
- `docs/2. arquitetura-tecnica/planos-implementacao.md` - Comparação Plano A vs B
- `docs/2. arquitetura-tecnica/CHANGELOG-ARQUITETURA.md` - Histórico de mudanças

#### **ADRs (Architecture Decision Records)** ✅
- `ADR 001` - Uso do Model Context Protocol
- `ADR 002` - DistilBERT para classificação
- `ADR 003` - browser-use para automação (substituiu Playwright)
- `ADR 004` - Arquitetura de Microserviços

#### **Decisões Importantes Tomadas:**
1. ✅ **Plano B escolhido** - FastAPI como cliente MCP (ao invés de Dolphin)
2. ✅ **browser-use** ao invés de Playwright puro (IA-guided automation)
3. ✅ Comunicação via **stdio** entre FastAPI e MCPs
4. ✅ **2 API keys** necessárias (Main MCP + browser-use MCP)

### 2. Estrutura de Código Criada

```
neefarm-extract/
├── src/
│   ├── api_gateway/           ✅ Estrutura criada
│   │   ├── routes/
│   │   └── models/
│   ├── main_mcp/              ✅ Estrutura criada
│   ├── pmc_extractor_mcp/     ✅ Estrutura criada
│   ├── ia_local_mcp/          ✅ Estrutura criada
│   │   └── models/
│   └── shared/                ✅ IMPLEMENTADO
│       ├── exceptions.py      ✅
│       ├── logging_config.py  ✅
│       └── schemas.py         ✅
├── tests/
│   ├── unit/                  ✅ Estrutura criada
│   ├── integration/           ✅ Estrutura criada
│   └── fixtures/              ✅ Estrutura criada
├── scripts/
│   ├── setup.sh               ✅
│   └── setup.bat              ✅
├── dockerfiles/               ✅ Estrutura criada
├── requirements.txt           ✅
├── .env.example               ✅
├── .gitignore                 ✅
├── pytest.ini                 ✅
└── README.md                  ✅
```

### 3. Módulos Compartilhados Implementados

#### **src/shared/exceptions.py** ✅
Exceções customizadas para:
- Comunicação MCP (`MCPConnectionError`, `MCPTimeoutError`, `MCPToolError`)
- PMC Extractor (`ArticleNotFoundError`, `ScrapingError`, `InvalidPMCIDError`)
- IA Local (`ModelLoadError`, `ClassificationError`)
- Browser Use (`BrowserAutomationError`, `GraphExtractionError`)
- API Gateway (`ValidationError`, `RateLimitError`)

#### **src/shared/logging_config.py** ✅
Sistema de logging estruturado:
- Suporta JSON e texto
- Correlation IDs para rastreamento
- Configurável via environment variables
- Custom formatters

#### **src/shared/schemas.py** ✅
Modelos Pydantic para validação:
- `ImageData` - Dados de imagem do PMC
- `ArticleMetadata` - Metadados do artigo (com validação PMCID)
- `ClassificationResult` - Resultado da classificação IA
- `DataPoint` - Ponto de dados extraído
- `GraphMetadata` - Metadados do gráfico
- `GraphData` - Dados completos do gráfico
- `ExtractGraphsResponse` - Resposta final da API
- `MCPToolCall` / `MCPToolResult` - Comunicação MCP genérica

### 4. Arquivos de Configuração

#### **requirements.txt** ✅
Dependências completas:
- FastAPI + Uvicorn (API Gateway)
- mcp (MCP SDK)
- beautifulsoup4 + requests (scraping)
- transformers + torch (IA)
- browser-use (automação)
- pytest + pytest-asyncio (testes)
- black + ruff (qualidade de código)

#### **.env.example** ✅
Template com todas as variáveis:
- API keys (BROWSER_USE, GOOGLE, ANTHROPIC, OPENAI)
- Configurações de cada MCP
- Logging, CORS, rate limits

#### **.gitignore** ✅
Ignora:
- `.env`, `__pycache__`, logs
- Modelos IA (arquivos grandes)
- Caches de testes

#### **pytest.ini** ✅
Configuração de testes:
- Markers: unit, integration, slow, requires_api_key
- Coverage reports
- Asyncio mode

### 5. Scripts de Setup

#### **scripts/setup.sh** (Linux/Mac) ✅
#### **scripts/setup.bat** (Windows) ✅

Automatizam:
- Criação de venv
- Instalação de dependências
- Instalação browser-use
- Criação de .env
- Verificação de API keys
- Execução de testes

### 6. README.md Principal ✅

Documenta:
- Problema e solução
- Arquitetura do sistema
- Quick start guide
- Requisitos acadêmicos (39 pts)
- Stack tecnológico
- Referências científicas

---

## ⏳ O Que Está Pendente

### **Implementação dos MCPs** (Próxima Fase)

#### 1. **PMC Extractor MCP** ⏳
**Prioridade:** ALTA (começar por aqui)
**Arquivos a criar:**
```
src/pmc_extractor_mcp/
├── server.py        # MCP Server (stdio)
├── scraper.py       # Lógica de scraping do PMC
├── parsers.py       # Parse HTML e extração de dados
├── config.py        # Configurações
└── README.md        # Documentação do componente
```

**Funcionalidades:**
- [ ] Buscar artigo por PMCID
- [ ] Extrair HTML do PMC
- [ ] Identificar URLs de imagens (CDN NCBI)
- [ ] Extrair legendas (captions)
- [ ] Retornar `ArticleMetadata` + `ImageData[]`

**Dependências:** Nenhuma (pode ser implementado primeiro)

---

#### 2. **IA Local MCP** ⏳
**Prioridade:** ALTA (paralelizável com PMC Extractor)
**Arquivos a criar:**
```
src/ia_local_mcp/
├── server.py           # MCP Server (SSE via HTTP)
├── classifier.py       # Lógica de classificação
├── model_loader.py     # Carregamento do DistilBERT
├── preprocessing.py    # Preprocessamento de texto
├── config.py           # Configurações
└── Dockerfile          # Container (OBRIGATÓRIO - req. acadêmico)
```

**Funcionalidades:**
- [ ] Carregar modelo DistilBERT no startup
- [ ] Endpoint: `classify_caption(caption: str) -> ClassificationResult`
- [ ] Endpoint: `batch_classify(captions: str[]) -> ClassificationResult[]`
- [ ] Threshold configurável (default: 0.7)
- [ ] Containerização completa

**Dependências:** Nenhuma (independente)

**Dockerfile a criar:**
```dockerfile
# dockerfiles/ia-local-mcp.Dockerfile
FROM python:3.11-slim
# Instalar dependências
# Baixar modelo no build
# Expor porta 8001
# Health check
```

---

#### 3. **Main MCP (Orchestrator)** ⏳
**Prioridade:** MÉDIA (depende de PMC e IA Local)
**Arquivos a criar:**
```
src/main_mcp/
├── server.py           # MCP Server (stdio)
├── orchestrator.py     # Lógica de orquestração
├── mcp_clients.py      # Clientes para PMC, IA Local, browser-use
├── config.py           # Configurações
└── README.md
```

**Funcionalidades:**
- [ ] Tool: `extract_graphs_from_article(pmcid: str)`
- [ ] Orquestrar chamadas sequenciais:
  1. PMC Extractor → obter imagens
  2. IA Local → classificar imagens
  3. browser-use → extrair dados dos gráficos
- [ ] Agregar resultados
- [ ] Error handling e retries

**Dependências:** PMC Extractor, IA Local (devem estar implementados)

---

#### 4. **API Gateway (FastAPI)** ⏳
**Prioridade:** MÉDIA (depende do Main MCP)
**Arquivos a criar:**
```
src/api_gateway/
├── main.py                # FastAPI app
├── routes/
│   ├── extract.py         # POST /api/extract
│   ├── search.py          # POST /api/search
│   └── health.py          # GET /api/health
├── models/
│   ├── request.py         # Pydantic request models
│   └── response.py        # Pydantic response models
├── mcp_client.py          # Cliente MCP (stdio spawn)
├── dependencies.py        # FastAPI dependencies
├── config.py              # Configurações (via Pydantic Settings)
└── README.md
```

**Funcionalidades:**
- [ ] REST endpoint: `POST /api/extract` (extração por PMCID)
- [ ] REST endpoint: `POST /api/search` (busca por termo)
- [ ] WebSocket: `/ws/progress/{session_id}` (streaming)
- [ ] Cliente MCP stdio para Main MCP
- [ ] Cliente MCP stdio para browser-use (direto, se necessário)
- [ ] CORS configurado
- [ ] Rate limiting (opcional)
- [ ] Documentação OpenAPI automática

**Dependências:** Main MCP (deve estar implementado)

---

#### 5. **Integração browser-use** ⏳
**Prioridade:** BAIXA (já existe pronto, apenas integrar)

**Não precisa implementar servidor** (já existe: `uvx browser-use --mcp`)

**Apenas integrar:**
- [ ] Configurar API key no `.env`
- [ ] Testar spawn do processo via stdio
- [ ] Validar extração de gráfico de teste
- [ ] Documentar prompts ideais para extração

---

### **Testes** ⏳

#### **Testes Unitários**
```
tests/unit/
├── test_pmc_scraper.py         # PMC Extractor
├── test_ia_classifier.py       # IA Local
├── test_orchestrator.py        # Main MCP
└── test_api_endpoints.py       # API Gateway
```

#### **Testes de Integração**
```
tests/integration/
├── test_mcp_communication.py   # Comunicação entre MCPs
├── test_end_to_end.py          # Fluxo completo
└── test_browser_use.py         # Integração browser-use
```

#### **Fixtures de Teste**
```
tests/fixtures/
├── sample_articles/            # HTMLs de teste do PMC
├── sample_captions.json        # Legendas para teste de classificação
└── sample_graphs/              # Imagens de gráficos de teste
```

---

### **Dockerização** ⏳

#### **docker-compose.yml** ⏳
```yaml
services:
  ia-local-mcp:       # OBRIGATÓRIO (req. acadêmico)
    build: ./dockerfiles/ia-local-mcp.Dockerfile
    ports: ["8001:8000"]

  api-gateway:        # Opcional
    build: ./dockerfiles/api-gateway.Dockerfile
    ports: ["8000:8000"]
    depends_on: [ia-local-mcp]
```

---

### **Modelagem de Ameaças** ⏳
**Prioridade:** ALTA (requisito acadêmico - 5 pts)

**Criar:**
```
docs/3. modelagem-de-ameacas/
├── stride-analysis.md          # Análise STRIDE
├── threat-model.md             # Modelo de ameaças completo
├── mitigations.md              # Medidas de mitigação
└── risk-assessment.md          # Avaliação de riscos (DREAD)
```

**Aplicar metodologia:**
1. Identificar ativos críticos (API keys, dados de usuários, etc.)
2. Aplicar STRIDE em cada componente
3. Avaliar riscos com DREAD
4. Documentar mitigações
5. Calcular risco residual

---

### **Arquitetura Pós-Modelagem** ⏳
**Prioridade:** BAIXA (após implementação e modelagem)

**Criar:**
```
docs/4. pos-modelagem-de-ameaca/
└── arquitetura-final.md        # Arquitetura com medidas implementadas
```

---

## 🔑 API Keys Necessárias (AÇÃO REQUERIDA)

### **Para MVP (Desenvolvimento):**

1. **BROWSER_USE_API_KEY** 💰 $10 grátis
   - Criar conta: https://browser-use.com/
   - Usar para browser-use MCP

2. **GOOGLE_API_KEY** (Gemini) 🆓 Free tier
   - Obter: https://makersuite.google.com/app/apikey
   - Usar para Main MCP (orquestração)

### **Alternativas:**

- **ANTHROPIC_API_KEY** (Claude) - Melhor qualidade, mais caro
- **OPENAI_API_KEY** (GPT) - Alternativa ao Gemini

### **Onde configurar:**
```bash
# Copiar template
cp .env.example .env

# Editar .env e adicionar:
BROWSER_USE_API_KEY=buse_your_actual_key_here
GOOGLE_API_KEY=AIza_your_actual_key_here
```

---

## 📊 Requisitos Acadêmicos - Status

| Requisito | Status | Pontuação |
|-----------|--------|-----------|
| **Agentes de IA** | | |
| ├─ Mínimo 2 agentes | ⏳ 4 MCPs planejados | 3 pts |
| └─ 1 agente local containerizado | ⏳ IA Local MCP (a implementar) | 7 pts |
| **Comunicação** | | |
| ├─ MCP entre IAs | ⏳ A implementar | +4 pts |
| ├─ Microserviços | ⏳ Estrutura pronta | 3 pts |
| └─ API | ⏳ FastAPI (a implementar) | 3 pts |
| **Controle de Versão** | ✅ GitHub ativo | ✓ |
| **Documentação Arquitetônica** | | |
| ├─ Pré-modelagem | ✅ Completa | 5 pts |
| ├─ Modelagem de ameaças | ⏳ A fazer | 5 pts |
| └─ Pós-modelagem | ⏳ A fazer | 5 pts |
| **Validação do Problema** | | |
| ├─ Relevância | ✅ README com referências | 2,5 pts |
| └─ Documentação da dor | ✅ README | 1,5 pts |

**Total esperado:** 39 pts (35 + 4 extras)
**Status atual:** ~8-10 pts garantidos (documentação)

---

## 🚀 Próximo Passo Recomendado

### **Opção 1: Implementação Sequencial** (Recomendado)

```
1. Setup inicial (1 dia)
   └─ Executar scripts/setup.bat
   └─ Configurar API keys
   └─ Testar ambiente

2. PMC Extractor MCP (2-3 dias)
   └─ Implementar scraping do PMC
   └─ Criar testes unitários
   └─ Validar com artigo real

3. IA Local MCP (3-4 dias)
   └─ Integrar DistilBERT
   └─ Criar Dockerfile
   └─ Testar classificação

4. Main MCP (2-3 dias)
   └─ Orquestrador
   └─ Clientes MCP stdio
   └─ Testes de integração

5. API Gateway (2-3 dias)
   └─ FastAPI + endpoints
   └─ Cliente MCP
   └─ WebSocket streaming

6. Integração browser-use (1-2 dias)
   └─ Testar extração real
   └─ Ajustar prompts

7. Modelagem de Ameaças (2-3 dias)
   └─ STRIDE + DREAD
   └─ Documentar mitigações

Timeline total: ~3-4 semanas
```

### **Opção 2: Paralelização** (Mais rápido, requer equipe)

```
Pessoa 1: PMC Extractor + Main MCP
Pessoa 2: IA Local + Dockerfile
Pessoa 3: API Gateway + testes
Pessoa 4: Modelagem de ameaças

Timeline: ~2 semanas
```

---

## 📝 Comandos Úteis para Retomar

```bash
# Ativar ambiente
cd C:\Users\User\ufla\neefarm-extract
venv\Scripts\activate  # Windows

# Instalar/atualizar dependências
pip install -r requirements.txt

# Executar testes
pytest

# Rodar API (quando implementada)
uvicorn src.api_gateway.main:app --reload

# Testar MCP individual (exemplo)
python -m src.pmc_extractor_mcp.server

# Docker (quando implementado)
docker-compose up
```

---

## 🔗 Documentos de Referência

### **Para Implementação:**
- [Arquitetura Detalhada](./2.%20arquitetura-tecnica/arquitetura-detalhada.md)
- [Estrutura do Projeto](./2.%20arquitetura-tecnica/estrutura-projeto.md)
- [Plano B - FastAPI](./2.%20arquitetura-tecnica/planos-implementacao.md#plano-b-fastapi-como-cliente-mcp)

### **Para Decisões:**
- [ADRs](./2.%20arquitetura-tecnica/adrs/)
- [CHANGELOG Arquitetura](./2.%20arquitetura-tecnica/CHANGELOG-ARQUITETURA.md)

### **Externos:**
- [MCP Python SDK](https://github.com/modelcontextprotocol/python-sdk)
- [browser-use Docs](https://browser-use.com/)
- [FastAPI Tutorial](https://fastapi.tiangolo.com/tutorial/)

---

## ✅ Checklist para Retomar

Antes de continuar:
- [ ] Ambiente virtual ativado (`venv\Scripts\activate`)
- [ ] Dependências instaladas (`pip install -r requirements.txt`)
- [ ] API keys configuradas no `.env`
- [ ] browser-use instalado (`pip install browser-use && uvx browser-use install`)
- [ ] Git commit do estado atual (estrutura base)
- [ ] Leu este checkpoint 😊

---

## 💡 Notas Importantes

1. **Começar pelo PMC Extractor** - É o mais simples e não tem dependências
2. **IA Local MCP é obrigatório em Docker** - Requisito acadêmico (7 pts)
3. **Modelagem de Ameaças é crítica** - 5 pts, fazer antes de finalizar
4. **browser-use já existe pronto** - Não implementar do zero, apenas integrar
5. **Testar cada MCP isoladamente** - Antes de integrar no Main MCP

---

**Último checkpoint:** 2025-11-06 às 23:45 (estimado)
**Responsável:** Equipe Nefarm AI
**Status:** 🟢 Pronto para começar implementação dos MCPs

---

## 🎯 TL;DR - Para Retomar Rapidamente

**O que está pronto:**
- ✅ Toda documentação arquitetural
- ✅ Estrutura de pastas completa
- ✅ Módulos compartilhados (exceptions, logging, schemas)
- ✅ Configurações (requirements, .env.example, pytest.ini)
- ✅ README principal

**Próximo passo imediato:**
1. Executar `scripts\setup.bat` (Windows) ou `scripts/setup.sh` (Linux/Mac)
2. Obter API keys (BROWSER_USE + GOOGLE/ANTHROPIC)
3. Configurar `.env`
4. Implementar **PMC Extractor MCP** (primeiro componente)

**Bloqueadores atuais:**
- ⚠️ API keys não configuradas
- ⚠️ Nenhum MCP implementado ainda

**Tempo estimado até MVP funcional:** 3-4 semanas
