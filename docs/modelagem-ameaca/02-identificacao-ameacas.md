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
| **Frontend** | Requisições forjadas sem autenticação. | Injeção de scripts maliciosos para alterar conteúdo. | Usuário nega ter enviado uma requisição. | Exposição de chaves de API e credenciais no código cliente. | Sobrecarga de requisições sem rate limiting. | - |
| **MCP Solicitador** | Cliente malicioso se passa por frontend legítimo. | Manipulação de parâmetros e injeção de prompts maliciosos. | Falta de logs de requisições e ações. | Exposição da arquitetura interna e endpoints de MCPs. | Ataques DDoS na API principal. | - |
| **Comunicação (Frontend ↔ MCP)** | Requisições não autenticadas de qualquer cliente. | - | - | - | Interrupção da comunicação entre serviços. | - |
| **PMC MCP** | - | Modificação de resultados de busca antes de retornar. | - | - | - | - |
| **IA Local** | - | Envenenamento do modelo com dados maliciosos. | - | - | Sobrecarga do modelo com requisições intensas. | Acesso ao contêiner Docker para executar comandos |
| **Graph Extractor MCP** | - | - | - | - | Sobrecarga com requisições de processamento intensivo. | - |
| **Ambiente Docker** | - | Modificação não autorizada de imagens ou containers. | - | Exposição de variáveis de ambiente | Esgotamento de recursos do host. | - |

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
| **01** | Frontend → MCP | Denial of Service | Ataques de sobrecarga sem limitação de requisições - ausência de rate limiting permite flooding | Alta (15) | Alto (15) | **225** 🔴 |
| **02** | Frontend → MCP | Tampering | Injeção de prompts maliciosos - requisições não validadas chegam diretamente à IA, permitindo manipulação de comportamento | Alta (15) | Médio (10) | **150** 🟠 |
| **03** | Frontend → MCP | Information Disclosure | Exposição de APIs internas - arquitetura interna e endpoints dos MCPs visíveis ao frontend e potencialmente a atacantes | Alta (15) | Médio (10) | **150** 🟠 |
| **04** | Frontend | Information Disclosure | Exposição de chaves de API - credenciais de IA externa e serviços armazenadas no código cliente | Média (10) | Alto (15) | **150** 🟠 |
| **05** | PMC MCP | Denial of Service | Sobrecarga dos serviços MCP - requisições complexas sem limite de processamento podem esgotar recursos | Média (10) | Médio (10) | **100** 🟡 |
| **06** | Frontend | Spoofing | CSRF (Cross-Site Request Forgery) - sem proteção contra requisições forjadas de sites maliciosos | Média (10) | Médio (10) | **100** 🟡 |
| **07** | IA Local | Information Disclosure | "Jailbreaking" - técnicas de prompt injection para extrair informações do sistema prompt ou da base de conhecimento | Média (10) | Médio (10) | **100** 🟡 |
| **08** | MCP Solicitador | Information Disclosure | Exposição da lógica interna - detalhes de implementação e configuração visíveis através de mensagens de erro | Média (10) | Médio (10) | **100** 🟡 |
| **09** | IA Local | Elevation of Privilege | Escape de container - acesso ao contêiner Docker para executar comandos no sistema host | Baixa (5) | Alto (15) | **75** 🟡 |
| **10** | Frontend | Tampering | Injeção de scripts maliciosos para alterar conteúdo da página | Média (10) | Baixo (5) | **50** 🟢 |
| **11** | IA Local | Tampering | Envenenamento do modelo - modificação não autorizada dos modelos de IA ou da base de conhecimento | Baixa (5) | Médio (10) | **50** 🟢 |
| **12** | Comunicação | Denial of Service | Interrupção da comunicação - falhas de rede ou ataques específicos que quebram a comunicação entre serviços | Baixa (5) | Médio (10) | **50** 🟢 |
| **13** | Graph Extractor MCP | Tampering | Manipulação de dados extraídos - alteração maliciosa dos dados numéricos extraídos de gráficos | Baixa (5) | Médio (10) | **50** 🟢 |

---

## 2.4. Conclusões da Análise

### 2.4.1. Principais Vulnerabilidades Identificadas

1. **Falta de camada de segurança centralizada:** A comunicação direta entre Frontend e MCP Solicitador sem autenticação, autorização ou validação é o maior risco do sistema.

2. **Ausência de controles de segurança básicos:** Rate limiting e validação de entrada são inexistentes.

3. **Exposição de arquitetura interna:** O frontend tem conhecimento direto de todos os componentes internos.

### 2.4.2. Recomendações Imediatas

Para reduzir significativamente o risco do sistema, é **essencial** implementar:

1. **API Gateway** como camada de segurança centralizada
2. **Rate Limiting** para proteção contra DoS
3. **Validação e Sanitização** de todas as entradas

