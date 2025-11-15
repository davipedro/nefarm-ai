# 📋 Níveis de Aceitação - Browser Use MCP

**Serviço:** Browser Use MCP - Automação Web

**Responsável:** -

**Última atualização:** 2025-11-15

---

## 📊 Status Atual

**Nível Atual:** Nível 0 (0% completo)

**Progresso no Nível Atual:** 0%

**Bloqueado por:** MCP Client precisa estar em Nível 1

---

## ⚙️ Nível 0: Setup Inicial

**Meta:** Estrutura básica pronta para desenvolvimento

### Decisão de Implementação

**Escolher uma opção:**
- [ ] **Opção A:** Usar biblioteca `browser-use` (pronta)
- [ ] **Opção B:** Custom com Playwright
- [ ] **Decisão final:** _____________

### Checklist

- [ ] Diretório criado em `backend/services/browser_use_mcp/`
- [ ] `requirements.txt` criado com dependências:
  - [ ] `mcp` (Model Context Protocol SDK)
  - [ ] **Se Opção A:** `browser-use`
  - [ ] **Se Opção B:** `playwright`, `beautifulsoup4`
- [ ] `mcp_server.py` (arquivo principal) criado
- [ ] README.md básico criado
- [ ] `.gitignore` configurado

### Critério de Aceitação
✅ **Nível 0 completo quando:**
- Decisão de implementação tomada
- Estrutura de pastas existe
- `requirements.txt` criado
- README com descrição do serviço

**Status:** ⚪ 0%

---

## ⭐ Nível 1: Funcionalidade Básica

**Meta:** MCP funcional com ferramentas básicas de navegação

### Checklist

#### Implementação
- [ ] **MCP Server implementado** (`mcp_server.py`)
  - [ ] Servidor configurado com stdio transport
  - [ ] Handler para `ListToolsRequest`
  - [ ] Handler para `CallToolRequest`

- [ ] **Tool 1: `navigate_to_url`**
  - [ ] Navega para uma URL específica
  - [ ] Parâmetros:
    - `url` (string, obrigatório)
    - `wait_for` (string, opcional, seletor CSS para aguardar)
  - [ ] Retorna: confirmação de navegação + título da página

- [ ] **Tool 2: `extract_text`**
  - [ ] Extrai texto de elementos específicos
  - [ ] Parâmetros:
    - `url` (string, obrigatório)
    - `selector` (string, obrigatório, CSS selector)
  - [ ] Retorna: texto extraído

- [ ] **Tool 3: `screenshot`**
  - [ ] Tira screenshot de uma página
  - [ ] Parâmetros:
    - `url` (string, obrigatório)
    - `full_page` (bool, opcional, padrão: false)
  - [ ] Retorna: caminho do arquivo ou base64

- [ ] **Roda localmente sem erros**

#### Segurança Básica
- [ ] Timeout de 30s para navegação
- [ ] Limpeza de sessão após cada uso
- [ ] Cookies/storage limpos

#### Integração Básica
- [ ] Adicionado ao `.mcp.json` na raiz:
  ```json
  "browser-use-mcp": {
    "command": "python",
    "args": ["backend/services/browser_use_mcp/mcp_server.py"],
    "env": {}
  }
  ```
- [ ] MCP Client consegue conectar e listar tools

#### Documentação Mínima
- [ ] README atualizado com:
  - [ ] Como instalar (incluir Playwright: `playwright install chromium`)
  - [ ] Como executar
  - [ ] Exemplo de uso de cada tool

### Teste Manual
```bash
# 1. Instalar dependências
cd backend/services/browser_use_mcp
pip install -r requirements.txt
playwright install chromium  # se usar Playwright

# 2. Testar via MCP Client
cd ../../mcp_client
npm start

# 3. Listar tools
curl http://localhost:3000/tools
# Deve aparecer: navigate_to_url, extract_text, screenshot

# 4. Testar navegação
curl -X POST http://localhost:3000/execute \
  -H "Content-Type: application/json" \
  -d '{
    "server_name": "browser-use-mcp",
    "tool_name": "navigate_to_url",
    "arguments": {"url": "https://example.com"}
  }'

# 5. Testar extração
curl -X POST http://localhost:3000/execute \
  -H "Content-Type: application/json" \
  -d '{
    "server_name": "browser-use-mcp",
    "tool_name": "extract_text",
    "arguments": {
      "url": "https://example.com",
      "selector": "h1"
    }
  }'
```

### Critério de Aceitação
✅ **Nível 1 completo quando:**
- MCP Server funcional com 3 tools
- Navegação, extração e screenshot funcionam
- Integrado com MCP Client
- Limpeza de sessão após uso
- README com instruções de execução

**Status:** ⚪ 0%

---

## ⭐⭐ Nível 2: Validado

**Meta:** MCP testado e integração validada

### Checklist

#### Testes Básicos (Happy Path)
- [ ] **Teste 1:** `navigate_to_url` carrega página corretamente
- [ ] **Teste 2:** `extract_text` extrai texto do seletor
- [ ] **Teste 3:** `screenshot` gera imagem
- [ ] Pelo menos **3 testes** passando (pytest)

#### Integração Validada
- [ ] MCP Client lista as 3 tools via `/tools`
- [ ] Execução via `/execute` funciona para todas as tools
- [ ] Orquestração via `/query` funciona:
  - Query: "Navegar para example.com" → chama `navigate_to_url`
  - Query: "Extrair título de example.com" → chama `extract_text`

#### Documentação
- [ ] README com exemplos completos de todas as tools
- [ ] Instruções de teste
- [ ] Troubleshooting:
  - Chromium não instalado
  - Timeout de página
  - Seletor CSS não encontrado

### Executar Testes
```bash
cd backend/services/browser_use_mcp
pytest tests/
```

### Critério de Aceitação
✅ **Nível 2 completo quando:**
- Mínimo 3 testes básicos passando
- Integração com MCP Client validada
- Orquestração funcional
- README com exemplos completos

**Status:** ⚪ 0%

---

## ⭐⭐⭐ Nível 3: Robusto

**Meta:** MCP confiável com segurança e tratamento de erros

### Checklist

#### Tratamento de Erros
- [ ] Validação de URL (formato válido, protocolo http/https)
- [ ] Timeout configurável (padrão 30s)
- [ ] Tratamento de página não encontrada (404)
- [ ] Tratamento de seletor CSS inválido
- [ ] Mensagens de erro amigáveis
- [ ] Retry em caso de falha de rede (max 2 tentativas)

#### Segurança Avançada
- [ ] **Whitelist de domínios permitidos** (opcional, configurável)
- [ ] Blacklist de domínios perigosos (malware, phishing)
- [ ] Bloqueio de downloads automáticos
- [ ] Isolamento de sessões (cada requisição = novo contexto)
- [ ] User-Agent configurável

#### Testes Completos
- [ ] Testes de casos extremos:
  - [ ] URL inválida
  - [ ] URL sem protocolo
  - [ ] Timeout de página lenta
  - [ ] Seletor que não existe
  - [ ] Página com JavaScript pesado
- [ ] Pelo menos **10 testes** no total
- [ ] Cobertura de testes ≥ 60%

#### Logs Estruturados
- [ ] Logs estruturados (JSON)
- [ ] Níveis apropriados (DEBUG, INFO, WARNING, ERROR)
- [ ] Informações logadas:
  - [ ] URL acessada
  - [ ] Tool chamada
  - [ ] Tempo de carregamento
  - [ ] Sucesso/falha
  - [ ] Erros

#### Features Adicionais
- [ ] **Tool 4 (opcional):** `click_element`
  - Clica em um elemento da página
- [ ] **Tool 5 (opcional):** `fill_form`
  - Preenche formulário

### Critério de Aceitação
✅ **Nível 3 completo quando:**
- Validação robusta de URLs
- Whitelist/blacklist funcionando
- Tratamento completo de erros
- Mínimo 10 testes
- Logs estruturados
- Sistema seguro e confiável

**Status:** ⚪ 0%

---

## ⭐⭐⭐⭐ Nível 4: Produção Ready

**Meta:** MCP pronto para deploy em produção

### Checklist

#### Observabilidade
- [ ] Métricas logadas:
  - [ ] Páginas visitadas
  - [ ] Tempo médio de carregamento
  - [ ] Taxa de sucesso/falha
  - [ ] Screenshots gerados

#### Performance
- [ ] Reuso de instância do browser (não reiniciar a cada requisição)
- [ ] Pool de contexts (múltiplas sessões simultâneas)
- [ ] Limite de requisições simultâneas (max 5)
- [ ] Cleanup automático de screenshots antigos

#### Docker
- [ ] Dockerfile criado:
  ```dockerfile
  FROM mcr.microsoft.com/playwright/python:v1.40.0-jammy
  WORKDIR /app
  COPY requirements.txt .
  RUN pip install --no-cache-dir -r requirements.txt
  COPY . .
  CMD ["python", "mcp_server.py"]
  ```
- [ ] Imagem otimizada
- [ ] Chromium incluído na imagem

#### Documentação Completa
- [ ] Documentação de cada tool:
  - Parâmetros (tipo, obrigatório/opcional, padrão)
  - Retorno (estrutura, exemplos)
  - Erros possíveis
- [ ] Guia de troubleshooting completo
- [ ] Exemplos de casos de uso:
  - Extração de dados de site científico
  - Screenshot de gráfico interativo
- [ ] Limitações conhecidas
- [ ] Políticas de uso (respeitar robots.txt, rate limiting)

#### Segurança
- [ ] Sanitização de URLs
- [ ] Validação de seletores CSS (prevenir injection)
- [ ] Logs não contêm dados sensíveis
- [ ] Respeita robots.txt (opcional)
- [ ] Rate limiting por domínio

### Critério de Aceitação
✅ **Nível 4 completo quando:**
- Browser reusável (performance)
- Métricas completas
- Documentação de API completa
- Docker com Playwright otimizado
- Segurança robusta
- Pronto para produção

**Status:** ⚪ 0%

---

## 📝 Notas e Observações

### Decisões Técnicas
- **Browser:** Chromium via Playwright (headless)
- **Modo:** Headless (sem interface gráfica)
- **Cleanup:** Contextos descartados após cada uso

### Bloqueios e Dependências
- **Nível 1:** Bloqueado até MCP Client estar em Nível 1
- **Nível 2:** Depende de MCP Client estar funcional
- **Docker:** Imagem precisa incluir Chromium (~500MB)

### Melhorias Futuras (Pós-Nível 4)
- [ ] Suporte a múltiplos browsers (Firefox, WebKit)
- [ ] Proxy support para acesso a conteúdo geo-restrito
- [ ] Detecção automática de CAPTCHA
- [ ] Gravação de vídeo da navegação
- [ ] Integração com anti-bot detection

---

## 🔄 Histórico de Progresso

| Data | Evento | Responsável |
|------|--------|-------------|
| 2025-11-15 | Planejamento criado | - |
