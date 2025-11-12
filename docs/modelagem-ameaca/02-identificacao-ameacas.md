# 2. Identificação e Análise de Ameaças — Sistema NEFARM-AI

## 2.1. Metodologia de Análise

Para a identificação e categorização de ameaças, este projeto adota o modelo **STRIDE**, uma metodologia desenvolvida pela Microsoft que foca em seis categorias de ameaças à segurança.

### 2.1.1. Categorias STRIDE

- **S**poofing (Falsificação de Identidade): Fingir ser algo ou alguém que não é.
- **T**ampering (Violação de Dados): Modificar dados sem autorização.
- **R**epudiation (Negação de Ações): Negar ter realizado uma ação.
- **I**nformation Disclosure (Exposição de Informações): Expor informações a quem não tem permissão.
- **D**enial of Service (Negação de Serviço): Derrubar ou degradar um serviço para usuários legítimos.
- **E**levation of Privilege (Elevação de Privilégio): Obter capacidades ou acesso sem a devida autorização.

---

## 2.2. Matriz de Análise de Ameaças STRIDE

A tabela a seguir detalha as ameaças identificadas em cada componente do sistema, classificadas pelo modelo STRIDE.

### Tabela 1: Matriz de Análise STRIDE por Componente

| Componente | Spoofing | Tampering | Repudiation | Information Disclosure | Denial of Service | Elevation of Privilege |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Frontend** | Requisições forjadas sem autenticação (CSRF). | Injeção de scripts maliciosos (XSS) para alterar conteúdo. | Usuário nega ter enviado uma requisição. | Exposição de chaves de API e credenciais no código cliente. | Sobrecarga de requisições sem rate limiting. | - |
| **MCP Solicitador** | Cliente malicioso se passa por frontend legítimo. | Manipulação de parâmetros e injeção de prompts maliciosos. | Falta de logs de requisições e ações. | Exposição da arquitetura interna e endpoints de MCPs. | Ataques DDoS na API principal. | Acesso não autorizado a funcionalidades administrativas. |
| **Comunicação (Frontend ↔ MCP)** | Requisições não autenticadas de qualquer cliente. | Interceptação e alteração Man-in-the-Middle (sem HTTPS). | - | Vazamento de dados sensíveis em tráfego não criptografado. | Interrupção da comunicação entre serviços. | - |
| **PMC MCP** | - | Modificação de resultados de busca antes de retornar. | - | Exposição de dados de artigos científicos não públicos. | Sobrecarga com requisições complexas ao repositório externo. | - |
| **IA Local** | - | Envenenamento do modelo com dados maliciosos. | - | "Jailbreaking" para extrair informações do prompt ou base de conhecimento. | Sobrecarga do modelo com requisições computacionalmente intensas. | Acesso ao contêiner Docker para executar comandos no host. |
| **Browser Use MCP** | - | Automação manipulada para acessar sites não autorizados. | - | Exposição de cookies e sessões de navegação. | Sobrecarga de requisições de automação. | Execução de scripts maliciosos via automação. |
| **Ambiente Docker** | - | Modificação não autorizada de imagens ou containers. | - | Exposição de variáveis de ambiente e segredos. | Esgotamento de recursos do host. | Escape de container para acesso ao sistema host. |

---

## 2.3. Matriz Detalhada de Risco (Pré-Mitigação)

A tabela a seguir apresenta uma análise detalhada de cada ameaça identificada, incluindo probabilidade, impacto e pontuação de risco **antes** da implementação de medidas de mitigação.

### 2.3.1. Escala de Avaliação

| Nível | Probabilidade | Impacto | Valor |
|-------|---------------|---------|-------|
| **Baixo** | Raro ou improvável | Consequências mínimas | 5 |
| **Médio** | Possível em certas condições | Consequências moderadas | 10 |
| **Alto** | Provável ou frequente | Consequências graves | 15 |

**Cálculo de Risco:** Risco = Probabilidade × Impacto

### 2.3.2. Classificação de Severidade

| Pontuação de Risco | Severidade | Ação Recomendada |
|-------------------|------------|------------------|
| **≥ 150** | 🔴 Crítica | Mitigação imediata obrigatória |
| **100-149** | 🟠 Alta | Mitigação prioritária |
| **50-99** | 🟡 Média | Mitigação planejada |
| **< 50** | 🟢 Baixa | Monitoramento |

### Tabela 2: Matriz de Risco Detalhada (Pré-Mitigação)

| ID | Componente | Categoria STRIDE | Descrição da Ameaça | Probabilidade PRÉ | Impacto PRÉ | Risco PRÉ |
| :-- | :--- | :--- | :--- | :--- | :--- | :--- |
| **01** | Frontend → MCP | Spoofing | Requisições não autenticadas - qualquer cliente pode enviar requisições ao MCP Solicitador sem validação de identidade | Alta (15) | Alto (15) | **225** 🔴 |
| **02** | Frontend → MCP | Denial of Service | Ataques de sobrecarga sem limitação de requisições - ausência de rate limiting permite flooding | Alta (15) | Alto (15) | **225** 🔴 |
| **03** | Frontend → MCP | Tampering | Injeção de prompts maliciosos - requisições não validadas chegam diretamente à IA, permitindo manipulação de comportamento | Alta (15) | Médio (10) | **150** 🟠 |
| **04** | Frontend → MCP | Information Disclosure | Exposição de APIs internas - arquitetura interna e endpoints dos MCPs visíveis ao frontend e potencialmente a atacantes | Alta (15) | Médio (10) | **150** 🟠 |
| **05** | MCP Solicitador | Repudiation | Falta de rastreabilidade - impossível auditar ações de usuários, requisições e decisões do sistema | Alta (15) | Médio (10) | **150** 🟠 |
| **06** | Frontend → MCP | Elevation of Privilege | Acesso não autorizado - sem controle de permissões por funcionalidade, todos os usuários têm acesso total | Média (10) | Alto (15) | **150** 🟠 |
| **07** | Comunicação | Tampering | Interceptação Man-in-the-Middle - comunicação HTTP sem criptografia permite interceptação e modificação de tráfego | Média (10) | Alto (15) | **150** 🟠 |
| **08** | Frontend | Information Disclosure | Exposição de chaves de API - credenciais de IA externa e serviços armazenadas no código cliente | Média (10) | Alto (15) | **150** 🟠 |
| **09** | PMC MCP | Denial of Service | Sobrecarga dos serviços MCP - requisições complexas sem limite de processamento podem esgotar recursos | Média (10) | Médio (10) | **100** 🟡 |
| **10** | Frontend | Spoofing | CSRF (Cross-Site Request Forgery) - sem proteção contra requisições forjadas de sites maliciosos | Média (10) | Médio (10) | **100** 🟡 |
| **11** | IA Local | Information Disclosure | "Jailbreaking" - técnicas de prompt injection para extrair informações do sistema prompt ou da base de conhecimento | Média (10) | Médio (10) | **100** 🟡 |
| **12** | Comunicação | Information Disclosure | Vazamento de dados sensíveis - comunicação em texto plano expõe dados de usuários e conteúdo de requisições | Média (10) | Médio (10) | **100** 🟡 |
| **13** | MCP Solicitador | Information Disclosure | Exposição da lógica interna - detalhes de implementação e configuração visíveis através de mensagens de erro | Média (10) | Médio (10) | **100** 🟡 |
| **14** | IA Local | Elevation of Privilege | Escape de container - acesso ao contêiner Docker para executar comandos no sistema host | Baixa (5) | Alto (15) | **75** 🟡 |
| **15** | MCP Solicitador | Elevation of Privilege | Falhas de autorização - obter acesso a funcionalidades administrativas através de falhas na API | Baixa (5) | Alto (15) | **75** 🟡 |
| **16** | Frontend | Tampering | Cross-Site Scripting (XSS) - injeção de scripts maliciosos para alterar conteúdo da página | Média (10) | Baixo (5) | **50** 🟢 |
| **17** | IA Local | Tampering | Envenenamento do modelo - modificação não autorizada dos modelos de IA ou da base de conhecimento | Baixa (5) | Médio (10) | **50** 🟢 |
| **18** | Comunicação | Denial of Service | Interrupção da comunicação - falhas de rede ou ataques específicos que quebram a comunicação entre serviços | Baixa (5) | Médio (10) | **50** 🟢 |
| **19** | Browser Use MCP | Information Disclosure | Exposição de sessões - cookies e tokens de sessão da automação web expostos em logs ou memória | Baixa (5) | Médio (10) | **50** 🟢 |
| **20** | Ambiente Docker | Elevation of Privilege | Permissões excessivas - containers executados como root com acesso privilegiado ao host | Baixa (5) | Médio (10) | **50** 🟢 |

---

## 2.4. Distribuição de Ameaças por Categoria

### Tabela 3: Contagem por Categoria STRIDE

| Categoria STRIDE | Quantidade | % do Total |
|-----------------|------------|------------|
| **Information Disclosure** | 6 | 30% |
| **Denial of Service** | 4 | 20% |
| **Spoofing** | 3 | 15% |
| **Tampering** | 3 | 15% |
| **Elevation of Privilege** | 3 | 15% |
| **Repudiation** | 1 | 5% |
| **Total** | **20** | **100%** |

---

## 2.5. Sumário dos Riscos Críticos

Com base na análise, os riscos mais críticos (≥ 150) são:

### 2.5.1. Riscos Críticos (Pontuação 225) 🔴

1. **Spoofing - Requisições não autenticadas (ID 01)**
   - **Componente:** Frontend → MCP Solicitador
   - **Problema:** Ausência total de autenticação permite que qualquer cliente envie requisições
   - **Consequência:** Acesso não autorizado ao sistema completo

2. **Denial of Service - Ataques de sobrecarga (ID 02)**
   - **Componente:** Frontend → MCP Solicitador
   - **Problema:** Sem rate limiting, o sistema é vulnerável a ataques de flooding
   - **Consequência:** Indisponibilidade total do serviço

### 2.5.2. Riscos Altos (Pontuação 150) 🟠

3. **Tampering - Injeção de prompts maliciosos (ID 03)**
   - **Problema:** Falta de validação e sanitização de entradas
   - **Consequência:** Manipulação do comportamento da IA

4. **Information Disclosure - Exposição de APIs internas (ID 04)**
   - **Problema:** Arquitetura interna exposta ao frontend
   - **Consequência:** Facilita ataques direcionados aos componentes internos

5. **Repudiation - Falta de rastreabilidade (ID 05)**
   - **Problema:** Ausência de logging adequado
   - **Consequência:** Impossibilidade de auditoria e investigação de incidentes

6. **Elevation of Privilege - Acesso não autorizado (ID 06)**
   - **Problema:** Sem controle de permissões baseado em roles
   - **Consequência:** Todos os usuários têm acesso total a todas as funcionalidades

7. **Tampering - Man-in-the-Middle (ID 07)**
   - **Problema:** Comunicação HTTP não criptografada
   - **Consequência:** Interceptação e modificação de dados em trânsito

8. **Information Disclosure - Exposição de chaves de API (ID 08)**
   - **Problema:** Credenciais armazenadas no código cliente
   - **Consequência:** Comprometimento de contas e serviços externos

---

## 2.6. Análise de Impacto por Componente

### Tabela 4: Risco Agregado por Componente

| Componente | Nº de Ameaças | Risco Total | Risco Médio | Prioridade |
|------------|---------------|-------------|-------------|------------|
| **Frontend → MCP** | 6 | 1050 | 175 | 🔴 Crítica |
| **MCP Solicitador** | 3 | 375 | 125 | 🟠 Alta |
| **Comunicação** | 4 | 350 | 87.5 | 🟡 Média |
| **IA Local** | 3 | 225 | 75 | 🟡 Média |
| **Frontend** | 2 | 150 | 75 | 🟡 Média |
| **PMC MCP** | 1 | 100 | 100 | 🟡 Média |
| **Browser Use MCP** | 1 | 50 | 50 | 🟢 Baixa |
| **Ambiente Docker** | 1 | 50 | 50 | 🟢 Baixa |

**Conclusão:** O componente mais crítico é a **comunicação Frontend → MCP Solicitador**, que concentra 42% do risco total do sistema.

---

## 2.7. Conclusões da Análise

### 2.7.1. Principais Vulnerabilidades Identificadas

1. **Falta de camada de segurança centralizada:** A comunicação direta entre Frontend e MCP Solicitador sem autenticação, autorização ou validação é o maior risco do sistema.

2. **Ausência de controles de segurança básicos:** Rate limiting, validação de entrada, criptografia de tráfego e logging são inexistentes.

3. **Exposição de arquitetura interna:** O frontend tem conhecimento direto de todos os componentes internos, violando o princípio de least privilege.

### 2.7.2. Recomendações Imediatas

Para reduzir significativamente o risco do sistema, é **essencial** implementar:

1. **API Gateway** como camada de segurança centralizada
2. **Autenticação e Autorização** baseada em tokens JWT com RBAC
3. **Criptografia TLS** para toda comunicação
4. **Rate Limiting** para proteção contra DoS
5. **Validação e Sanitização** de todas as entradas
6. **Logging Centralizado** para auditoria e rastreabilidade

---

**Documento:** Identificação de Ameaças (STRIDE)
**Documento Anterior:** [01-visao-inicial.md](./01-visao-inicial.md) — Visão Inicial da Arquitetura
**Próximo Documento:** [03-analise-mitigacao.md](./03-analise-mitigacao.md) — Análise de Mitigação
