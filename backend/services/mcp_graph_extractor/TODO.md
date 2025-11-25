# TODO - Graph Extractor MCP

## Próximos Passos

### 1. Instalação e Configuração
- [ ] Instalar dependências Python:
  ```bash
  cd backend/services/mcp_graph_extractor
  pip install -r requirements.txt
  ```
- [ ] Criar arquivo `.env` baseado no `.env.example`
- [ ] Adicionar `GOOGLE_API_KEY` válida no `.env`
- [ ] Obter chave em: https://aistudio.google.com/app/apikey

### 2. Testes Iniciais
- [ ] Testar servidor standalone: `python mcp_server.py`
- [ ] Verificar se servidor inicia sem erros
- [ ] Testar com imagem de gráfico de exemplo
- [ ] Validar formato CSV de saída
- [ ] Verificar precisão da extração de pontos

### 3. Integração com Orchestrador
- [ ] Reiniciar orchestrador (mcp_client) para carregar novo MCP
- [ ] Verificar se tool `extract_graph_data` aparece em `GET /tools`
- [ ] Testar via API: `POST /execute` com imagem real
- [ ] Validar resposta e qualidade dos dados extraídos

### 4. Refinamentos (se necessário)
- [ ] Ajustar prompt do Gemini para melhor precisão
- [ ] Adicionar suporte para múltiplas séries/linhas no mesmo gráfico
- [ ] Implementar detecção de tipo de gráfico (linha, barra, dispersão)
- [ ] Adicionar validação de qualidade da imagem
- [ ] Considerar salvar CSV em arquivo ao invés de retornar string

### 5. Limpeza
- [ ] Após confirmar que mcp_graph_extractor funciona perfeitamente:
  - [ ] Remover `backend/services/mcp_browse_use/` (diretório completo)
  - [ ] Remover entrada "browser-use" de `backend/.mcp.json`
  - [ ] Limpar dependências não utilizadas

### 6. Documentação
- [ ] Atualizar documentação principal do projeto mencionando novo MCP
- [ ] Adicionar exemplos de uso com imagens reais
- [ ] Documentar limitações conhecidas
- [ ] Criar guia de troubleshooting baseado em problemas encontrados

## Notas Importantes

- **Modelo usado**: `gemini-2.0-flash-exp` (experimental, pode mudar)
- **Limite de tamanho**: 20 MB total (imagem + prompt)
- **Formatos suportados**: PNG, JPG, JPEG, GIF, BMP, WebP, HEIC, HEIF
- **Método**: Inline (imagem como bytes direto na requisição)

## Possíveis Melhorias Futuras

- [ ] Cache de resultados para evitar reprocessamento
- [ ] Suporte para múltiplas imagens em batch
- [ ] Exportar também em JSON além de CSV
- [ ] Adicionar tool para plotar/visualizar dados extraídos
- [ ] Integração com análise estatística dos dados
- [ ] Suporte para gráficos 3D
- [ ] OCR adicional para textos pequenos/ilegíveis
