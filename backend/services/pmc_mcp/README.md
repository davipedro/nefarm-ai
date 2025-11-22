# PMC MCP Server

Servidor MCP (Model Context Protocol) para busca e extração de artigos científicos do Europe PMC.

## Ferramentas Disponíveis

### 1. `search_articles`

Busca artigos científicos no Europe PMC.

**Parâmetros:**
- `query` (string, obrigatório): Termo de busca
- `max_results` (int, opcional): Número máximo de resultados (padrão: 10, máximo: 100)

**Retorna:**
- Lista de artigos com: título, autores, ano, PMCID, PMID, DOI, URL

**Exemplo:**
```json
{
  "query": "molecular docking AND cancer",
  "max_results": 5
}
```

### 2. `extract_figures`

Extrai todas as figuras e legendas de um artigo PMC. **Pode baixar as imagens localmente.**

**Parâmetros:**
- `pmcid` (string, obrigatório): ID do artigo no formato `PMC` + números (ex: "PMC9423874")
- `download_images` (boolean, opcional): Se true, baixa as imagens localmente (padrão: false)
- `images_dir` (string, opcional): Diretório onde salvar as imagens (padrão: "imagens")

**Retorna:**
- Lista de figuras com: ID, título, legenda, URL da imagem, alt text, dimensões
- **Se `download_images=true`**: Também retorna o caminho local do arquivo baixado

**Exemplo (sem download):**
```json
{
  "pmcid": "PMC9423874"
}
```

**Exemplo (com download):**
```json
{
  "pmcid": "PMC9423874",
  "download_images": true,
  "images_dir": "imagens_pmc"
}
```

## Instalação

### Requisitos

- Python >= 3.8
- pip

### Passos

```bash
# 1. Navegar até o diretório
cd backend/services/pmc_mcp

# 2. Criar ambiente virtual (recomendado)
python -m venv venv

# 3. Ativar ambiente virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# 4. Instalar dependências
pip install -r requirements.txt
```

## Uso

### Standalone (Teste Manual)

```bash
python mcp_server.py
```

O servidor aguardará entrada via stdin no protocolo MCP.

### Via MCP Client (Orquestrador)

1. Adicione ao `backend/.mcp.json`:

```json
{
  "mcpServers": {
    "pmc-mcp": {
      "command": "python",
      "args": ["../pmc_mcp/mcp_server.py"],
      "env": {}
    }
  }
}
```

2. Inicie o MCP Client:

```bash
cd ../mcp_client
npm start
```

3. Teste os endpoints:

**Listar ferramentas:**
```bash
curl http://localhost:3000/tools
```

**Buscar artigos:**
```bash
curl -X POST http://localhost:3000/execute -H "Content-Type: application/json" -d '{\"server_name\":\"pmc-mcp\",\"tool_name\":\"search_articles\",\"arguments\":{\"query\":\"diabetes treatment\",\"max_results\":5}}'
```

**Extrair figuras (apenas URLs):**
```bash
curl -X POST http://localhost:3000/execute -H "Content-Type: application/json" -d '{\"server_name\":\"pmc-mcp\",\"tool_name\":\"extract_figures\",\"arguments\":{\"pmcid\":\"PMC9423874\"}}'
```

**Extrair figuras E baixar imagens:**
```bash
curl -X POST http://localhost:3000/execute -H "Content-Type: application/json" -d '{\"server_name\":\"pmc-mcp\",\"tool_name\":\"extract_figures\",\"arguments\":{\"pmcid\":\"PMC9423874\",\"download_images\":true,\"images_dir\":\"imagens_pmc\"}}'
```

**Orquestração via Gemini:**
```bash
curl -X POST http://localhost:3000/query -H "Content-Type: application/json" -d '{\"query\":\"buscar artigos sobre COVID-19\"}'
```

## Exemplos de Uso

### Python (Teste Local)

```python
from mcp_server import search_articles, extract_figures

# Buscar artigos
results = search_articles("machine learning", max_results=3)
for article in results:
    print(f"{article['title']} ({article['year']})")

# Extrair figuras
figures = extract_figures("PMC9423874")
for fig in figures:
    print(f"{fig['title']}: {fig['caption']}")
```

### PowerShell (via MCP Client)

```powershell
# Buscar artigos
curl -X POST http://localhost:3000/execute -H "Content-Type: application/json" -d '{\"server_name\":\"pmc-mcp\",\"tool_name\":\"search_articles\",\"arguments\":{\"query\":\"cancer research\",\"max_results\":5}}'

# Extrair figuras (apenas URLs)
curl -X POST http://localhost:3000/execute -H "Content-Type: application/json" -d '{\"server_name\":\"pmc-mcp\",\"tool_name\":\"extract_figures\",\"arguments\":{\"pmcid\":\"PMC9423874\"}}'

# Extrair figuras E baixar imagens
curl -X POST http://localhost:3000/execute -H "Content-Type: application/json" -d '{\"server_name\":\"pmc-mcp\",\"tool_name\":\"extract_figures\",\"arguments\":{\"pmcid\":\"PMC9423874\",\"download_images\":true,\"images_dir\":\"imagens_pmc\"}}'
```

## Estrutura do Projeto

```
pmc_mcp/
├── mcp_server.py      # Servidor MCP principal
├── requirements.txt   # Dependências Python
├── README.md          # Esta documentação
└── .gitignore         # Arquivos ignorados pelo Git
```

## API Utilizada

Este servidor utiliza:
- **Europe PMC REST API** para busca de artigos
- **PMC Website** (web scraping) para extração de figuras

## Casos de Uso

### Fluxo de Integração com Browser Use MCP

Este MCP foi projetado para trabalhar em conjunto com o Browser Use MCP para extração de dados de gráficos:

1. **PMC MCP** → Busca artigos e extrai figuras
2. **PMC MCP** → Baixa imagens localmente (`download_images=true`)
3. **Browser Use MCP** → Acessa site de análise/OCR
4. **Browser Use MCP** → Faz upload das imagens salvas
5. **Browser Use MCP** → Extrai dados dos gráficos

**Exemplo de fluxo:**
```bash
# 1. Extrair e baixar figuras
curl -X POST http://localhost:3000/execute -H "Content-Type: application/json" -d '{\"server_name\":\"pmc-mcp\",\"tool_name\":\"extract_figures\",\"arguments\":{\"pmcid\":\"PMC9423874\",\"download_images\":true,\"images_dir\":\"imagens_pmc\"}}'

# 2. Browser Use MCP pega as imagens de imagens_pmc/ e faz upload
# (implementação futura)
```

## Limitações Conhecidas

- Rate limiting do Europe PMC (recomendado: máx 10 req/segundo)
- Extração de figuras depende da estrutura HTML do PMC (pode quebrar se mudarem o layout)
- Download de imagens requer espaço em disco (desabilitado por padrão)

## Desenvolvimento

### Estrutura do Código

O servidor implementa dois handlers MCP:

1. `list_tools()`: Lista as ferramentas disponíveis
2. `call_tool()`: Executa uma ferramenta específica

### Adicionar Nova Ferramenta

1. Implemente a função Python
2. Adicione à lista em `list_tools()`
3. Adicione handler em `call_tool()`

## Próximos Passos

- [ ] Adicionar testes automatizados
- [ ] Implementar cache de resultados
- [ ] Adicionar tool para download de PDFs
- [ ] Suporte a extração de tabelas

## Licença

MIT
