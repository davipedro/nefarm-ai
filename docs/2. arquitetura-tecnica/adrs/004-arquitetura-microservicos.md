# ADR 004: Arquitetura de Microserviços com MCP Servers

## Status
✅ **Aceito**

## Contexto

O projeto requer múltiplos agentes de IA trabalhando em conjunto. Decisão arquitetural fundamental:

**Alternativas:**
1. **Monolito** - Todas as funcionalidades em um único processo
2. **Microserviços** - Cada agente como serviço independente
3. **Serverless** - Funções isoladas (AWS Lambda, etc.)

**Requisitos acadêmicos:**
- "As IAs devem funcionar como microserviços" (3 pts)
- Comunicação distribuída entre agentes

## Decisão

Implementaremos uma **arquitetura de microserviços (SOA - Service-Oriented Architecture)** onde cada agente de IA é um **MCP Server independente**.

**Estrutura:**
```
┌─────────────────────────────────────────┐
│         API Gateway (FastAPI)           │  ← Interface REST/WebSocket para frontend
└─────────────┬───────────────────────────┘
              │ MCP Client
              ▼
┌─────────────────────────────────────────┐
│       Main MCP (Orchestrator)           │  ← MCP Server + MCP Client
└─┬────────┬────────┬─────────────────────┘
  │        │        │
  │ MCP    │ MCP    │ MCP
  ▼        ▼        ▼
┌────┐  ┌────┐  ┌────────┐
│PMC │  │IA  │  │Browser │  ← MCP Servers especializados
│MCP │  │MCP │  │Use MCP │
└────┘  └────┘  └────────┘
```

**Características de cada microserviço:**

| Serviço | Responsabilidade | Estado | Comunicação | Container |
|---------|------------------|--------|-------------|-----------|
| **API Gateway** | Interface externa | Stateless | HTTP/WS → MCP | Opcional |
| **Main MCP** | Orquestração | Stateless | MCP client/server | Não |
| **PMC MCP** | Extração PMC | Stateless | MCP server (stdio) | Não |
| **IA Local MCP** | Classificação | Stateless | MCP server (SSE) | ✅ **Sim** |
| **Browser Use MCP** | Automação web | Stateless | MCP server (stdio) | Opcional |

## Justificativa

### Por que Microserviços?

1. **Separação de responsabilidades** - Cada agente tem função única e bem definida
2. **Escalabilidade independente** - IA Local pode ter múltiplas instâncias
3. **Substituibilidade** - Trocar implementação de um MCP sem afetar outros
4. **Desenvolvimento paralelo** - Times podem trabalhar em MCPs diferentes
5. **Tolerância a falhas** - Falha em um MCP não derruba o sistema
6. **Atende requisito acadêmico** - Microserviços são explicitamente requeridos

### Por que MCP como protocolo de microserviços?

MCP (Model Context Protocol) é especialmente adequado porque:
- Protocolo nativo para comunicação entre agentes de IA
- Suporta múltiplos transportes (stdio, SSE, WebSocket)
- Schema de ferramentas autodocumentado
- Permite composição de agentes (Main MCP usa outros MCPs)

## Padrões de Comunicação

### Padrão 1: Orquestração (Synchronous)
```python
# Main MCP orquestra chamadas sequenciais
async def extract_graphs(pmcid: str):
    # 1. Extração
    images = await pmc_mcp.extract_images(pmcid)

    # 2. Classificação
    graphs = await ia_mcp.classify_batch([img.caption for img in images])

    # 3. Extração de dados
    data = []
    for graph in graphs:
        extracted = await browser_mcp.extract_graph_data(graph.url)
        data.append(extracted)

    return data
```

### Padrão 2: Pipeline (Asynchronous)
```python
# Futuro: Usando filas para processamento assíncrono
images_queue → [IA MCP] → graphs_queue → [Browser MCP] → results_queue
```

## Consequências

### Positivas ✅
- **Modularidade** - Fácil adicionar/remover MCPs
- **Testabilidade** - Cada MCP pode ser testado isoladamente
- **Reusabilidade** - MCPs podem ser reutilizados em outros projetos
- **Deploy flexível** - Containers independentes
- **Debugging facilitado** - Logs isolados por serviço
- **Pontuação completa** - Atende requisitos acadêmicos

### Negativas ⚠️
- **Complexidade operacional** - Mais serviços para gerenciar
- **Latência** - Overhead de comunicação entre serviços
- **Debugging distribuído** - Precisa de correlation IDs
- **Configuração** - Múltiplos arquivos de config

### Neutras 🔄
- Necessário orquestrador (docker-compose ou Kubernetes)
- Precisa de estratégia de logging centralizado (futuro)
- Monitoramento distribuído (futuro)

## Alternativas Descartadas

### Monolito
**Por que não:**
- Violaria requisito de microserviços
- Acoplamento alto entre componentes
- Dificuldade de escalar IA Local independentemente

**Quando considerar:**
- MVP rápido para validação
- Recursos limitados de infraestrutura

### Serverless
**Por que não:**
- Cold start inaceitável para modelo IA (5-10s)
- Custo elevado para processamento intensivo
- Complexidade de orquestração (Step Functions)

## Princípios de Design

1. **Single Responsibility** - Cada MCP faz uma coisa bem
2. **Stateless** - Sem estado persistente nos MCPs
3. **Idempotência** - Mesma requisição = mesmo resultado
4. **Fail Fast** - Erros devem ser propagados rapidamente
5. **Circuit Breaker** - Proteger contra MCPs indisponíveis

## Evolução Futura

**V1 (MVP):**
- Comunicação síncrona via MCP
- Orquestração simples (Main MCP)

**V2 (Produção):**
- Filas assíncronas (RabbitMQ)
- Cache de resultados (Redis)
- Rate limiting distribuído
- Observabilidade (Prometheus + Grafana)

## Referências
- [Microservices Patterns - Chris Richardson](https://microservices.io/patterns/index.html)
- [MCP as Microservice Protocol](https://modelcontextprotocol.io/)
- [Building Microservices - Sam Newman](https://www.oreilly.com/library/view/building-microservices/9781491950340/)
