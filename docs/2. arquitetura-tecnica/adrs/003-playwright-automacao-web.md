# ADR 003: browser-use para Automação Web Guiada por IA

## Status
✅ **Aceito** (Revisão 2.0 - Substituiu decisão anterior de Playwright)

## Contexto

O projeto precisa automatizar a extração de dados de gráficos usando ferramentas online como WebPlotDigitizer. Requisitos:

1. Executar ações complexas em navegador (upload, clicks, extração)
2. Suportar SPAs modernas e sites dinâmicos
3. Robustez contra mudanças de layout dos sites
4. Integração com arquitetura MCP
5. Alinhamento com proposta de múltiplos agentes de IA

**Alternativas consideradas:**

| Ferramenta | Tipo | MCP Nativo | Robustez | Custo |
|------------|------|------------|----------|-------|
| **Selenium** | Automação tradicional | ❌ | Baixa (scripts fixos) | Grátis |
| **Playwright** | Automação tradicional | ❌ | Baixa (scripts fixos) | Grátis |
| **browser-use** | IA-guided automation | ✅ | Alta (adapta a mudanças) | API calls |
| Puppeteer | Automação tradicional | ❌ | Baixa | Grátis |

**Descoberta crítica (após research):**
- browser-use é um **MCP server nativo** (`uvx browser-use --mcp`)
- Usa LLM para **navegar de forma inteligente** (não precisa scripts fixos)
- Confirmado suporte para WebPlotDigitizer (chart extraction workflows)

## Decisão

Utilizaremos **browser-use** como solução de automação web, aproveitando seu MCP server nativo.

### Arquitetura de Comunicação

```
API Gateway (FastAPI)
  ↓ spawn processo via stdio
browser-use MCP (MCP Server)
  ├─ LLM (navegação inteligente)
  └─ Playwright (execução real)
```

**Transporte:** stdio (standard input/output)

**Configuração básica:**
```bash
# Instalação
pip install browser-use
uvx browser-use install  # Instala Chromium

# Execução como MCP
uvx browser-use --mcp
```

### Integração com FastAPI (Cliente MCP)

```python
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

async def extract_chart_data(chart_url: str) -> dict:
    """
    Spawna browser-use MCP e comunica via stdio
    """
    server_params = StdioServerParameters(
        command="uvx",
        args=["browser-use", "--mcp"],
        env={
            "ANTHROPIC_API_KEY": os.getenv("ANTHROPIC_API_KEY"),
            # ou OPENAI_API_KEY, GOOGLE_API_KEY, etc.
        }
    )

    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()

            # Chamar tool do browser-use
            result = await session.call_tool(
                "navigate_and_extract",
                {
                    "task": f"Go to WebPlotDigitizer, upload image from {chart_url}, "
                            f"digitize the chart, and return the extracted data points",
                    "url": "https://web.eecs.utk.edu/~dcostine/personal/PowerDeviceLib/DigiTest/index.html"
                }
            )
            return result
```

### Configuração de Produção (@sandbox decorator)

```python
from browser_use import Browser, sandbox, ChatBrowserUse
from browser_use.agent.service import Agent

@sandbox(
    cloud_proxy_country_code='us',  # Bypass restrictions
    cloud_timeout=120,               # Max session time (2 min)
    cloud_profile_id='nefarm-prod'   # Saved profile (opcional)
)
async def extract_chart_production(browser: Browser, chart_url: str):
    """
    Versão produção com cloud proxy e timeout
    """
    agent = Agent(
        task=f"Extract numerical data from chart at {chart_url} using WebPlotDigitizer. "
             f"Upload the image, digitize it, and save the data as CSV.",
        browser=browser,
        llm=ChatBrowserUse()
    )
    result = await agent.run()
    return result.extracted_data
```

## Consequências

### Positivas ✅
- **MCP nativo** - Não precisa implementar servidor MCP do zero
- **IA-guided** - Adapta-se a mudanças de layout automaticamente
- **Menos código** - LLM descobre os steps, não precisa script fixo
- **Confirmado para WebPlotDigitizer** - Suporte oficial documentado
- **Alinhado com proposta** - Mais um agente de IA no sistema
- **Produção-ready** - @sandbox decorator com cloud proxy
- **Múltiplos LLMs suportados** - Claude, GPT, Gemini

### Negativas ⚠️
- **Requer API key de LLM** - Custo por extração
- **Duas API keys no sistema**:
  - Main MCP (orquestração)
  - browser-use MCP (navegação)
- **Latência maior** - LLM precisa decidir cada ação
- **Não determinístico** - IA pode tomar caminhos diferentes
- **Custo variável** - Depende de quantos steps a IA toma

### Neutras 🔄
- Usa Playwright internamente (mesma base que proposta anterior)
- Stdio transport (não HTTP) - FastAPI spawna processo
- Necessário gerenciar API keys via environment variables

## Análise de Custos

### Estimativa por extração de gráfico:

**Cenário conservador:**
- Navegação + upload + digitização + extração: ~30-50 LLM calls
- Usando Claude Sonnet (recomendado): ~$0.01-0.02 por gráfico
- 100 gráficos/mês: ~$1-2/mês

**Mitigação:**
- browser-use oferece **$10 em créditos grátis** (`BROWSER_USE_API_KEY`)
- Alternativamente: usar Gemini (mais barato) ou GPT-4o-mini

### Comparação com alternativas:

| Solução | Custo/gráfico | Desenvolvimento | Manutenção |
|---------|---------------|-----------------|------------|
| browser-use | $0.01-0.02 | Baixo (MCP pronto) | Baixo (IA adapta) |
| Playwright | $0 | Alto (scripts complexos) | Alto (quebra c/ mudanças) |
| Selenium | $0 | Alto | Muito alto |

**Decisão:** Custo aceitável pelo ganho de robustez e tempo de desenvolvimento.

## Requisitos de API Keys

**Obrigatório:**
```bash
# .env
# Escolher UMA das opções:

# Opção 1: browser-use credits ($10 grátis)
BROWSER_USE_API_KEY=buse_xxx

# Opção 2: Anthropic (Claude)
ANTHROPIC_API_KEY=sk-ant-xxx

# Opção 3: OpenAI (GPT)
OPENAI_API_KEY=sk-xxx

# Opção 4: Google (Gemini - mais barato)
GOOGLE_API_KEY=AIza-xxx
```

**Recomendação inicial:** Usar `BROWSER_USE_API_KEY` com $10 grátis para MVP.

## Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Custo de API excede orçamento | Baixa | Médio | Monitorar uso, fallback para Gemini |
| IA não consegue completar task | Média | Alto | Prompt detalhado, timeout + retry |
| WebPlotDigitizer muda drasticamente | Baixa | Médio | IA adapta naturalmente |
| Latência alta (>30s por gráfico) | Média | Médio | @sandbox com timeout, paralelização |

## Fallback Plan

Se browser-use não for viável (custo ou performance):
1. **Playwright puro** - Implementar scripts fixos (mais trabalho)
2. **Desktop WebPlotDigitizer** - Se houver CLI/API
3. **Computer Vision** - OpenCV + OCR (muito complexo)

## Validação do Sucesso

**Critérios de aceitação:**
- ✅ Extração bem-sucedida de gráficos do WebPlotDigitizer
- ✅ Tempo médio < 60s por gráfico
- ✅ Taxa de sucesso > 85%
- ✅ Custo < $0.05 por gráfico

**Testes necessários:**
- [ ] Extração de scatter plot
- [ ] Extração de line chart
- [ ] Extração de bar chart
- [ ] Upload de imagens de diferentes formatos (PNG, JPG)
- [ ] Validação dos dados retornados (formato CSV/JSON)

## Referências
- [browser-use Documentation](https://browser-use.com/)
- [browser-use GitHub](https://github.com/browser-use/browser-use)
- [browser-use MCP Server](https://browser-use.com/docs/mcp)
- [WebPlotDigitizer](https://web.eecs.utk.edu/~dcostine/personal/PowerDeviceLib/DigiTest/index.html)
- [MCP stdio transport](https://modelcontextprotocol.io/docs/concepts/transports#stdio)
