# 📁 Estrutura de Pastas do Projeto Nefarm AI

## Visão Geral

Esta é a estrutura de pastas recomendada para o projeto, seguindo boas práticas de organização de código Python e arquitetura de microserviços.

```
neefarm-extract/
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Pipeline CI/CD
│       └── docker-publish.yml         # Publicação de imagens Docker
│
├── docs/
│   ├── 1. pre-modelagem-de-ameaca/
│   │   ├── resumo.md                 # ✅ Arquitetura pré-modelagem
│   │   └── links.md
│   ├── 2. arquitetura-tecnica/
│   │   ├── arquitetura-detalhada.md  # ✅ Este documento
│   │   ├── estrutura-projeto.md      # ✅ Estrutura de pastas
│   │   └── adrs/                     # Architecture Decision Records
│   │       ├── 001-uso-do-mcp.md
│   │       ├── 002-modelo-ia-local.md
│   │       ├── 003-playwright-automacao-web.md
│   │       └── 004-arquitetura-microservicos.md
│   ├── 3. modelagem-de-ameacas/      # ⏳ A fazer
│   │   ├── stride-analysis.md
│   │   ├── threat-model.md
│   │   └── mitigations.md
│   ├── 4. pos-modelagem-de-ameaca/   # ⏳ A fazer
│   │   └── arquitetura-final.md
│   └── tema-trabalho.md              # Requisitos acadêmicos
│
├── src/
│   ├── api_gateway/                  # API REST/WebSocket
│   │   ├── __init__.py
│   │   ├── main.py                   # FastAPI app
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── extract.py            # POST /extract
│   │   │   └── search.py             # POST /search
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── request.py            # Pydantic models (request)
│   │   │   └── response.py           # Pydantic models (response)
│   │   ├── mcp_client.py             # Cliente MCP para Main MCP
│   │   ├── config.py                 # Configurações
│   │   └── dependencies.py           # FastAPI dependencies
│   │
│   ├── main_mcp/                     # Orchestrator MCP
│   │   ├── __init__.py
│   │   ├── server.py                 # MCP Server + Client
│   │   ├── orchestrator.py           # Lógica de orquestração
│   │   ├── mcp_clients.py            # Clientes para outros MCPs
│   │   └── config.py
│   │
│   ├── pmc_extractor_mcp/            # PMC Extractor MCP
│   │   ├── __init__.py
│   │   ├── server.py                 # MCP Server
│   │   ├── scraper.py                # Lógica de scraping PMC
│   │   ├── parsers.py                # Parsers HTML
│   │   ├── models.py                 # Data models
│   │   └── config.py
│   │
│   ├── ia_local_mcp/                 # IA Local MCP (Containerizado)
│   │   ├── __init__.py
│   │   ├── server.py                 # MCP Server (SSE)
│   │   ├── classifier.py             # Lógica de classificação
│   │   ├── model_loader.py           # Carregamento do modelo
│   │   ├── preprocessing.py          # Preprocessamento de texto
│   │   ├── config.py
│   │   └── models/                   # Diretório de cache de modelos
│   │       └── .gitkeep
│   │
│   ├── browser_use_mcp/              # Browser Use MCP
│   │   ├── __init__.py
│   │   ├── server.py                 # MCP Server
│   │   ├── automator.py              # Playwright automation
│   │   ├── extractors/               # Extratores por ferramenta
│   │   │   ├── __init__.py
│   │   │   ├── webplotdigitizer.py   # Automação WebPlotDigitizer
│   │   │   └── base.py               # Interface base
│   │   ├── parsers.py                # Parsers de dados extraídos
│   │   └── config.py
│   │
│   ├── shared/                       # Código compartilhado
│   │   ├── __init__.py
│   │   ├── mcp_utils.py              # Utilidades MCP
│   │   ├── logging_config.py         # Configuração de logs
│   │   ├── exceptions.py             # Exceções customizadas
│   │   └── schemas.py                # Schemas compartilhados
│   │
│   └── __init__.py
│
├── tests/
│   ├── unit/
│   │   ├── test_pmc_scraper.py
│   │   ├── test_ia_classifier.py
│   │   └── test_browser_automator.py
│   ├── integration/
│   │   ├── test_mcp_communication.py
│   │   └── test_end_to_end.py
│   ├── fixtures/
│   │   ├── sample_articles/
│   │   └── sample_captions.json
│   └── conftest.py                   # Pytest configuration
│
├── frontend/                         # Frontend (A definir)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── README.md
│
├── dockerfiles/
│   ├── ia-local-mcp.Dockerfile       # ✅ Container obrigatório
│   ├── api-gateway.Dockerfile
│   └── browser-use-mcp.Dockerfile    # Opcional
│
├── scripts/
│   ├── setup.sh                      # Script de setup inicial
│   ├── test_mcp.py                   # Testes manuais de MCPs
│   └── download_models.py            # Pre-download de modelos IA
│
├── .dockerignore
├── .env.example                      # Template de variáveis de ambiente
├── .gitignore
├── docker-compose.yml                # Orquestração local
├── docker-compose.prod.yml           # Orquestração produção
├── pytest.ini                        # Configuração pytest
├── pyproject.toml                    # Configuração do projeto (Poetry)
├── requirements.txt                  # Dependências (alternativa ao Poetry)
├── README.md                         # ⚠️ Pendente: Seção de referências
└── LICENSE

```

---

## Detalhamento dos Diretórios Principais

### 1. `src/` - Código Fonte

Organizado por **microserviço**, cada um com sua própria estrutura:

```
src/{microservice}/
├── __init__.py       # Exports públicos
├── server.py         # MCP Server entrypoint
├── {core}.py         # Lógica de negócio principal
├── models.py         # Data models (Pydantic/dataclasses)
└── config.py         # Configurações específicas
```

**Vantagens:**
- Cada MCP é um pacote Python independente
- Fácil transformar em repositório separado no futuro
- Imports claros: `from src.pmc_extractor_mcp import scraper`

### 2. `docs/` - Documentação

Organizada por **fases do trabalho acadêmico**:

1. **Pré-modelagem** ✅ (5 pts)
2. **Arquitetura técnica** ✅ (preparação)
3. **Modelagem de ameaças** ⏳ (5 pts)
4. **Pós-modelagem** ⏳ (5 pts)

### 3. `tests/` - Testes

```
tests/
├── unit/           # Testes isolados de funções/classes
├── integration/    # Testes de comunicação entre MCPs
└── fixtures/       # Dados de teste
```

**Estratégia de testes:**
- **Unit**: Cada função core (scraper, classifier, etc.)
- **Integration**: Comunicação MCP (cliente ↔ servidor)
- **E2E**: Fluxo completo (PMCID → dados extraídos)

### 4. `dockerfiles/` - Containers

Separados do código para clareza:

```dockerfile
# Convenção de nomes
{service-name}.Dockerfile
```

### 5. `shared/` - Código Compartilhado

Utilidades usadas por múltiplos MCPs:

- `mcp_utils.py` - Helpers para MCP (connection, error handling)
- `logging_config.py` - Logging estruturado (JSON)
- `exceptions.py` - Exceções customizadas
- `schemas.py` - Pydantic models compartilhados

---

## Arquivos de Configuração

### `pyproject.toml` (Recomendado - Poetry)

```toml
[tool.poetry]
name = "neefarm-ai"
version = "0.1.0"
description = "Sistema automatizado de extração de gráficos científicos"

[tool.poetry.dependencies]
python = "^3.11"
modelcontextprotocol = "^0.1.0"
fastapi = "^0.104.0"
uvicorn = "^0.24.0"
beautifulsoup4 = "^4.12.0"
playwright = "^1.40.0"
transformers = "^4.35.0"
torch = "^2.1.0"
pydantic = "^2.5.0"

[tool.poetry.dev-dependencies]
pytest = "^7.4.0"
pytest-asyncio = "^0.21.0"
black = "^23.0.0"
ruff = "^0.1.0"

[build-system]
requires = ["poetry-core"]
build-backend = "poetry.core.masonry.api"
```

### `.env.example`

```bash
# API Gateway
API_HOST=0.0.0.0
API_PORT=8000
API_SECRET_KEY=your-secret-key-here

# MCP Servers
IA_LOCAL_MCP_URL=http://localhost:8001
PMC_EXTRACTOR_MCP_TRANSPORT=stdio
BROWSER_USE_MCP_TRANSPORT=stdio

# IA Local
MODEL_NAME=distilbert-base-uncased
MODEL_CACHE_DIR=./src/ia_local_mcp/models
CLASSIFICATION_THRESHOLD=0.7

# Browser Use
PLAYWRIGHT_HEADLESS=true
WEBPLOTDIGITIZER_URL=https://automeris.io/WebPlotDigitizer/

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=json
```

### `docker-compose.yml`

```yaml
version: '3.8'

services:
  ia-local-mcp:
    build:
      context: .
      dockerfile: dockerfiles/ia-local-mcp.Dockerfile
    container_name: neefarm-ia-local
    ports:
      - "8001:8000"
    environment:
      - MODEL_NAME=${MODEL_NAME}
      - MCP_TRANSPORT=sse
    volumes:
      - ./src/ia_local_mcp/models:/app/models
    restart: unless-stopped

  api-gateway:
    build:
      context: .
      dockerfile: dockerfiles/api-gateway.Dockerfile
    container_name: neefarm-api
    ports:
      - "8000:8000"
    env_file:
      - .env
    depends_on:
      - ia-local-mcp
    volumes:
      - ./src:/app/src  # Hot reload em dev

networks:
  default:
    name: neefarm-network
```

---

## Convenções de Código

### Nomenclatura

```python
# Arquivos
lowercase_with_underscores.py

# Classes
class PascalCase:
    pass

# Funções/variáveis
def snake_case():
    variable_name = "value"

# Constantes
UPPER_CASE_CONSTANTS = "value"

# MCPs
{purpose}_mcp/  # Ex: pmc_extractor_mcp, ia_local_mcp
```

### Imports

```python
# Order: stdlib → third-party → local
import os
from typing import List, Dict

from fastapi import FastAPI
from pydantic import BaseModel

from src.shared.exceptions import MCPConnectionError
from src.main_mcp.orchestrator import Orchestrator
```

### Docstrings

```python
def extract_images(pmcid: str) -> List[ImageData]:
    """
    Extract images and captions from a PMC article.

    Args:
        pmcid: PubMed Central ID (format: PMC1234567)

    Returns:
        List of ImageData objects containing URLs and captions

    Raises:
        ArticleNotFoundError: If PMCID doesn't exist
        ScrapingError: If HTML parsing fails
    """
    pass
```

---

## Scripts Úteis

### `scripts/setup.sh`

```bash
#!/bin/bash
# Setup inicial do projeto

echo "📦 Instalando dependências..."
poetry install

echo "🤖 Baixando modelos IA..."
python scripts/download_models.py

echo "🎭 Instalando browsers Playwright..."
playwright install chromium

echo "🐳 Construindo containers..."
docker-compose build

echo "✅ Setup completo! Execute: docker-compose up"
```

### `scripts/test_mcp.py`

```python
"""Script para testar MCPs individualmente"""

import asyncio
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

async def test_pmc_mcp():
    server_params = StdioServerParameters(
        command="python",
        args=["-m", "src.pmc_extractor_mcp.server"]
    )

    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()

            # Testar extração
            result = await session.call_tool(
                "extract_images",
                {"pmcid": "PMC1234567"}
            )
            print(result)

if __name__ == "__main__":
    asyncio.run(test_pmc_mcp())
```

---

## Próximos Passos

1. ✅ Estrutura de documentação criada
2. ⏳ Criar estrutura de pastas `src/`
3. ⏳ Implementar MCPs (começar por PMC Extractor)
4. ⏳ Configurar CI/CD (GitHub Actions)
5. ⏳ Testes unitários + integração
6. ⏳ Modelagem de ameaças
7. ⏳ Arquitetura pós-modelagem

---

**Observação:** Esta estrutura pode evoluir durante o desenvolvimento. Mantenha este documento atualizado com mudanças significativas.
