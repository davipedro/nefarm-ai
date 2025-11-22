# 📋 Níveis de Aceitação - MCP Client (Orquestrador)

**Serviço:** MCP Client - Orquestrador de servidores MCP

**Responsável:** -

**Última atualização:** 2025-11-16

---

## 📊 Status Atual

**Nível Atual:** Nível 1 (100% completo) ✅

**Progresso no Nível Atual:** 100%

---

## ⚙️ Nível 0: Setup Inicial

**Meta:** Estrutura básica pronta para desenvolvimento

### Checklist

- [x] Diretório criado em `backend/services/mcp_client/`
- [x] `package.json` criado
- [x] Dependências principais instaladas
- [x] README.md básico criado
- [x] **`.mcp.json` criado na raiz do projeto** ← FALTA
- [x] **`.env.example` criado** ← FALTA

### Critério de Aceitação
✅ **Nível 0 completo quando:**
- [x] Estrutura de pastas existe
- [x] Arquivo de dependências criado
- [x] README com descrição do serviço
- [x] `.mcp.json` configurado
- [x] `.env.example` documentado

**Status:** ✅ 100% - COMPLETO

---

## ⭐ Nível 1: Funcionalidade Básica

**Meta:** Orquestrador funcional localmente (sem testes, sem observabilidade avançada)

### Checklist

#### Implementação
- [x] Servidor HTTP rodando (`index.js`)
- [x] Orquestrador inicializando (`orchestrator.js`)
- [x] Endpoints principais funcionando:
  - [x] `GET /health` - retorna status do servidor
  - [x] `GET /tools` - lista ferramentas de todos os MCPs
  - [x] `POST /query` - orquestração inteligente com Gemini ✅ **TESTADO E FUNCIONANDO!**
  - [x] `POST /execute` - execução direta de tool específica

#### Integração com Test MCP
- [x] Test MCP listado em `/tools`
- [x] Tools `echo`, `greet`, `math_add` executáveis via `/execute`
- [x] Orquestração via `/query` funciona com Gemini 2.5 Flash ✅

#### Modo Mock (sem Gemini)
- [x] Fallback para lógica simples quando GEMINI_API_KEY não configurada
- [x] Keywords funcionando (imagem → ia-local, buscar → pmc, etc.)

#### Documentação Mínima
- [x] README atualizado com:
  - [x] Como instalar (`npm install`)
  - [x] Como executar (`npm start`)
  - [x] Exemplo de requisição para cada endpoint
  - [x] Estrutura do `.mcp.json`
- [x] Documentação de troubleshooting completa ✅

### Teste Manual
```bash
# 1. Instalar dependências
cd backend/services/mcp_client
npm install

# 2. Configurar (se tiver Gemini API key)
echo "GEMINI_API_KEY=sua_chave" > .env

# 3. Executar
npm start

# 4. Testar endpoints
curl http://localhost:3000/health

curl http://localhost:3000/tools

curl -X POST http://localhost:3000/query \
  -H "Content-Type: application/json" \
  -d '{"query": "classificar uma imagem de gráfico de barras"}'

curl -X POST http://localhost:3000/execute \
  -H "Content-Type: application/json" \
  -d '{
    "server_name": "ia-local-classifier",
    "tool_name": "classify_image",
    "arguments": {"image_description": "gráfico de pizza"}
  }'
```

### Critério de Aceitação
✅ **Nível 1 completo quando:**
- [x] Servidor inicia sem erros
- [x] Todos os 4 endpoints funcionam
- [x] Test MCP integrado e funcional
- [x] Modo mock funciona sem Gemini API key
- [x] README com instruções completas de execução incluindo troubleshooting

**Status:** ✅ 100% - COMPLETO! Orquestrador funcional com Gemini 2.5 Flash validado

---

## ⭐⭐ Nível 2: Validado

**Meta:** Orquestrador testado e todas as integrações validadas

### Checklist

#### Testes Básicos (Happy Path)
- [ ] **Teste 1:** Servidor inicia corretamente
- [ ] **Teste 2:** `GET /health` retorna 200 e status ok
- [ ] **Teste 3:** `GET /tools` lista IA Local
- [ ] **Teste 4:** `POST /query` em modo mock funciona
- [ ] **Teste 5:** `POST /execute` executa tool do IA Local
- [ ] Pelo menos **5 testes** passando

#### Integração Validada com Todos os MCPs
- [ ] IA Local MCP integrado e testado
- [ ] PMC MCP integrado e testado (quando pronto)
- [ ] Browser Use MCP integrado e testado (quando pronto)
- [ ] `.mcp.json` com todos os MCPs configurados

#### Documentação
- [ ] README com exemplos de integração de cada MCP
- [ ] Instruções de teste (`npm test`)
- [ ] Troubleshooting básico (portas ocupadas, MCPs não conectam, etc.)
- [ ] Documentação do formato `.mcp.json` completa

### Executar Testes
```bash
cd backend/services/mcp_client
npm test
```

### Critério de Aceitação
✅ **Nível 2 completo quando:**
- Mínimo 5 testes básicos passando
- Todos os MCPs (IA Local, PMC, Browser Use) integrados
- README com exemplos de cada MCP
- Sistema validado end-to-end

**Status:** ⚪ 0%

---

## ⭐⭐⭐ Nível 3: Robusto

**Meta:** Orquestrador confiável com tratamento de erros completo

### Checklist

#### Tratamento de Erros
- [ ] Validação de entrada em todos os endpoints
- [ ] Erro 400 se body inválido
- [ ] Erro 404 se rota não existe
- [ ] Erro 503 se MCP não disponível
- [ ] Mensagens de erro amigáveis (sem stack traces)
- [ ] Timeout de requisições (30s padrão)
- [ ] Tratamento de MCP desconectado

#### Retry Logic
- [ ] Retry com exponential backoff ao chamar MCPs
- [ ] Máximo 3 tentativas
- [ ] Configurável via variável de ambiente

#### Testes Completos
- [ ] Testes de casos extremos:
  - [ ] MCP não responde (timeout)
  - [ ] MCP retorna erro
  - [ ] Query vazia ou muito longa
  - [ ] Formato JSON inválido
- [ ] Pelo menos **15 testes** no total
- [ ] Cobertura de testes ≥ 60%

#### Logs Estruturados
- [ ] Biblioteca de logs instalada (Winston)
- [ ] Logs em formato JSON
- [ ] Níveis apropriados (INFO, WARN, ERROR)
- [ ] Informações logadas:
  - [ ] Timestamp
  - [ ] Endpoint acessado
  - [ ] MCP chamado
  - [ ] Tool executada
  - [ ] Tempo de resposta
  - [ ] Decisão do Gemini (tool escolhida + reasoning)
  - [ ] Erros e exceções

#### Configuração
- [ ] Todas as configs via variáveis de ambiente:
  - [ ] `PORT`
  - [ ] `GEMINI_API_KEY`
  - [ ] `TIMEOUT`
  - [ ] `MAX_RETRIES`
  - [ ] `LOG_LEVEL`
- [ ] `.env.example` completo e documentado

### Critério de Aceitação
✅ **Nível 3 completo quando:**
- Tratamento robusto de erros em todos os endpoints
- Retry logic implementado
- Mínimo 15 testes (incluindo edge cases)
- Logs estruturados com Winston
- Sistema confiável mesmo com MCPs instáveis

**Status:** ⚪ 0%

---

## ⭐⭐⭐⭐ Nível 4: Produção Ready

**Meta:** Orquestrador pronto para deploy em produção

### Checklist

#### Observabilidade Avançada
- [ ] `/health` verifica status de cada MCP conectado
  ```json
  {
    "status": "ok",
    "timestamp": "...",
    "mcps": {
      "ia-local-classifier": "connected",
      "pmc-mcp": "connected",
      "browser-use-mcp": "disconnected"
    }
  }
  ```
- [ ] Métricas expostas em `/metrics`:
  - [ ] Contador de requisições por endpoint
  - [ ] Contador de erros
  - [ ] Latência média
  - [ ] Uso de cada MCP (quantas vezes chamado)
- [ ] (Opcional) Formato Prometheus

#### Performance e Confiabilidade
- [ ] Timeout configurável por MCP
- [ ] Circuit breaker para MCPs que falham repetidamente
- [ ] Graceful shutdown (fecha conexões com MCPs corretamente)
- [ ] Limpa recursos ao encerrar

#### Gemini 2.0 Integration
- [ ] Migrado para Gemini 2.0 Flash
- [ ] Prompt otimizado com few-shot examples
- [ ] Cache de decisões do Gemini (15 min TTL)
- [ ] Fallback para modo mock se Gemini falhar

#### Docker
- [ ] Dockerfile criado
- [ ] Multi-stage build (se possível)
- [ ] Imagem otimizada (< 300MB)
- [ ] Usuário não-root
- [ ] Health check configurado

#### Documentação Completa
- [ ] Documentação de API (endpoints, params, responses)
- [ ] Guia de troubleshooting:
  - [ ] MCPs não conectam
  - [ ] Gemini API key inválida
  - [ ] Porta ocupada
- [ ] Exemplos completos de uso de cada MCP
- [ ] Diagrama de arquitetura do orquestrador
- [ ] Como adicionar novos MCPs ao `.mcp.json`

#### Segurança
- [ ] Variáveis sensíveis em `.env` (não hardcoded)
- [ ] Validação de input robusta
- [ ] Logs não contêm API keys ou dados sensíveis
- [ ] Rate limiting básico (ex: 100 req/min por IP)

### Critério de Aceitação
✅ **Nível 4 completo quando:**
- Health checks detalhados funcionando
- Métricas expostas
- Documentação de API completa
- Docker otimizado
- Gemini 2.0 integrado
- Pronto para produção

**Status:** ⚪ 0%

---

## 📝 Notas e Observações

### Decisões Técnicas
- Usar Express ou http nativo? **Decisão:** http nativo (já implementado)
- Gemini ou outro LLM? **Decisão:** Gemini 2.5 Flash (fallback para mock) ✅
- Biblioteca de logs? **Decisão:** Winston
- Caminhos no `.mcp.json`? **Decisão:** Usar caminhos relativos para portabilidade ✅

### Lições Aprendidas
1. **Modelo Gemini**: O modelo `gemini-pro` está desatualizado. Usar `gemini-2.5-flash` ou versões mais recentes
2. **Dotenv**: Necessário instalar e configurar `dotenv` para carregar variáveis do `.env`
3. **Caminhos relativos**: Sempre usar caminhos relativos no `.mcp.json` para garantir portabilidade entre máquinas
4. **Logs de erro**: Importante adicionar logs detalhados de erro do Gemini para debug
5. **Test MCP**: Criar um MCP de teste simples é essencial para validar a orquestração antes de integrar MCPs complexos

### Bloqueios e Dependências
- **Nível 0:** ✅ COMPLETO (100%)
- **Nível 1:** ✅ COMPLETO (100%)
- **Nível 2:** Pode ser iniciado! Depende de PMC MCP e Browser Use MCP estarem em Nível 1

### Melhorias Futuras (Pós-Nível 4)
- [ ] Suporte a múltiplas LLMs (Gemini, OpenAI, Anthropic)
- [ ] Dashboard web para visualizar métricas
- [ ] Cache persistente (Redis) para decisões do Gemini
- [ ] Suporte a webhooks para notificações

---

## 🔄 Histórico de Progresso

| Data | Evento | Responsável |
|------|--------|-------------|
| 2025-11-15 | Iniciado (Nível 0 em 70%) | - |
| 2025-11-16 | Nível 0 concluído (100%) | Claude |
| 2025-11-16 | Correção de caminho do test_mcp para relativo | Claude |
| 2025-11-16 | Instalação e configuração do dotenv | Claude |
| 2025-11-16 | Atualização do modelo Gemini para 2.5-flash | Claude |
| 2025-11-16 | Nível 1 em 80% - Orquestração com Gemini funcionando! ✅ | Claude |
| 2025-11-16 | Documentação de troubleshooting completa criada | Claude |
| 2025-11-16 | **Nível 1 concluído (100%)** ✅🎉 | Claude |
