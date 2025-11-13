# Setup Automatizado do Ollama com Docker Compose

## O que o docker-compose faz automaticamente:

✅ Baixa a imagem `ollama/ollama`
✅ Cria e inicia o container Ollama
✅ Mapeia a porta 11434
✅ Cria volume persistente para os modelos
✅ Aguarda o Ollama estar pronto (healthcheck)
✅ Baixa o modelo `tinyllama` automaticamente
✅ Testa o modelo
✅ Deixa tudo pronto para uso

## Como usar

### 1. Iniciar todos os serviços

```bash

# Iniciar (vai baixar imagem, subir container e baixar modelo)
docker-compose up -d

# Ver logs do download do modelo
docker-compose logs -f ollama-model-loader
```

### 2. Verificar se está funcionando

```bash
# Verificar containers rodando
docker-compose ps

# Deve mostrar:
# NAME     STATUS
# ollama   Up (healthy)

# Testar API
curl http://localhost:11434/api/tags
```

### 3. Testar o modelo

```bash
# Fazer uma requisição de teste
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "tinyllama",
    "prompt": "Explain what is a neural network in one sentence.",
    "stream": false
  }'
```

### 4. Parar os serviços

```bash
# Parar containers
docker-compose down

# Parar E remover volumes (apaga modelos baixados)
docker-compose down -v
```

### Reiniciar serviços

```bash
# Reiniciar tudo
docker-compose restart

# Reiniciar só o Ollama
docker-compose restart ollama
```

### Baixar outros modelos

```bash
# Entrar no container
docker exec -it ollama bash

# Dentro do container, baixar modelo
ollama pull llama2

# Listar modelos disponíveis
ollama list

# Sair
exit
```

### Remover modelo

```bash
docker exec -it ollama ollama rm tinyllama
```