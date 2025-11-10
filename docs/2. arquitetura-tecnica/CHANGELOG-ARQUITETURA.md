# 📝 Changelog - Arquitetura Nefarm AI

## Versão 2.0 - 2025-11-06

### 🔴 Mudanças Críticas

#### 1. Substituição de Playwright por browser-use

**Decisão anterior (v1.0):**
- Usar **Playwright** para automação web
- Implementar scripts fixos para navegação
- Sem custos de API

**Nova decisão (v2.0):**
- Usar **browser-use** (MCP nativo com IA-guided automation)
- LLM decide autonomamente os passos de navegação
- Requer API key de LLM

**Justificativa:**
1. ✅ **MCP já pronto** - browser-use é um MCP server nativo, não precisa implementar
2. ✅ **Robustez** - IA adapta-se a mudanças de layout automaticamente
3. ✅ **Menos código** - Não precisa manter scripts de automação complexos
4. ✅ **Alinhado com proposta** - Mais um agente de IA no sistema
5. ✅ **Suporte confirmado** - WebPlotDigitizer explicitamente suportado

**Trade-offs:**
- ⚠️ Custo de API (~$0.01-0.02 por gráfico)
- ⚠️ Latência maior (~30-60s vs ~10-20s)
- ⚠️ Não determinístico

**Documentos atualizados:**
- [ADR 003](./adrs/003-playwright-automacao-web.md) - Revisão completa
- [Arquitetura Detalhada](./arquitetura-detalhada.md) - Seção "browser-use MCP"

---

#### 2. Comunicação via stdio (não HTTP)

**Descoberta crítica:**
- browser-use MCP usa **stdio** (standard input/output), não HTTP
- FastAPI **não pode ser cliente MCP direto** via REST

**Solução implementada:**
```python
# FastAPI spawna processo MCP via stdio
from mcp.client.stdio import stdio_client

async def call_mcp():
    server_params = StdioServerParameters(
        command="uvx",
        args=["browser-use", "--mcp"]
    )
    async with stdio_client(server_params) as (read, write):
        # Comunicação via stdin/stdout
        pass
```

**Impacto na arquitetura:**
```
Antes:
Frontend → FastAPI → HTTP → browser-use MCP

Depois:
Frontend → FastAPI → spawn processo stdio → browser-use MCP
```

**Documentos atualizados:**
- [Arquitetura Detalhada](./arquitetura-detalhada.md) - Fluxos de comunicação

---

#### 3. Necessidade de Múltiplas API Keys

**Descoberta crítica:**
- Cada MCP precisa de **API key própria**
- **Não compartilham** API keys entre si

**APIs necessárias:**
| MCP | Requer LLM | API Key |
|-----|------------|---------|
| Main MCP | ✅ Sim | `ANTHROPIC_API_KEY` (ou Gemini, GPT) |
| browser-use MCP | ✅ Sim | `BROWSER_USE_API_KEY` ou similar |
| IA Local MCP | ❌ Não | Modelo local |
| PMC Extractor | ❌ Não | Scraping simples |

**Estimativa de custos:**
- MVP (100 gráficos): ~$1.50-3.00
- Produção otimizada: ~$0.01-0.02 por gráfico

**Mitigações:**
1. Usar `BROWSER_USE_API_KEY` ($10 grátis) para MVP
2. Usar Gemini (mais barato) para Main MCP
3. Cache de resultados

**Documentos atualizados:**
- [Arquitetura Detalhada](./arquitetura-detalhada.md) - Nova seção "Custos e API Keys"
- [ADR 003](./adrs/003-playwright-automacao-web.md) - Seção "Análise de Custos"

---

#### 4. Dolphin MCP Client - Não recomendado

**Descoberta:**
- Dolphin **não está na lista oficial** de clientes MCP suportados por browser-use
- Pode funcionar se suportar MCP stdio, mas não confirmado

**Decisão:**
- Usar **Dolphin apenas para testes/desenvolvimento**
- **FastAPI como cliente MCP** para produção (spawnando processos stdio)

**Arquitetura final:**
```
Frontend (React/Vue/etc)
  ↓ HTTP REST/WebSocket
FastAPI (API Gateway + MCP Client)
  ↓ stdio spawn
Main MCP (Orchestrator)
  ↓ stdio/SSE
├─ PMC Extractor MCP
├─ IA Local MCP (Docker)
└─ browser-use MCP
```

---

## Impacto nos Requisitos Acadêmicos

| Requisito | Status Anterior | Status Atual | Impacto |
|-----------|----------------|--------------|---------|
| Múltiplos agentes IA | ✅ 4 MCPs | ✅ 4 MCPs (browser-use conta como agente IA) | Sem mudança |
| Modelo local containerizado | ✅ IA Local MCP | ✅ IA Local MCP | Sem mudança |
| Comunicação MCP | ✅ MCP Protocol | ✅ MCP Protocol (stdio) | ✅ Melhorou (browser-use é MCP nativo) |
| Microserviços | ✅ Cada MCP independente | ✅ Cada MCP independente | Sem mudança |
| API | ✅ FastAPI | ✅ FastAPI (+ cliente MCP) | ✅ Melhorou (mais complexo) |

**Pontuação esperada:** 39 pts (sem mudança)

---

## Próximos Passos

### Implementação Prioritária

1. **Setup de API keys** ⚠️ URGENTE
   - [ ] Criar conta browser-use ($10 grátis)
   - [ ] Obter `BROWSER_USE_API_KEY`
   - [ ] Configurar Gemini API (free tier para Main MCP)
   - [ ] Criar `.env.example` atualizado

2. **Validação de browser-use**
   - [ ] Instalar: `pip install browser-use && uvx browser-use install`
   - [ ] Testar MCP: `uvx browser-use --mcp`
   - [ ] Verificar se consegue acessar WebPlotDigitizer
   - [ ] Validar extração de um gráfico de teste

3. **Implementação de MCPs**
   - [ ] PMC Extractor (sem dependências externas)
   - [ ] IA Local MCP + Dockerfile
   - [ ] Main MCP (orquestrador com stdio clients)
   - [ ] Integração com browser-use via stdio

4. **API Gateway**
   - [ ] FastAPI com endpoints REST
   - [ ] Cliente MCP stdio para Main MCP
   - [ ] Cliente MCP stdio para browser-use (direto, se necessário)
   - [ ] WebSocket para streaming de progresso

---

## Riscos Identificados

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Custo de API excede budget | Média | Alto | Monitorar uso, limitar testes, usar Gemini |
| browser-use não funciona com WebPlotDigitizer | Baixa | Alto | Fallback para Playwright (mais trabalho) |
| Latência alta (>60s por gráfico) | Média | Médio | Timeout, paralelização, otimizar prompts |
| Créditos $10 acabam rápido | Baixa | Médio | Limitar testes iniciais, migrar para Gemini |

---

## Decisões Pendentes

1. **Frontend:** React, Vue ou Svelte?
2. **LLM para Main MCP:** Gemini (barato) vs Claude (melhor)?
3. **Containerização de browser-use:** Vale a pena dockerizar?
4. **Cache:** Implementar desde MVP ou depois?

---

## Referências

- [browser-use Documentation](https://browser-use.com/)
- [MCP Python SDK - stdio transport](https://modelcontextprotocol.io/docs/concepts/transports#stdio)
- [Pesquisas em docs/questions.md](../questions.md)

---

**Versão:** 2.0
**Data:** 2025-11-06
**Responsável:** Equipe Nefarm AI
**Status:** 🟢 Arquitetura atualizada e validada
