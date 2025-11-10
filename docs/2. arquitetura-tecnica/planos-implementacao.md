# 🔀 Planos de Implementação - Nefarm AI

## Visão Geral

Este documento apresenta **duas estratégias de implementação** para a arquitetura do Nefarm AI:

- **Plano A (Preferencial):** Dolphin como cliente MCP
- **Plano B (Fallback):** FastAPI como cliente MCP

**Estratégia recomendada:** Tentar **Plano A primeiro**. Se houver problemas de compatibilidade ou limitações, migrar para **Plano B**.

---

## 📊 Comparação das Arquiteturas

### Plano A: Dolphin como Cliente MCP

```
┌─────────────────────────────────────────────────────┐
│              Frontend (React/Vue/etc)               │
│          (Interface web customizada)                │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP/WebSocket?
                       ▼
┌─────────────────────────────────────────────────────┐
│              Dolphin MCP Client                     │
│         (Cliente MCP standalone)                    │
└──────────────────────┬──────────────────────────────┘
                       │ MCP Protocol (stdio/HTTP)
                       ▼
┌─────────────────────────────────────────────────────┐
│            Main MCP (Orchestrator)                  │
│         Coordena todos os MCPs                      │
└─────┬─────────────┬──────────────┬──────────────────┘
      │             │              │
      │ stdio/SSE   │ stdio/SSE    │ stdio
      ▼             ▼              ▼
┌─────────┐   ┌──────────┐   ┌─────────────┐
│PMC MCP  │   │IA Local  │   │browser-use  │
│         │   │MCP       │   │MCP          │
│(scraper)│   │(Docker)  │   │(IA web auto)│
└─────────┘   └──────────┘   └─────────────┘
```

### Plano B: FastAPI como Cliente MCP

```
┌─────────────────────────────────────────────────────┐
│              Frontend (React/Vue/etc)               │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP REST/WebSocket
                       ▼
┌─────────────────────────────────────────────────────┐
│         FastAPI (API Gateway + MCP Client)          │
│   ├─ REST endpoints (POST /extract)                 │
│   ├─ WebSocket (streaming de progresso)             │
│   └─ MCP Client (spawna processos stdio)            │
└─────┬─────────────┬──────────────┬──────────────────┘
      │             │              │
      │ stdio spawn │ stdio spawn  │ stdio spawn
      ▼             ▼              ▼
┌─────────┐   ┌──────────┐   ┌─────────────┐
│Main MCP │   │IA Local  │   │browser-use  │
│(orquest)│   │MCP       │   │MCP          │
│         │   │(Docker)  │   │(IA web auto)│
└─────┬───┘   └──────────┘   └─────────────┘
      │
      │ stdio
      ▼
┌─────────┐
│PMC MCP  │
│(scraper)│
└─────────┘
```

---

## ⚖️ Comparação Detalhada

| Aspecto | Plano A (Dolphin) | Plano B (FastAPI) |
|---------|-------------------|-------------------|
| **Complexidade** | 🟢 Baixa (Dolphin pronto) | 🟡 Média (precisa implementar cliente MCP) |
| **Controle** | 🟡 Limitado (depende do Dolphin) | 🟢 Total (código próprio) |
| **Desenvolvimento** | 🟢 Rápido (menos código) | 🟡 Moderado (mais código) |
| **Debugging** | 🔴 Difícil (Dolphin é caixa preta) | 🟢 Fácil (controle total) |
| **Customização UI** | 🔴 Limitada (interface do Dolphin) | 🟢 Total (frontend próprio) |
| **Integração Frontend** | ❓ **Incerta** (não confirmado) | 🟢 Nativa (REST/WebSocket) |
| **Documentação** | 🟡 Limitada | 🟢 Ampla (FastAPI + MCP SDK) |
| **Produção** | 🔴 Não recomendado | 🟢 Pronto para produção |
| **Portabilidade** | 🟡 Depende do Dolphin | 🟢 Independente |
| **Manutenção** | 🔴 Depende de terceiros | 🟢 Sob controle |

**Legenda:** 🟢 Vantagem | 🟡 Neutro/Aceitável | 🔴 Desvantagem | ❓ Incerto

---

## 📋 Plano A: Dolphin como Cliente MCP

### Objetivo

Validar se o **Dolphin MCP Client** pode:
1. Se comunicar com o Main MCP
2. Receber input de um frontend customizado
3. Retornar resultados para exibição

### Arquitetura

**Componentes:**
- **Frontend:** Interface web leve (HTML/JS simples ou React)
- **Dolphin:** Cliente MCP que conecta ao Main MCP
- **Main MCP:** Orquestrador (spawna PMC, IA Local, browser-use)
- **MCPs especializados:** PMC, IA Local (Docker), browser-use

**Comunicação Frontend ↔ Dolphin:**
- ❓ **INCERTO** - Precisa investigar se Dolphin expõe API/WebSocket
- Possibilidades:
  1. Dolphin tem API REST própria (improvável)
  2. Dolphin aceita comandos via CLI (possível)
  3. Dolphin tem plugin/extensão system (possível)
  4. **Não é possível** → Migrar para Plano B

### Passos de Implementação

#### Fase 1: Investigação do Dolphin (1-2 dias)

**Objetivo:** Determinar se é viável usar Dolphin com frontend customizado

1. **Instalação e exploração**
   ```bash
   # Instalar Dolphin
   git clone https://github.com/QuixiAI/dolphin-mcp
   cd dolphin-mcp
   # Seguir instruções de instalação
   ```

2. **Testes de comunicação**
   - [ ] Verificar se Dolphin aceita comandos via CLI
   - [ ] Investigar se expõe API HTTP/WebSocket
   - [ ] Testar conexão com MCP de exemplo
   - [ ] Verificar logs e formatos de entrada/saída

3. **Critérios de viabilidade**
   - ✅ **PROSSEGUIR se:**
     - Dolphin expõe API REST/WebSocket
     - Ou aceita comandos programáticos via CLI
     - E consegue retornar resultados estruturados

   - ❌ **MIGRAR PARA PLANO B se:**
     - Dolphin é apenas CLI interativo (sem API)
     - Não consegue receber input externo
     - Não retorna resultados em formato estruturado

#### Fase 2: Implementação dos MCPs (Paralelo)

**Enquanto testa Dolphin, implementar MCPs independentemente:**

1. **PMC Extractor MCP** (2-3 dias)
   - [ ] Scraper básico do PubMed Central
   - [ ] Extração de URLs de imagens + legendas
   - [ ] MCP server com stdio transport
   - [ ] Testes unitários

2. **IA Local MCP** (3-4 dias)
   - [ ] Integração com DistilBERT
   - [ ] Classificador de legendas
   - [ ] Dockerfile + containerização
   - [ ] MCP server com SSE transport
   - [ ] Testes de classificação

3. **Main MCP** (2-3 dias)
   - [ ] Orquestrador básico
   - [ ] Cliente MCP para PMC + IA Local
   - [ ] Cliente MCP para browser-use
   - [ ] Lógica de fluxo sequencial

#### Fase 3: Integração (Se Dolphin for viável)

1. **Conectar Dolphin ao Main MCP**
   ```bash
   # Exemplo hipotético (depende da implementação do Dolphin)
   dolphin connect --server stdio --command "python -m main_mcp.server"
   ```

2. **Criar interface Frontend → Dolphin**
   - Opção A: API REST (se Dolphin expor)
   - Opção B: CLI wrapper (se Dolphin for CLI)
   - Opção C: Plugin/extensão (se Dolphin suportar)

3. **Testar fluxo end-to-end**
   - Frontend envia PMCID
   - Dolphin repassa para Main MCP
   - Main MCP orquestra PMC → IA Local → browser-use
   - Resultados retornam para Frontend

### Pontos de Decisão

**Checkpoint 1 (Após Fase 1):**
```
Dolphin é viável para integração com frontend?
├─ SIM → Continuar Plano A (Fase 3)
└─ NÃO → Migrar para Plano B
```

**Checkpoint 2 (Após tentativa de integração):**
```
Integração Dolphin ↔ Frontend funciona bem?
├─ SIM → Prosseguir com Plano A
└─ NÃO → Migrar para Plano B (MCPs já estão prontos)
```

### Riscos do Plano A

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Dolphin não tem API externa | Alta | Alto | Migrar para Plano B |
| Dolphin não documenta integrações | Média | Alto | Investigar código-fonte |
| Performance ruim (overhead) | Baixa | Médio | Medir e decidir se aceitável |
| Debugging complexo | Média | Médio | Logs detalhados |

---

## 🚀 Plano B: FastAPI como Cliente MCP

### Objetivo

Implementar um **API Gateway em FastAPI** que:
1. Expõe endpoints REST/WebSocket para o frontend
2. Atua como **cliente MCP** (spawna processos via stdio)
3. Orquestra comunicação entre MCPs
4. Retorna resultados estruturados

### Arquitetura

**Componentes:**
- **Frontend:** React/Vue/Svelte (total liberdade)
- **FastAPI:** API Gateway + MCP Client
- **MCPs:** Main, PMC, IA Local, browser-use

**Comunicação:**
- Frontend ↔ FastAPI: REST (comandos) + WebSocket (progresso)
- FastAPI ↔ MCPs: stdio (spawn de processos)

### Passos de Implementação

#### Fase 1: API Gateway Base (2-3 dias)

1. **Setup FastAPI**
   ```bash
   pip install fastapi uvicorn pydantic
   ```

2. **Endpoints básicos**
   ```python
   # src/api_gateway/main.py

   @app.post("/api/extract")
   async def extract_graphs(request: ExtractRequest):
       """Extrai gráficos de um artigo PMC"""
       # Spawna Main MCP via stdio
       # Retorna resultados

   @app.websocket("/ws/progress")
   async def websocket_progress(websocket: WebSocket):
       """Streaming de progresso em tempo real"""
       # Envia atualizações conforme MCPs processam

   @app.get("/api/health")
   async def health_check():
       """Verifica se MCPs estão respondendo"""
   ```

3. **Modelos Pydantic**
   ```python
   class ExtractRequest(BaseModel):
       pmcid: str
       include_metadata: bool = True

   class GraphData(BaseModel):
       figure_id: str
       caption: str
       image_url: str
       data_points: List[Point]
       metadata: dict

   class ExtractResponse(BaseModel):
       pmcid: str
       article_title: str
       graphs_found: int
       graphs: List[GraphData]
       processing_time: float
   ```

#### Fase 2: Cliente MCP em FastAPI (3-4 dias)

1. **Integração MCP SDK**
   ```python
   # src/api_gateway/mcp_client.py

   from mcp import ClientSession, StdioServerParameters
   from mcp.client.stdio import stdio_client

   class MCPClientManager:
       async def call_main_mcp(self, tool: str, args: dict):
           """Spawna Main MCP e chama tool"""
           server_params = StdioServerParameters(
               command="python",
               args=["-m", "main_mcp.server"],
               env={
                   "GOOGLE_API_KEY": os.getenv("GOOGLE_API_KEY")
               }
           )

           async with stdio_client(server_params) as (read, write):
               async with ClientSession(read, write) as session:
                   await session.initialize()
                   result = await session.call_tool(tool, args)
                   return result

       async def call_browser_use_mcp(self, image_url: str):
           """Spawna browser-use MCP diretamente"""
           server_params = StdioServerParameters(
               command="uvx",
               args=["browser-use", "--mcp"],
               env={
                   "BROWSER_USE_API_KEY": os.getenv("BROWSER_USE_API_KEY")
               }
           )
           # ... similar ao acima
   ```

2. **Lógica de orquestração**
   ```python
   # src/api_gateway/orchestrator.py

   async def extract_graphs_flow(pmcid: str):
       """Orquestra fluxo completo de extração"""

       # 1. Chamar PMC Extractor via Main MCP
       article_data = await mcp_client.call_main_mcp(
           "extract_images",
           {"pmcid": pmcid}
       )

       # 2. Classificar legendas via IA Local (via Main MCP)
       graphs = await mcp_client.call_main_mcp(
           "classify_graphs",
           {"images": article_data["images"]}
       )

       # 3. Extrair dados via browser-use (paralelo)
       tasks = [
           mcp_client.call_browser_use_mcp(g["image_url"])
           for g in graphs
       ]
       extracted_data = await asyncio.gather(*tasks)

       return {
           "pmcid": pmcid,
           "graphs": extracted_data
       }
   ```

#### Fase 3: WebSocket para Progresso (2 dias)

1. **Streaming de eventos**
   ```python
   @app.websocket("/ws/progress/{session_id}")
   async def progress_stream(websocket: WebSocket, session_id: str):
       await websocket.accept()

       async for event in extract_graphs_with_progress(pmcid):
           await websocket.send_json({
               "type": event.type,  # "pmc_extraction", "classification", etc.
               "status": event.status,  # "in_progress", "completed"
               "message": event.message,
               "progress": event.progress  # 0-100
           })
   ```

2. **Frontend consome WebSocket**
   ```javascript
   // Frontend (React exemplo)
   const ws = new WebSocket(`ws://localhost:8000/ws/progress/${sessionId}`);

   ws.onmessage = (event) => {
       const data = JSON.parse(event.data);
       updateProgressBar(data.progress);
       showMessage(data.message);
   };
   ```

#### Fase 4: Frontend (3-4 dias)

1. **Interface de busca**
   - Input para PMCID ou termo de pesquisa
   - Botão "Extrair Gráficos"
   - Barra de progresso (WebSocket)

2. **Visualização de resultados**
   - Cards com gráficos encontrados
   - Preview das imagens
   - Dados extraídos em tabela
   - Botões de download (CSV, JSON)

3. **Tecnologia sugerida**
   ```bash
   # React + TypeScript + Vite
   npm create vite@latest frontend -- --template react-ts
   cd frontend
   npm install axios recharts
   ```

### Vantagens do Plano B

✅ **Controle total** - Código próprio, sem dependências de terceiros
✅ **Debugging fácil** - Logs em cada camada
✅ **Customização** - Frontend totalmente customizável
✅ **Produção-ready** - FastAPI é battle-tested
✅ **Documentação** - OpenAPI automático
✅ **Testabilidade** - Fácil criar testes unitários/integração
✅ **Escalabilidade** - Pode adicionar cache, rate limiting, etc.

### Desvantagens do Plano B

⚠️ **Mais código** - Precisa implementar cliente MCP manualmente
⚠️ **Tempo maior** - ~2-3 semanas vs ~1-2 semanas (Plano A, se funcionar)
⚠️ **Complexidade** - Gerenciar spawning de processos, timeouts, etc.

---

## 🎯 Critérios de Migração

### Quando migrar do Plano A para o Plano B?

**Migrar IMEDIATAMENTE se:**
1. ❌ Dolphin não expõe API/WebSocket
2. ❌ Não consegue receber input programático
3. ❌ Não retorna resultados estruturados (JSON/dict)
4. ❌ Investigação leva >3 dias sem progresso

**Considerar migração se:**
1. ⚠️ Integração Dolphin ↔ Frontend é muito complexa
2. ⚠️ Performance é ruim (>5s de overhead)
3. ⚠️ Debugging é extremamente difícil
4. ⚠️ Limitações de customização são bloqueantes

**Permanecer no Plano A se:**
1. ✅ Dolphin funciona como esperado
2. ✅ Integração com frontend é simples
3. ✅ Performance é aceitável
4. ✅ Atende aos requisitos do MVP

---

## 📅 Timeline Comparativo

### Plano A (Otimista)

```
Semana 1:
├─ Dias 1-2: Investigação Dolphin
├─ Dias 3-5: Implementação PMC MCP
└─ Dias 6-7: Implementação IA Local MCP (paralelo)

Semana 2:
├─ Dias 1-3: Implementação Main MCP
├─ Dias 4-5: Integração Dolphin ↔ Main MCP
└─ Dias 6-7: Testes end-to-end

Semana 3:
├─ Frontend básico
└─ Refinamentos

Total: ~3 semanas (SE Dolphin funcionar)
```

### Plano B (Realista)

```
Semana 1:
├─ Dias 1-3: Implementação PMC MCP
├─ Dias 4-7: Implementação IA Local MCP + Docker

Semana 2:
├─ Dias 1-3: Implementação Main MCP
├─ Dias 4-5: FastAPI base + endpoints REST
└─ Dias 6-7: Cliente MCP em FastAPI

Semana 3:
├─ Dias 1-2: WebSocket para progresso
├─ Dias 3-5: Frontend (React)
└─ Dias 6-7: Integração e testes

Total: ~3 semanas (GARANTIDO)
```

### Plano A → B (Pior caso)

```
Semana 1:
├─ Dias 1-3: Investigação Dolphin (FALHA)
├─ Dias 4-7: Implementação MCPs (aproveitado)

Semana 2-4:
└─ Seguir Plano B normalmente

Total: ~4 semanas (por causa da investigação)
```

**Recomendação:** Limitar investigação do Dolphin a **2-3 dias**. Se não houver progresso claro, migrar para Plano B imediatamente.

---

## 🧪 Plano de Testes para Decisão

### Testes do Plano A (Dolphin)

**Objetivo:** Determinar viabilidade em **2-3 dias máximo**

1. **Dia 1: Instalação e exploração**
   ```bash
   # Instalar Dolphin
   git clone https://github.com/QuixiAI/dolphin-mcp
   cd dolphin-mcp
   # Seguir README

   # Testar comandos básicos
   dolphin --help
   dolphin connect --help
   ```

2. **Dia 2: Teste com MCP de exemplo**
   - Criar MCP server simples (echo server)
   - Tentar conectar Dolphin ao MCP
   - Verificar se consegue enviar comandos e receber respostas

   ```python
   # test_mcp.py - MCP de exemplo
   from mcp.server import Server

   server = Server("test-mcp")

   @server.tool()
   def echo(message: str) -> str:
       return f"Echo: {message}"

   if __name__ == "__main__":
       server.run()
   ```

3. **Dia 3: Teste de integração com frontend**
   - Criar HTML simples com fetch/axios
   - Tentar enviar requisição para Dolphin
   - Verificar se consegue receber resposta

   **Checkpoint:** Se até aqui não funcionar → **MIGRAR PARA PLANO B**

### Teste do Plano B (FastAPI)

**Validação rápida (1 dia):**

```python
# test_fastapi_mcp.py
from fastapi import FastAPI
from mcp.client.stdio import stdio_client
from mcp import ClientSession, StdioServerParameters

app = FastAPI()

@app.get("/test-mcp")
async def test_mcp():
    # Spawnar MCP de exemplo
    server_params = StdioServerParameters(
        command="python",
        args=["test_mcp.py"]
    )

    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            result = await session.call_tool("echo", {"message": "Hello"})
            return result

# Executar: uvicorn test_fastapi_mcp:app
# Testar: curl http://localhost:8000/test-mcp
```

**Resultado esperado:** Funciona imediatamente (Plano B é garantido)

---

## 📊 Recomendação Final

### Estratégia Sugerida

```
┌─────────────────────────────────────────┐
│   Fase 1: Investigação (2-3 dias)      │
│   Testar viabilidade do Dolphin        │
└────────────┬────────────────────────────┘
             │
             ├─ Dolphin viável?
             │
    ┌────────┴────────┐
    │                 │
   SIM               NÃO
    │                 │
    ▼                 ▼
┌─────────┐     ┌─────────┐
│ Plano A │     │ Plano B │
│(Dolphin)│     │(FastAPI)│
└─────────┘     └─────────┘
     │               │
     │               │
     └───────┬───────┘
             │
             ▼
     ┌───────────────┐
     │ Implementação │
     │   dos MCPs    │
     │  (Reutilizável│
     │  em ambos os  │
     │    planos)    │
     └───────────────┘
```

**Timeline otimizada:**
1. **Dias 1-3:** Investigar Dolphin + Implementar PMC MCP (paralelo)
2. **Decisão:** Prosseguir com Plano A ou B
3. **Resto:** Implementar arquitetura escolhida

**Custo de mudança:** Baixo (MCPs são independentes da escolha)

---

## 📝 Checklist de Decisão

### Antes de começar

- [ ] Ler documentação do Dolphin MCP
- [ ] Verificar issues no GitHub do Dolphin
- [ ] Confirmar que tem API keys necessárias (BROWSER_USE, GOOGLE/ANTHROPIC)
- [ ] Definir prazo máximo para investigação (recomendado: 3 dias)

### Durante investigação (Plano A)

- [ ] Dolphin instalou corretamente
- [ ] Consegue executar comandos básicos
- [ ] Consegue conectar a MCP server de teste
- [ ] Consegue receber input externo (CLI ou API)
- [ ] Consegue retornar resultados estruturados
- [ ] Performance é aceitável

### Ponto de decisão

```
Checklist acima tem quantos ✅?
├─ 5-6 itens ✅ → Prosseguir com Plano A
├─ 3-4 itens ✅ → Considerar Plano B
└─ 0-2 itens ✅ → MIGRAR para Plano B imediatamente
```

---

## 🎓 Impacto nos Requisitos Acadêmicos

**Ambos os planos atendem igualmente:**

| Requisito | Plano A | Plano B |
|-----------|---------|---------|
| Múltiplos agentes IA | ✅ | ✅ |
| Modelo local containerizado | ✅ | ✅ |
| Comunicação MCP | ✅ | ✅ |
| Microserviços | ✅ | ✅ |
| API | ✅ (Dolphin?) | ✅ (FastAPI) |

**Pontuação:** 39 pts em ambos os casos

**Diferença:** Plano B é mais **demonstrável** e **explicável** (código próprio)

---

## 🔗 Referências

- [Dolphin MCP GitHub](https://github.com/QuixiAI/dolphin-mcp)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [MCP Python SDK - stdio client](https://github.com/modelcontextprotocol/python-sdk)
- [WebSocket with FastAPI](https://fastapi.tiangolo.com/advanced/websockets/)

---

**Próximo passo:** Decidir se inicia investigação do Plano A ou vai direto para Plano B (mais seguro).

**Recomendação pessoal:** Gastar **2 dias** testando Dolphin. Se não funcionar bem, migrar para FastAPI sem culpa. 🚀
