# Browser Use MCP Server

Servidor MCP para download de imagens de URLs.

## Ferramentas Disponíveis

### `download_image`

Baixa uma imagem de uma URL e salva localmente.

**Parâmetros:**

| Parâmetro   | Tipo    | Obrigatório | Padrão      | Descrição                                      |
|-------------|---------|-------------|-------------|------------------------------------------------|
| image_url   | string  | Sim         | -           | URL da imagem (http:// ou https://)            |
| save_dir    | string  | Não         | "downloads" | Diretório onde salvar                          |
| filename    | string  | Não         | auto        | Nome do arquivo (gerado automaticamente)       |
| timeout     | integer | Não         | 30000       | Timeout em ms (1000-120000)                    |

**Formatos suportados:** JPG, PNG, GIF, WebP, SVG, BMP, ICO

**Exemplo de uso:**

```json
{
  "tool_name": "download_image",
  "arguments": {
    "image_url": "https://example.com/imagem.png",
    "save_dir": "imagens",
    "filename": "minha_imagem.png"
  }
}
```

**Resposta de sucesso:**

```
✅ Imagem baixada com sucesso!

📁 Arquivo: minha_imagem.png
📂 Caminho: imagens/minha_imagem.png
📊 Tamanho: 245.32 KB
🖼️ Tipo: image/png
🔗 URL: https://example.com/imagem.png
```

## Como Executar

```bash
# Na raiz do backend
npm run start:browser-use
```

## Troubleshooting

### URL inválida
- Verifique se a URL começa com `http://` ou `https://`
- Verifique se a URL está acessível

### Timeout
- Aumente o parâmetro `timeout` para imagens grandes
- Verifique sua conexão de internet

### Erro de permissão
- Verifique se o diretório `save_dir` tem permissão de escrita

### Testar via Postman
```json
{
  "command": "node",
  "args": ["C:/Users/souzs/projects/trabalho-sistemas-dist/nefarm-ai/backend/services/mcp_browse_use/mcp_server.js"]
}
```