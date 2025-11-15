# 📋 Níveis de Aceitação - API Gateway

**Serviço:** API Gateway - Camada de Segurança e Roteamento

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

### Decisão de Tecnologia

**Escolher uma opção:**
- [ ] **Opção A:** Kong (robusto, mas complexo)
- [ ] **Opção B:** Traefik (leve, bom com Docker)
- [ ] **Opção C:** Custom com FastAPI (controle total)
- [ ] **Opção D:** Custom com Express.js (mantém stack Node)
- [ ] **Decisão final:** _____________

### Checklist

- [ ] Diretório criado em `backend/services/gateway/`
- [ ] Arquivo de dependências criado:
  - **Se FastAPI:** `requirements.txt`
  - **Se Express:** `package.json`
  - **Se Kong/Traefik:** `kong.yml` ou `traefik.yml`
- [ ] Arquivo principal criado
- [ ] README.md básico criado
- [ ] `.env.example` com variáveis de configuração

### Critério de Aceitação
✅ **Nível 0 completo quando:**
- Decisão de tecnologia tomada
- Estrutura de pastas existe
- Arquivo de dependências criado
- README com descrição do serviço

**Status:** ⚪ 0%

---

## ⭐ Nível 1: Funcionalidade Básica

**Meta:** Gateway funcional com roteamento básico (SEM autenticação ainda)

### Checklist

#### Implementação
- [ ] **Servidor HTTP rodando**
  - [ ] Porta configurável (padrão: 8080)
  - [ ] CORS configurado (permitir frontend)

- [ ] **Roteamento básico para MCP Client:**
  - [ ] `GET /api/v1/health` → MCP Client `/health`
  - [ ] `GET /api/v1/tools` → MCP Client `/tools`
  - [ ] `POST /api/v1/query` → MCP Client `/query`
  - [ ] `POST /api/v1/execute` → MCP Client `/execute`

- [ ] **Proxy reverso funcionando:**
  - [ ] Requisições chegam ao MCP Client corretamente
  - [ ] Respostas retornam ao cliente

- [ ] **Roda localmente sem erros**

#### Configuração
- [ ] Variáveis de ambiente:
  - `PORT` (porta do gateway)
  - `MCP_CLIENT_URL` (URL do MCP Client, ex: http://localhost:3000)
- [ ] `.env.example` documentado

#### Documentação Mínima
- [ ] README atualizado com:
  - [ ] Como instalar
  - [ ] Como executar
  - [ ] Exemplo de requisições para cada rota

### Teste Manual
```bash
# 1. Instalar dependências
cd backend/services/gateway
npm install  # ou pip install -r requirements.txt

# 2. Configurar
echo "MCP_CLIENT_URL=http://localhost:3000" > .env
echo "PORT=8080" >> .env

# 3. Executar
npm start  # ou python main.py

# 4. Testar roteamento
curl http://localhost:8080/api/v1/health

curl http://localhost:8080/api/v1/tools

curl -X POST http://localhost:8080/api/v1/query \
  -H "Content-Type: application/json" \
  -d '{"query": "buscar artigos sobre COVID"}'
```

### Critério de Aceitação
✅ **Nível 1 completo quando:**
- Gateway escutando na porta 8080
- Todas as 4 rotas funcionando
- Proxy reverso para MCP Client funcional
- README com instruções de execução

**Status:** ⚪ 0%

---

## ⭐⭐ Nível 2: Validado

**Meta:** Gateway com autenticação JWT básica e testes

### Checklist

#### Autenticação JWT
- [ ] **Endpoint de autenticação:**
  - [ ] `POST /auth/register` - registra usuário (nome, email, senha)
  - [ ] `POST /auth/login` - retorna access token + refresh token
  - [ ] JWT com expiração: 15 min (access) + 7 dias (refresh)

- [ ] **Middleware de autenticação:**
  - [ ] Valida token JWT em rotas protegidas
  - [ ] Extrai user_id do token
  - [ ] Retorna 401 se token inválido/expirado

- [ ] **Rotas protegidas:**
  - [ ] `/api/v1/*` requer autenticação (exceto `/health`)

#### Banco de Dados Simples
- [ ] SQLite ou arquivo JSON para armazenar usuários
- [ ] Hash de senhas (bcrypt)
- [ ] Modelo: `{ id, name, email, password_hash, created_at }`

#### Testes Básicos
- [ ] **Teste 1:** Registro de usuário
- [ ] **Teste 2:** Login com credenciais válidas
- [ ] **Teste 3:** Acesso a rota protegida com token válido
- [ ] **Teste 4:** Acesso negado sem token (401)
- [ ] Pelo menos **4 testes** passando

#### Documentação
- [ ] README com:
  - [ ] Como registrar usuário
  - [ ] Como fazer login
  - [ ] Como usar token nas requisições
  - [ ] Exemplos com curl

### Teste Manual
```bash
# 1. Registrar usuário
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com", "password": "senha123"}'

# 2. Login
TOKEN=$(curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "senha123"}' \
  | jq -r '.access_token')

# 3. Acessar rota protegida
curl -X POST http://localhost:8080/api/v1/query \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "buscar artigos"}'
```

### Critério de Aceitação
✅ **Nível 2 completo quando:**
- Autenticação JWT implementada
- Rotas protegidas requerem token
- Mínimo 4 testes passando
- README com exemplos de autenticação

**Status:** ⚪ 0%

---

## ⭐⭐⭐ Nível 3: Robusto

**Meta:** Gateway com segurança completa conforme modelagem STRIDE

### Checklist

#### Rate Limiting
- [ ] Implementado (ex: express-rate-limit, slowapi)
- [ ] Limite por IP:
  - [ ] 100 req/min para usuários autenticados
  - [ ] 20 req/min para não autenticados
- [ ] Retorna 429 (Too Many Requests) ao exceder

#### Validação de Input
- [ ] JSON Schema validation em todas as rotas
- [ ] Sanitização de strings (prevenir injection)
- [ ] Limite de tamanho de payload (max 10MB)
- [ ] Validação de tipos

#### Tratamento de Erros
- [ ] Middleware de erro global
- [ ] Mensagens de erro padronizadas
- [ ] Não expõe stack traces ou detalhes internos
- [ ] Logs de erros estruturados

#### Headers de Segurança
- [ ] CORS estrito (allowlist de origins)
- [ ] CSP (Content Security Policy)
- [ ] X-Content-Type-Options: nosniff
- [ ] X-Frame-Options: DENY
- [ ] Strict-Transport-Security (HSTS)

#### Logs Estruturados
- [ ] Biblioteca de logs (Winston, structlog, etc.)
- [ ] Formato JSON
- [ ] Informações logadas:
  - [ ] Timestamp
  - [ ] User ID (se autenticado)
  - [ ] IP de origem
  - [ ] Endpoint acessado
  - [ ] Método HTTP
  - [ ] Status code
  - [ ] Tempo de resposta
  - [ ] Payload hash (não o payload completo)

#### Testes Completos
- [ ] Testes de rate limiting
- [ ] Testes de validação de input
- [ ] Testes de headers de segurança
- [ ] Testes de erro (token expirado, inválido, etc.)
- [ ] Pelo menos **15 testes** no total
- [ ] Cobertura de testes ≥ 60%

### Critério de Aceitação
✅ **Nível 3 completo quando:**
- Rate limiting funcional
- Validação robusta de input
- Headers de segurança configurados
- Logs estruturados completos
- Mínimo 15 testes passando
- Sistema seguro conforme STRIDE

**Status:** ⚪ 0%

---

## ⭐⭐⭐⭐ Nível 4: Produção Ready

**Meta:** Gateway pronto para produção com HTTPS e observabilidade completa

### Checklist

#### HTTPS/TLS
- [ ] Suporte a HTTPS (certificado SSL)
- [ ] TLS 1.3 configurado
- [ ] Redirect HTTP → HTTPS
- [ ] HSTS habilitado

#### Autorização RBAC
- [ ] Roles implementados: `viewer`, `user`, `admin`
- [ ] Middleware de autorização por endpoint:
  - [ ] `/api/v1/query` - requer role `user` ou `admin`
  - [ ] `/api/v1/tools` - requer role `viewer` ou superior
  - [ ] (Futuros endpoints admin) - requer role `admin`
- [ ] Tabela de permissões configurável

#### Observabilidade Avançada
- [ ] Endpoint `/health` detalhado:
  - Status do gateway
  - Status do MCP Client (upstream)
  - Latência do upstream
- [ ] Métricas expostas em `/metrics`:
  - [ ] Contador de requisições por endpoint
  - [ ] Contador de erros (por tipo)
  - [ ] Latência por endpoint (p50, p95, p99)
  - [ ] Taxa de autenticação (sucesso/falha)
  - [ ] Rate limit hits
- [ ] (Opcional) Formato Prometheus

#### Performance
- [ ] Connection pooling para MCP Client
- [ ] Timeout configurável (padrão 30s)
- [ ] Retry logic com exponential backoff
- [ ] Circuit breaker para MCP Client
- [ ] Graceful shutdown

#### Docker
- [ ] Dockerfile otimizado
- [ ] Multi-stage build
- [ ] Imagem < 200MB
- [ ] Usuário não-root
- [ ] Health check configurado

#### Documentação Completa
- [ ] OpenAPI/Swagger spec gerado
- [ ] Documentação de todos os endpoints:
  - Parâmetros, headers, body
  - Respostas (200, 401, 429, 500)
  - Exemplos
- [ ] Guia de troubleshooting:
  - Token inválido
  - Rate limit excedido
  - MCP Client offline
- [ ] Guia de deploy
- [ ] Variáveis de ambiente documentadas

#### Segurança Avançada
- [ ] Proteção contra CSRF (tokens CSRF em state-changing requests)
- [ ] Detecção de prompt injection (filtros básicos)
- [ ] Logs de auditoria (quem fez o quê, quando)
- [ ] Retenção de logs: 90 dias
- [ ] Rotação de secrets (JWT_SECRET)

### Critério de Aceitação
✅ **Nível 4 completo quando:**
- HTTPS configurado
- RBAC implementado
- Health checks e métricas completas
- Documentação OpenAPI gerada
- Docker otimizado
- Todas as mitigações STRIDE implementadas
- Pronto para produção

**Status:** ⚪ 0%

---

## 📝 Notas e Observações

### Decisões Técnicas
- **Tecnologia:** (A definir)
- **Autenticação:** JWT (access + refresh tokens)
- **Banco de dados:** SQLite (Nível 2), migrar para PostgreSQL (Nível 4)?
- **Rate limiting:** Em memória (Nível 3), Redis (Nível 4)?

### Bloqueios e Dependências
- **Nível 1:** Bloqueado até MCP Client estar em Nível 1
- **Nível 2-4:** Pode desenvolver em paralelo com outros serviços
- **HTTPS:** Requer certificado (Let's Encrypt ou self-signed para dev)

### Melhorias Futuras (Pós-Nível 4)
- [ ] OAuth2/OpenID Connect (integração com Google, GitHub)
- [ ] 2FA (Two-Factor Authentication) para admins
- [ ] API versioning (v2, v3)
- [ ] Cache de respostas (Redis)
- [ ] WAF (Web Application Firewall) básico
- [ ] Integração com SIEM para auditoria

---

## 🔄 Histórico de Progresso

| Data | Evento | Responsável |
|------|--------|-------------|
| 2025-11-15 | Planejamento criado | - |
