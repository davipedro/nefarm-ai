# 📋 Template: Níveis de Aceitação - [NOME DO SERVIÇO]

**Serviço:** [Nome completo do serviço]

**Responsável:** [Nome ou deixar vazio]

**Última atualização:** [Data]

---

## 📊 Status Atual

**Nível Atual:** [0, 1, 2, 3 ou 4]

**Progresso no Nível Atual:** [X]%

---

## ⚙️ Nível 0: Setup Inicial

**Meta:** Estrutura básica pronta para desenvolvimento

### Checklist

- [ ] Diretório criado em `backend/services/[nome]/`
- [ ] `package.json` ou `requirements.txt` criado
- [ ] Dependências principais identificadas
- [ ] README.md básico criado
- [ ] `.gitignore` configurado (se necessário)

### Critério de Aceitação
✅ **Nível 0 completo quando:**
- Estrutura de pastas existe
- Arquivo de dependências criado
- README com descrição do serviço

---

## ⭐ Nível 1: Funcionalidade Básica

**Meta:** Serviço funcional localmente (sem testes, sem observabilidade)

### Checklist

#### Implementação
- [ ] Código principal implementado
- [ ] [Listar endpoints/tools principais]
  - [ ] Endpoint/Tool 1: [Nome e descrição]
  - [ ] Endpoint/Tool 2: [Nome e descrição]
  - [ ] Endpoint/Tool 3: [Nome e descrição]
- [ ] Roda localmente sem erros

#### Integração Básica
- [ ] Configurado no `.mcp.json` (se for MCP)
- [ ] Comunica com MCP Client (se aplicável)
- [ ] OU: Endpoint HTTP acessível (se for Gateway/API)

#### Documentação Mínima
- [ ] README atualizado com:
  - [ ] Como instalar
  - [ ] Como executar
  - [ ] Exemplo de uso básico

### Teste Manual
```bash
# Comandos para testar manualmente
# Adicionar exemplos específicos do serviço
```

### Critério de Aceitação
✅ **Nível 1 completo quando:**
- Funcionalidade básica implementada
- Roda localmente sem erros
- Pode ser chamado por outro serviço/manualmente
- README com instruções de execução

---

## ⭐⭐ Nível 2: Validado

**Meta:** Serviço testado e integração validada

### Checklist

#### Testes Básicos (Happy Path)
- [ ] Teste 1: [Descrição do teste principal]
- [ ] Teste 2: [Outro teste importante]
- [ ] Teste 3: [Mais um teste crítico]
- [ ] Pelo menos **3 testes** passando

#### Integração Validada
- [ ] MCP Client lista tools do serviço (se MCP)
- [ ] Execução via `/execute` funciona (se MCP)
- [ ] Orquestração via `/query` funciona (se MCP)
- [ ] OU: Integração com Gateway validada (se aplicável)

#### Documentação
- [ ] README com exemplos de todas as funções principais
- [ ] Instruções de teste
- [ ] Troubleshooting básico

### Executar Testes
```bash
# Comandos para rodar os testes
npm test
# ou
pytest
```

### Critério de Aceitação
✅ **Nível 2 completo quando:**
- Mínimo 3 testes básicos passando
- Integração com outro serviço validada
- README com exemplos completos

---

## ⭐⭐⭐ Nível 3: Robusto

**Meta:** Serviço confiável com tratamento de erros completo

### Checklist

#### Tratamento de Erros
- [ ] Validação de entrada em todos os endpoints/tools
- [ ] Mensagens de erro amigáveis
- [ ] Não expõe stack traces ou detalhes internos
- [ ] Tratamento de timeout
- [ ] Tratamento de conexão perdida (se aplicável)

#### Testes Completos
- [ ] Testes de casos extremos (edge cases)
- [ ] Testes de erro (inputs inválidos)
- [ ] Testes de timeout
- [ ] Pelo menos **10 testes** no total
- [ ] Cobertura de testes ≥ 60%

#### Logs Estruturados
- [ ] Logs em formato JSON ou estruturado
- [ ] Níveis de log apropriados (DEBUG, INFO, WARN, ERROR)
- [ ] Informações importantes logadas:
  - [ ] Timestamp
  - [ ] Request ID (se aplicável)
  - [ ] User/origem (se aplicável)
  - [ ] Duração de operações

#### Configuração
- [ ] Todas as configurações via variáveis de ambiente
- [ ] `.env.example` criado e documentado

### Critério de Aceitação
✅ **Nível 3 completo quando:**
- Tratamento robusto de erros em todas as funções
- Mínimo 10 testes (incluindo edge cases)
- Logs estruturados implementados
- Sistema confiável e previsível

---

## ⭐⭐⭐⭐ Nível 4: Produção Ready

**Meta:** Serviço pronto para deploy em produção

### Checklist

#### Observabilidade
- [ ] Endpoint `/health` implementado
- [ ] Health check retorna status de dependências
- [ ] Métricas expostas (requisições, latência, erros)
- [ ] (Opcional) Integração com Prometheus/similar

#### Performance e Confiabilidade
- [ ] Timeout configurável
- [ ] Retry logic implementado (onde aplicável)
- [ ] Circuit breaker (se integração externa)
- [ ] Graceful shutdown

#### Docker
- [ ] Dockerfile otimizado (multi-stage se possível)
- [ ] Imagem < 500MB (se possível)
- [ ] Usuário não-root
- [ ] Health check no docker-compose

#### Documentação Completa
- [ ] API documentation (Swagger/OpenAPI ou similar)
- [ ] Guia de troubleshooting
- [ ] Exemplos de todas as funcionalidades
- [ ] Diagrama de arquitetura do serviço
- [ ] Documentação de variáveis de ambiente

#### Segurança
- [ ] Sem credenciais hardcoded
- [ ] Validação de input robusta
- [ ] Rate limiting (se aplicável)
- [ ] Logs não contêm dados sensíveis

### Critério de Aceitação
✅ **Nível 4 completo quando:**
- Health checks funcionando
- Métricas expostas
- Documentação completa
- Docker otimizado
- Pronto para produção

---

## 📝 Notas e Observações

### Decisões Técnicas
- [Anotar decisões importantes tomadas durante desenvolvimento]

### Bloqueios e Dependências
- [Listar o que está bloqueando progresso, se houver]

### Melhorias Futuras (Pós-Nível 4)
- [ ] [Ideia de melhoria 1]
- [ ] [Ideia de melhoria 2]

---

## 🔄 Histórico de Progresso

| Data | Evento | Responsável |
|------|--------|-------------|
| YYYY-MM-DD | Nível 0 atingido | - |
| YYYY-MM-DD | Nível 1 atingido | - |
| YYYY-MM-DD | Nível 2 atingido | - |
| YYYY-MM-DD | Nível 3 atingido | - |
| YYYY-MM-DD | Nível 4 atingido | - |
