# 🗺️ Roadmap de Desenvolvimento - NEFARM-AI

## 📋 Visão Geral

Este documento apresenta o planejamento de desenvolvimento do projeto NEFARM-AI usando **níveis de aceitação incrementais**.

---

## 🎯 Estratégia: Níveis de Aceitação

### Princípio Fundamental
**Todos os serviços evoluem juntos, nível por nível.**

Ao invés de completar um serviço 100% antes de começar outro, garantimos que todos os serviços atinjam o **mesmo nível de maturidade** antes de avançar para o próximo.

```
❌ EVITAR (Desenvolvimento vertical):
MCP Client: ████████████ 100%
PMC MCP:    ██░░░░░░░░░░  20%
Gateway:    ░░░░░░░░░░░░   0%

✅ PREFERIR (Desenvolvimento horizontal):
MCP Client: ████░░░░░░░░  40%  ← Nível 2
PMC MCP:    ████░░░░░░░░  40%  ← Nível 2
Gateway:    ████░░░░░░░░  40%  ← Nível 2
```

---

## 📊 Sistema de Níveis

### Nível 0: Setup Inicial
- Estrutura de pastas criada
- Dependências instaladas
- README básico

### Nível 1: Funcionalidade Básica ⭐
- Código funcional mínimo
- Sem testes
- Sem observabilidade
- **Meta:** Funciona localmente

### Nível 2: Validado ⭐⭐
- Testes básicos (happy path)
- Integração validada com MCP Client
- **Meta:** Confiável para desenvolvimento

### Nível 3: Robusto ⭐⭐⭐
- Tratamento de erros
- Testes de casos extremos
- Logs básicos
- **Meta:** Pronto para staging

### Nível 4: Produção Ready ⭐⭐⭐⭐
- Health checks
- Métricas
- Documentação completa
- **Meta:** Deploy em produção

---

## 📈 Status Atual do Sistema

**Nível Global Atual:** 🎯 **Nível 0 → 1** (em andamento)

| Serviço | Nível Atual | Meta Imediata | Responsável |
|---------|-------------|---------------|-------------|
| **IA Local MCP** | ⭐ Nível 1 | Manter | - |
| **MCP Client** | Nível 0 | ⭐ Nível 1 | - |
| **PMC MCP** | Nível 0 | ⭐ Nível 1 | - |
| **Browser Use MCP** | Nível 0 | ⭐ Nível 1 | - |
| **API Gateway** | Nível 0 | ⭐ Nível 1 | - |

**Regra:** Só podemos avançar para Nível 2 quando **TODOS** estiverem em Nível 1.

---

## 🎯 Roadmap por Nível

### Sprint 1: Alcançar Nível 1 em TODOS os serviços

**Ordem de desenvolvimento:**

1. **MCP Client** - base para os demais (bloqueante)
2. **PMC MCP + Browser Use MCP** (podem ser feitos em paralelo)
3. **API Gateway**

**Entrega:** Sistema básico funcionando ponta a ponta (sem testes ainda)

---

### Sprint 2: Alcançar Nível 2 em TODOS os serviços

**Tarefas:**
- Adicionar testes básicos em cada serviço
- Validar integração de cada um com MCP Client
- Docker Compose básico

**Entrega:** Sistema validado e testado

---

### Sprint 3: Alcançar Nível 3 em TODOS os serviços

**Tarefas:**
- Tratamento robusto de erros
- Logs estruturados
- Testes de casos extremos

**Entrega:** Sistema robusto e confiável

---

### Sprint 4: Alcançar Nível 4 em TODOS os serviços

**Tarefas:**
- Health checks
- Métricas e monitoramento
- Documentação completa
- Testes E2E

**Entrega:** Sistema pronto para produção

---

### Sprint 5: Frontend

Apenas após backend completo (Nível 3 ou 4)

---

## 👥 Trabalho em Equipe

### Durante Sprint 1 (Nível 1):
```
Pessoa A: MCP Client → API Gateway
Pessoa B: PMC MCP → Ajudar no Gateway
Pessoa C: Browser Use MCP → Docker Compose
```

### Durante Sprint 2-4:
**Todos trabalham em paralelo**, cada um no seu serviço, mas focando no mesmo nível.

**Reunião de sincronização (recomendada diariamente):**
- "Meu serviço atingiu Nível X"
- Quando todos atingirem, avançamos juntos

---

## 📂 Estrutura de Documentação

### Por Serviço (planejamento individual):
- `mcp-client-niveis.md` - Checklist de níveis do MCP Client
- `pmc-mcp-niveis.md` - Checklist de níveis do PMC MCP
- `browser-mcp-niveis.md` - Checklist de níveis do Browser Use
- `gateway-niveis.md` - Checklist de níveis do Gateway

### Macro (acompanhamento geral):
- `tracking-niveis.md` - Dashboard de progresso de todos os serviços

### Templates:
- `template-niveis-servico.md` - Template para criar checklist de novos serviços

---

## 📏 Critérios de Nível

### Como saber se um serviço atingiu um nível?

Cada serviço tem um arquivo `X-niveis.md` com checklist específica.

**Exemplo genérico:**

#### Nível 1: Funcionalidade Básica
- [ ] Código implementado
- [ ] Roda localmente sem erros
- [ ] Endpoints/tools principais funcionando

#### Nível 2: Validado
- [ ] 3+ testes básicos (happy path)
- [ ] Integra com MCP Client
- [ ] README com instruções de uso

#### Nível 3: Robusto
- [ ] Tratamento de erros em todos os endpoints
- [ ] 10+ testes (incluindo edge cases)
- [ ] Logs estruturados

#### Nível 4: Produção
- [ ] Health check endpoint
- [ ] Métricas expostas
- [ ] Documentação completa (API + troubleshooting)
- [ ] Dockerfile otimizado

---

## 🔗 Links Úteis

- [Tracking de Níveis](./tracking-niveis.md) - Dashboard de progresso
- [Arquitetura do Sistema](../modelagem-ameaca/01-visao-inicial.md)
- [Modelagem de Ameaças](../modelagem-ameaca/README.md)

---

**Próximo documento:** [tracking-niveis.md](./tracking-niveis.md)
