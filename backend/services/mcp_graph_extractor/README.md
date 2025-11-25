# Graph Extractor MCP Server

## Descrição

Servidor MCP que extrai dados de pontos (coordenadas X,Y) de imagens de gráficos usando a API do Google Gemini. Processa imagens localmente e retorna os dados em formato CSV.

## Funcionalidade

### Tool: `extract_graph_data`

Extrai automaticamente coordenadas X,Y de gráficos em imagens usando visão computacional do Gemini AI.

**Processo:**
1. Recebe caminho para imagem de gráfico
2. Valida formato do arquivo
3. Lê imagem como bytes (método inline)
4. Envia para Gemini API com prompt otimizado
5. Processa resposta JSON do modelo
6. Retorna dados em formato CSV com metadados

**Parâmetros:**
- `image_path` (string, required): Caminho absoluto para o arquivo de imagem

**Formatos suportados:** PNG, JPG, JPEG, GIF, BMP, WebP, HEIC, HEIF

**Exemplo de uso:**

```json
{
  "tool_name": "extract_graph_data",
  "arguments": {
    "image_path": "C:/Users/User/Downloads/grafico.png"
  }
}
```

**Exemplo de resposta (CSV):**

```csv
# X-axis: Time (seconds)
# Y-axis: Temperature (°C)
X,Y
0,20
10,25
20,32
30,38
40,42
```

## Instalação

### 1. Instalar dependências Python

```bash
cd backend/services/mcp_graph_extractor
pip install -r requirements.txt
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
# Editar .env e adicionar sua chave do Gemini:
# GOOGLE_API_KEY=sua-chave-aqui
```

Obtenha sua chave em: https://aistudio.google.com/app/apikey

### 3. Testar instalação

```bash
python mcp_server.py
# Deve iniciar o servidor MCP via Stdio
```

## Uso via Orchestrador

### Listar tools disponíveis

```bash
GET http://localhost:3000/tools
```

Resposta incluirá:
```json
{
  "name": "extract_graph_data",
  "description": "Extrai dados de pontos (coordenadas X,Y) de uma imagem de grafico...",
  "inputSchema": {
    "type": "object",
    "properties": {
      "image_path": {"type": "string"}
    }
  }
}
```

### Executar extração

```bash
POST http://localhost:3000/execute
Content-Type: application/json

{
  "tool_name": "extract_graph_data",
  "arguments": {
    "image_path": "C:/Users/User/Downloads/grafico.png"
  }
}
```

## Configuração no .mcp.json

Para adicionar este MCP ao orchestrador, inclua em `backend/.mcp.json`:

```json
{
  "mcpServers": {
    "graph-extractor": {
      "command": "python",
      "args": ["../mcp_graph_extractor/mcp_server.py"],
      "env": {
        "GOOGLE_API_KEY": "${GOOGLE_API_KEY}"
      }
    }
  }
}
```

## Importante

- Use caminhos absolutos para as imagens
- Certifique-se que a imagem contém um gráfico claro com eixos visíveis
- A precisão depende da qualidade da imagem e clareza do gráfico
- O modelo Gemini identifica automaticamente escalas e unidades dos eixos
- Para melhores resultados, use imagens com alta resolução e contraste

## Dependências

- **Python 3.8+**
- **google-genai**: SDK oficial do Google Gemini
- **MCP SDK**: Protocol para comunicação com orchestrador
- **python-dotenv**: Gerenciamento de variáveis de ambiente

## Arquitetura

```
Frontend/API
    ↓
Orchestrator (port 3000)
    ↓ (Stdio)
Graph Extractor MCP
    ↓ (HTTPS)
Google Gemini API
```

## Troubleshooting

### Erro: "No module named 'google.genai'"
```bash
pip install google-genai
```

### Erro: "GOOGLE_API_KEY nao encontrada"
- Verificar se .env existe e contém a chave
- Verificar se a chave está configurada no .mcp.json
- Reiniciar o orchestrador após configurar

### Erro: "Arquivo nao encontrado"
- Verifique se o caminho está correto
- Use caminho absoluto (ex: `C:/Users/...`)
- Verifique se o arquivo existe

### Erro: "Resposta do Gemini nao esta em formato JSON valido"
- A imagem pode não conter um gráfico claro
- Tente com uma imagem de maior qualidade
- Verifique se os eixos e valores são legíveis na imagem

### Poucos pontos extraídos
- Aumente a resolução da imagem
- Verifique se todos os pontos estão claramente visíveis
- Certifique-se que há bom contraste entre os pontos e o fundo

## Limitações

- Imagens devem ter tamanho total < 20 MB (incluindo prompt)
- Funciona melhor com gráficos de linha e dispersão
- Pode ter dificuldade com gráficos muito complexos ou sobrepostos
- Requer conexão com internet para acessar Gemini API

## Modelo utilizado

- **gemini-2.0-flash-exp**: Modelo experimental mais recente do Gemini
- Suporta visão computacional avançada
- Rápido e eficiente para análise de imagens
- Capacidade de entender gráficos e extrair dados estruturados
