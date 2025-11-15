# 📚 Documentação de Planejamento - NEFARM-AI

Bem-vindo à documentação de planejamento do projeto NEFARM-AI!

Esta pasta contém todo o planejamento de desenvolvimento usando **níveis de aceitação incrementais**, permitindo que a equipe trabalhe de forma modular, incremental e sincronizada.

---

## 📂 Estrutura de Documentos

### 📊 Documentos Macro (Visão Geral)

| Documento | Descrição | Quando Usar |
|-----------|-----------|-------------|
| **[00-roadmap.md](./00-roadmap.md)** | Roadmap geral do projeto, estratégia de níveis | Início do projeto, planejamento de sprints |
| **[tracking-niveis.md](./tracking-niveis.md)** | Dashboard de progresso de todos os serviços | Diariamente, em reuniões de sync |

### 📋 Documentos por Serviço (Checklists Detalhadas)

| Documento | Serviço | Quando Usar |
|-----------|---------|-------------|
| **[mcp-client-niveis.md](./mcp-client-niveis.md)** | MCP Client (Orquestrador) | Durante desenvolvimento do MCP Client |
| **[pmc-mcp-niveis.md](./pmc-mcp-niveis.md)** | PMC MCP (Busca de Artigos) | Durante desenvolvimento do PMC MCP |
| **[browser-mcp-niveis.md](./browser-mcp-niveis.md)** | Browser Use MCP (Automação Web) | Durante desenvolvimento do Browser Use |
| **[gateway-niveis.md](./gateway-niveis.md)** | API Gateway (Segurança) | Durante desenvolvimento do Gateway |

### 🔧 Templates

| Documento | Descrição | Quando Usar |
|-----------|-----------|-------------|
| **[template-niveis-servico.md](./template-niveis-servico.md)** | Template para criar checklist de novos serviços | Ao adicionar um novo serviço/MCP |

---

## 🎯 Como Usar Este Sistema

### 1️⃣ Entenda os Níveis

Cada serviço evolui através de **5 níveis de maturidade:**

| Nível | Nome | Descrição | Entrega |
|-------|------|-----------|---------|
| **0** | Setup Inicial | Estrutura básica, pastas, dependências | Pronto para codar |
| **1** | Funcionalidade Básica ⭐ | Código funcional, sem testes | Funciona localmente |
| **2** | Validado ⭐⭐ | Com testes básicos, integrado | Confiável para dev |
| **3** | Robusto ⭐⭐⭐ | Tratamento de erros, logs | Pronto para staging |
| **4** | Produção ⭐⭐⭐⭐ | Health checks, métricas, docs | Deploy em produção |

**Regra de ouro:** Todos os serviços devem estar no **mesmo nível** antes de avançar.

---

### 2️⃣ Workflow para Desenvolvedores

#### A. Escolha seu serviço
- MCP Client (bloqueante, fazer primeiro)
- PMC MCP (paralelo após MCP Client)
- Browser Use MCP (paralelo após MCP Client)
- API Gateway (paralelo após MCP Client)

#### B. Abra a checklist do serviço
Exemplo: trabalhando no PMC MCP → abrir `pmc-mcp-niveis.md`

#### C. Trabalhe nível por nível
1. **Complete o Nível 0** (setup)
   - Marque os checkboxes `[ ]` → `[x]`
   - Quando todos marcados, atualize `tracking-niveis.md`

2. **Passe para o Nível 1** (funcionalidade)
   - Implemente as features básicas
   - Marque os checkboxes conforme avança
   - Teste manualmente

3. **Comunique à equipe**
   - "PMC MCP atingiu Nível 1"
   - Atualize `tracking-niveis.md`

4. **Aguarde outros serviços**
   - Se você terminou Nível 1 mas outros ainda estão no Nível 0
   - **PARE e ajude** ou faça outra coisa
   - **NÃO avance** para Nível 2 sozinho

5. **Quando TODOS estiverem no Nível 1:**
   - Equipe decide: "Vamos para Nível 2!"
   - Todos trabalham no Nível 2 em paralelo

---

### 3️⃣ Workflow para Coordenador/Líder

#### Reunião Diária de Sync (Stand-up)

**Perguntas:**
1. Qual serviço você está trabalhando?
2. Qual nível você está?
3. Qual o progresso (%)? (ex: "Nível 1, 60% completo")
4. Há bloqueios?

**Atualizar `tracking-niveis.md`** com o status de cada um.

**Decisão:**
- Todos em Nível X? → "Podem avançar para Nível X+1"
- Alguém atrasado? → "Vamos ajudar o serviço Y a alcançar"

---

### 4️⃣ Como Atualizar os Documentos

#### Quando completar uma tarefa:
```markdown
# Antes
- [ ] Criar mcp_server.py

# Depois
- [x] Criar mcp_server.py
```

#### Quando completar um nível:
1. Atualize o documento do serviço:
   ```markdown
   **Nível Atual:** ⭐ Nível 1 (completo)
   **Progresso no Nível Atual:** 100%
   ```

2. Atualize `tracking-niveis.md`:
   - Mude o status na tabela do serviço
   - Atualize o gráfico de evolução
   - Adicione linha no histórico

3. Commite:
   ```bash
   git add docs/planejamento/*.md
   git commit -m "docs: [PMC MCP] atingiu Nível 1"
   git push
   ```

---

## 📈 Exemplo de Sprint

### Sprint 1: Todos para Nível 1

**Fase inicial:**
- Pessoa A: MCP Client Nível 0 → 1 (bloqueante para os demais)
- Pessoa B: Aguardando MCP Client
- Pessoa C: Aguardando MCP Client

**Após MCP Client em Nível 1:**
- Pessoa A: ✅ MCP Client completo, ajuda outros ou inicia Gateway
- Pessoa B: PMC MCP Nível 0 → 1
- Pessoa C: Browser Use MCP Nível 0 → 1

**Desenvolvimento paralelo:**
- Pessoa B: PMC MCP ✅ Nível 1 completo
- Pessoa C: Browser Use MCP em andamento (80%)
- Equipe ajuda a finalizar Browser Use

**Último serviço:**
- Pessoa C: Browser Use MCP ✅ Nível 1 completo
- Equipe: Inicia API Gateway Nível 0 → 1

**Conclusão do Sprint:**
- Gateway ✅ Nível 1 completo
- **TODOS os serviços em Nível 1!**
- Reunião: Decidir avançar para Sprint 2 (Nível 2)

---

## 🎓 Boas Práticas

### ✅ Faça

- **Atualize a documentação** conforme progride
- **Comunique** quando completar um nível
- **Ajude** quem está atrasado
- **Teste manualmente** antes de marcar como completo
- **Commit frequentemente** com mensagens claras

### ❌ Evite

- **Avançar sozinho** para o próximo nível
- **Deixar checkboxes desatualizados**
- **Pular testes** para "ir mais rápido"
- **Não comunicar** bloqueios
- **Trabalhar isolado** sem sync com a equipe

---

## 🔗 Links Úteis

### Documentação Técnica
- [README Principal](../../README.md)
- [Arquitetura do Sistema](../modelagem-ameaca/01-visao-inicial.md)
- [Modelagem de Ameaças STRIDE](../modelagem-ameaca/README.md)

### Recursos Externos
- [MCP SDK Documentation](https://modelcontextprotocol.io/introduction)
- [Europe PMC API](https://europepmc.org/RestfulWebService)
- [Playwright Docs](https://playwright.dev/python/)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Express.js Docs](https://expressjs.com/)

---

## 📞 Dúvidas?

### "Posso adicionar uma feature não planejada?"
- Se for pequena → adicione e atualize a checklist
- Se for grande → discuta com a equipe primeiro

### "Meu serviço está no Nível 1, mas outros no Nível 0. O que faço?"
- Opção 1: Ajude quem está atrasado
- Opção 2: Comece outro serviço que esteja atrasado
- Opção 3: Melhore a documentação do seu serviço
- **NÃO avance** para Nível 2 sozinho

### "Descobri que uma tarefa é desnecessária. Posso remover?"
- Sim! Marque como ~~riscado~~ e documente o porquê

### "Preciso adicionar um novo serviço. Como faço?"
1. Copie `template-niveis-servico.md`
2. Renomeie para `[nome-servico]-niveis.md`
3. Preencha todas as seções
4. Adicione ao `tracking-niveis.md`
5. Comunique à equipe

---

## 📝 Histórico de Atualizações

| Data | Mudança | Autor |
|------|---------|-------|
| 2025-11-15 | Criação da estrutura de planejamento | - |

---

**Pronto para começar?** Vá para → [00-roadmap.md](./00-roadmap.md)
