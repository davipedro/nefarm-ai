# 📊 Tracking de Níveis - Dashboard de Progresso

**Última atualização:** 2025-11-15

**Nível Global Atual:** 🎯 **Nível 0** (Setup Inicial)

---

## 🎯 Meta Atual: Atingir Nível 1 em TODOS os serviços

---

## 📋 Status Detalhado por Serviço

### 🤖 IA Local MCP (Classificação de Gráficos)
**Nível Atual:** ⭐ **Nível 1** (Funcional Básico)

| Nível | Status | Progresso |
|-------|--------|-----------|
| 0: Setup | ✅ Completo | 100% |
| 1: Funcional | ✅ Completo | 100% |
| 2: Validado | ⚪ Pendente | 0% |
| 3: Robusto | ⚪ Pendente | 0% |
| 4: Produção | ⚪ Pendente | 0% |

**Observações:** Serviço já funcional, aguardando outros alcançarem Nível 1.

---

### 🔧 MCP Client (Orquestrador)
**Nível Atual:** **Nível 0** (Setup Parcial)

| Nível | Status | Progresso |
|-------|--------|-----------|
| 0: Setup | 🟡 Em andamento | 70% |
| 1: Funcional | ⚪ Pendente | 0% |
| 2: Validado | ⚪ Pendente | 0% |
| 3: Robusto | ⚪ Pendente | 0% |
| 4: Produção | ⚪ Pendente | 0% |

**Pendências para Nível 0:**
- [ ] Criar `.mcp.json` na raiz
- [ ] Criar `.env.example`

**Responsável:** -

**Documento:** [mcp-client-niveis.md](./mcp-client-niveis.md)

---

### 📚 PMC MCP (Busca e Extração de Artigos)
**Nível Atual:** **Nível 0** (Não Iniciado)

| Nível | Status | Progresso |
|-------|--------|-----------|
| 0: Setup | ⚪ Pendente | 0% |
| 1: Funcional | ⚪ Pendente | 0% |
| 2: Validado | ⚪ Pendente | 0% |
| 3: Robusto | ⚪ Pendente | 0% |
| 4: Produção | ⚪ Pendente | 0% |

**Bloqueado por:** MCP Client precisa estar em Nível 1

**Responsável:** -

**Documento:** [pmc-mcp-niveis.md](./pmc-mcp-niveis.md)

---

### 🌐 Browser Use MCP (Automação Web)
**Nível Atual:** **Nível 0** (Não Iniciado)

| Nível | Status | Progresso |
|-------|--------|-----------|
| 0: Setup | ⚪ Pendente | 0% |
| 1: Funcional | ⚪ Pendente | 0% |
| 2: Validado | ⚪ Pendente | 0% |
| 3: Robusto | ⚪ Pendente | 0% |
| 4: Produção | ⚪ Pendente | 0% |

**Bloqueado por:** MCP Client precisa estar em Nível 1

**Responsável:** -

**Documento:** [browser-mcp-niveis.md](./browser-mcp-niveis.md)

---

### 🛡️ API Gateway (Camada de Segurança)
**Nível Atual:** **Nível 0** (Não Iniciado)

| Nível | Status | Progresso |
|-------|--------|-----------|
| 0: Setup | ⚪ Pendente | 0% |
| 1: Funcional | ⚪ Pendente | 0% |
| 2: Validado | ⚪ Pendente | 0% |
| 3: Robusto | ⚪ Pendente | 0% |
| 4: Produção | ⚪ Pendente | 0% |

**Bloqueado por:** MCP Client precisa estar em Nível 1

**Responsável:** -

**Documento:** [gateway-niveis.md](./gateway-niveis.md)

---

### 🎨 Frontend
**Nível Atual:** **Nível 0** (Aguardando Backend)

**Status:** Aguardando backend atingir pelo menos Nível 3

---

## 📈 Gráfico de Evolução

```
Nível 4: [                    ]  0/5 serviços
Nível 3: [                    ]  0/5 serviços
Nível 2: [                    ]  0/5 serviços
Nível 1: [████                ]  1/5 serviços (IA Local)
Nível 0: [████████████████    ]  4/5 serviços
```

---

## 🎯 Próximos Marcos

### ✅ Marco 1: Todos em Nível 1 (Sprint 1)

**Significa:**
- Sistema funcionando ponta a ponta (básico)
- Todos os MCPs integrados
- Gateway roteando requisições

**Quando atingir:**
- Começar Sprint 2 (adicionar testes)

---

### 🎯 Marco 2: Todos em Nível 2 (Sprint 2)

**Significa:**
- Testes básicos em todos os serviços
- Integração validada
- Docker Compose funcional

**Quando atingir:**
- Sistema confiável para desenvolvimento
- Começar Sprint 3 (robustez)

---

### 🎯 Marco 3: Todos em Nível 3 (Sprint 3)

**Significa:**
- Sistema robusto
- Tratamento de erros completo
- Logs estruturados

**Quando atingir:**
- Pode iniciar desenvolvimento do Frontend
- Começar Sprint 4 (produção)

---

### 🎯 Marco 4: Todos em Nível 4 (Sprint 4)

**Significa:**
- Sistema production-ready
- Monitoramento ativo
- Documentação completa

**Quando atingir:**
- Backend completo
- Foco total no Frontend

---

## 🔄 Como Atualizar este Documento

### Quando um serviço sobe de nível:

1. Atualizar a tabela do serviço
2. Atualizar o "Gráfico de Evolução"
3. Se todos estiverem no mesmo nível, atualizar "Nível Global Atual"
4. Commitar com mensagem: `docs: [ServiçoX] atingiu Nível Y`

### Exemplo de commit:
```bash
git add docs/planejamento/tracking-niveis.md
git commit -m "docs: [MCP Client] atingiu Nível 1"
```

---

## 📝 Log de Mudanças

| Data | Evento | Autor |
|------|--------|-------|
| 2025-11-15 | Criação do tracking | - |
| | IA Local MCP em Nível 1 | - |

---

**Voltar:** [00-roadmap.md](./00-roadmap.md)
