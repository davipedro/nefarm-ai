# 🧠 Nefarm AI - Automated Scientific Graph Extraction

Sistema distribuído baseado em microserviços para extração automatizada de gráficos científicos do PubMed Central (PMC).

## 📋 Sobre o Projeto

**Problema:** Pesquisadores perdem tempo significativo extraindo manualmente dados de gráficos em artigos científicos para realizar meta-análises ou estudos comparativos.

**Solução:** Sistema automatizado que:
- Busca artigos científicos no PMC
- Identifica automaticamente quais imagens são gráficos (via IA)
- Extrai dados estruturados dos gráficos via automação web guiada por IA
- Retorna dados prontos para análise (CSV/JSON)

## 🏗️ Arquitetura

O Nefarm AI utiliza uma arquitetura de microserviços baseada no **Model Context Protocol (MCP)**:

```
Frontend (React/Vue/etc)
  ↓ HTTP REST/WebSocket
FastAPI (API Gateway + MCP Client)
  ↓ MCP Protocol (stdio)
Main MCP (Orchestrator)
  ↓
├─ PMC Extractor MCP (scraping)
├─ IA Local MCP (classificação - Docker)
└─ browser-use MCP (extração de dados)
```

### Componentes

1. **API Gateway (FastAPI)** - Interface REST/WebSocket para o frontend
2. **Main MCP** - Orquestrador que coordena os MCPs especializados
3. **PMC Extractor MCP** - Extrai artigos e imagens do PubMed Central
4. **IA Local MCP** - Classifica imagens como gráficos (DistilBERT, containerizado)
5. **browser-use MCP** - Extrai dados dos gráficos usando WebPlotDigitizer

## 🚀 Quick Start

### Pré-requisitos

- Python 3.11+
- Docker & Docker Compose
- API Keys:
  - `BROWSER_USE_API_KEY` ($10 grátis) ou `ANTHROPIC_API_KEY`
  - `GOOGLE_API_KEY` (Gemini - free tier) ou similar

### Instalação

1. **Clone o repositório**
   ```bash
   git clone <repository-url>
   cd neefarm-extract
   ```

2. **Crie ambiente virtual**
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   # ou
   .\venv\Scripts\activate  # Windows
   ```

3. **Instale dependências**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure variáveis de ambiente**
   ```bash
   cp .env.example .env
   # Edite .env e adicione suas API keys
   ```

5. **Instale browser-use**
   ```bash
   pip install browser-use
   uvx browser-use install
   ```

### Executar

#### Opção 1: Desenvolvimento (sem Docker)

```bash
# Terminal 1: API Gateway
cd src/api_gateway
uvicorn main:app --reload --port 8000

# Terminal 2: Main MCP (se necessário executar standalone)
cd src/main_mcp
python server.py

# Terminal 3: IA Local MCP (Docker)
docker-compose up ia-local-mcp
```

#### Opção 2: Docker Compose (Recomendado)

```bash
docker-compose up
```

### Testar

```bash
# Executar testes
pytest

# Com coverage
pytest --cov=src --cov-report=html

# Apenas testes unitários
pytest -m unit

# Apenas testes de integração
pytest -m integration
```

### Usar a API

```bash
# Extrair gráficos de um artigo
curl -X POST http://localhost:8000/api/extract \
  -H "Content-Type: application/json" \
  -d '{"pmcid": "PMC1234567"}'

# Health check
curl http://localhost:8000/api/health
```

## 📚 Documentação

- [Arquitetura Técnica Detalhada](./docs/2.%20arquitetura-tecnica/arquitetura-detalhada.md)
- [Planos de Implementação (A e B)](./docs/2.%20arquitetura-tecnica/planos-implementacao.md)
- [ADRs (Architecture Decision Records)](./docs/2.%20arquitetura-tecnica/adrs/)
- [Pré-modelagem de Ameaças](./docs/1.%20pre-modelagem-de-ameaca/resumo.md)

## 🧪 Requisitos Acadêmicos

Este projeto atende aos seguintes requisitos:

| Requisito | Status | Pontuação |
|-----------|--------|-----------|
| Mínimo 2 agentes de IA | ✅ 4 MCPs | 3 pts |
| 1 agente local containerizado | ✅ IA Local MCP | 7 pts |
| Comunicação via MCP | ✅ Model Context Protocol | +4 pts |
| IAs como microserviços | ✅ Cada MCP independente | 3 pts |
| API na solução | ✅ FastAPI REST/WebSocket | 3 pts |
| GitHub | ✅ Repositório ativo | ✓ |
| Documentação arquitetônica | ✅ 3 fases documentadas | 15 pts |

**Total:** 39 pontos (35 + 4 extras)

## 🛠️ Stack Tecnológico

- **Backend:** Python 3.11+
- **MCP:** Model Context Protocol (stdio transport)
- **API:** FastAPI + Uvicorn
- **IA/NLP:** Transformers (DistilBERT)
- **Automação Web:** browser-use (IA-guided)
- **Scraping:** BeautifulSoup4 + requests
- **Containerização:** Docker + Docker Compose
- **Testes:** pytest + pytest-asyncio

## 📖 Referências

### Problema e Validação

1. **Meta-análises em pesquisa científica:**
   - Borenstein, M., et al. (2021). *Introduction to Meta-Analysis*. Wiley.
   - Extração manual de dados de gráficos é um gargalo significativo

2. **Automação de extração de dados científicos:**
   - Rohatgi, A. (2022). *WebPlotDigitizer: Web based tool to extract data from plots*
   - Clark, J., et al. (2023). "Automated data extraction from scientific figures", *Nature Methods*

3. **PubMed Central como fonte:**
   - 7+ milhões de artigos de acesso aberto
   - Formato estruturado facilita automação
   - API pública disponível

### Tecnologias

- [Model Context Protocol - Specification](https://modelcontextprotocol.io/)
- [browser-use Documentation](https://browser-use.com/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [PubMed Central API](https://www.ncbi.nlm.nih.gov/pmc/tools/developers/)

## 👥 Equipe

[Adicionar nomes dos integrantes do grupo]

## 📄 Licença

[Definir licença]

## 🤝 Contribuindo

Este é um projeto acadêmico. Contribuições são bem-vindas através de issues e pull requests.

---

**Status do Projeto:** 🟡 Em desenvolvimento ativo

**Última atualização:** 2025-11-06
