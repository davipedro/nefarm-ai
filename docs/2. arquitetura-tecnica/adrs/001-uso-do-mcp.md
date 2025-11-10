# ADR 001: Uso do Model Context Protocol (MCP) para Comunicação entre Agentes

## Status
✅ **Aceito**

## Contexto

O projeto requer comunicação entre múltiplos agentes de IA especializados (PMC Extractor, IA Local, Browser Use, Orchestrator). É necessário um protocolo que:

1. Permita comunicação estruturada entre serviços
2. Seja compatível com agentes de IA modernos
3. Ofereça desacoplamento entre componentes
4. Atenda aos requisitos acadêmicos (pontuação extra por MCP/A2A)

**Alternativas consideradas:**
- REST API puro (sem protocolo específico para agentes)
- gRPC (complexidade maior, foco em performance)
- RabbitMQ/Kafka (overhead para o escopo do projeto)
- **Model Context Protocol (MCP)** ✅

## Decisão

Utilizaremos o **Model Context Protocol (MCP)** como protocolo de comunicação entre todos os agentes do sistema.

**Justificativas:**
1. **Protocolo específico para agentes de IA** - Projetado para comunicação entre LLMs e serviços
2. **SDK oficial Python** - Facilita implementação
3. **Padrão emergente** - Anthropic, OpenAI e outras empresas estão adotando
4. **Atende requisito acadêmico** - Implementação de MCP garante pontuação extra
5. **Desacoplamento natural** - Cada MCP é um servidor independente
6. **JSON-RPC 2.0** - Protocolo maduro e bem documentado
7. **Múltiplos transportes** - stdio (local) ou SSE/HTTP (remoto)

**Configuração escolhida:**
- **IA Local MCP**: SSE via HTTP (containerizado)
- **Outros MCPs**: stdio (mesmo processo/host)
- **Main MCP**: Atua como cliente MCP, conectando-se aos demais

## Consequências

### Positivas ✅
- Arquitetura alinhada com práticas modernas de IA distribuída
- Facilita substituição de componentes individuais
- Documentação automática de ferramentas (via MCP schema)
- Suporte nativo a streaming e eventos
- Pontuação extra no trabalho acadêmico

### Negativas ⚠️
- Curva de aprendizado do protocolo MCP
- Dependência de SDK ainda em evolução
- Debugging pode ser mais complexo que REST simples

### Neutras 🔄
- Necessidade de implementar client MCP no API Gateway
- Configuração de múltiplos servidores MCP (docker-compose)

## Referências
- [MCP Specification](https://modelcontextprotocol.io/specification)
- [MCP Python SDK](https://github.com/modelcontextprotocol/python-sdk)
- [MCP Security Best Practices](https://modelcontextprotocol.io/specification/draft/basic/security_best_practices)
