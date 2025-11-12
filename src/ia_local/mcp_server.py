import asyncio
import json
from typing import Any
import httpx
from mcp.server import Server
from mcp.types import Tool, TextContent

# URL do Ollama rodando localmente
OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "tinyllama"

# Criar instância do servidor MCP
app = Server("ia-local-classifier")

async def classify_image_with_ollama(image_description: str) -> dict[str, Any]:
    """
    Classifica uma imagem como gráfico ou não-gráfico usando o modelo local.

    Args:
        image_description: Descrição textual da imagem

    Returns:
        Dicionário com a classificação e justificativa
    """
    # Montar o prompt completo para o modelo
    prompt = f"""Você é um especialista em análise de imagens. Com base na descrição fornecida, classifique se a imagem é um GRÁFICO ou NÃO-GRÁFICO.

Um GRÁFICO inclui:
- Gráficos de linha, barra, pizza, dispersão
- Diagramas estatísticos
- Visualizações de dados
- Infográficos com dados quantitativos
- Tabelas com visualização gráfica

NÃO-GRÁFICO inclui:
- Fotografias normais
- Ilustrações artísticas
- Capturas de tela de texto
- Desenhos sem dados quantitativos
- Logos e ícones

Descrição da imagem: {image_description}

Responda APENAS no seguinte formato JSON (sem texto adicional):
{{
  "classificacao": "GRAFICO" ou "NAO_GRAFICO",
  "confianca": 0.0 a 1.0,
  "justificativa": "breve explicação da decisão"
}}"""

    try:
        # Fazer requisição ao Ollama
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                OLLAMA_URL,
                json={
                    "model": MODEL_NAME,
                    "prompt": prompt,
                    "stream": False
                }
            )
            response.raise_for_status()

            # Extrair a resposta do modelo
            result = response.json()
            model_response = result.get("response", "")

            # Tentar parsear o JSON da resposta
            try:
                # Extrair JSON da resposta (o modelo pode adicionar texto extra)
                start_idx = model_response.find("{")
                end_idx = model_response.rfind("}") + 1

                if start_idx != -1 and end_idx > start_idx:
                    json_str = model_response[start_idx:end_idx]
                    classification = json.loads(json_str)
                else:
                    # Fallback se não conseguir parsear
                    classification = {
                        "classificacao": "NAO_GRAFICO",
                        "confianca": 0.5,
                        "justificativa": "Não foi possível processar a resposta do modelo",
                        "resposta_bruta": model_response
                    }
            except json.JSONDecodeError:
                # Fallback se o JSON estiver malformado
                classification = {
                    "classificacao": "NAO_GRAFICO",
                    "confianca": 0.5,
                    "justificativa": "Erro ao parsear resposta do modelo",
                    "resposta_bruta": model_response
                }

            return classification

    except httpx.HTTPError as e:
        return {
            "erro": f"Erro ao conectar com Ollama: {str(e)}",
            "classificacao": "ERRO",
            "confianca": 0.0,
            "justificativa": "Não foi possível conectar ao serviço de IA local"
        }
    except Exception as e:
        return {
            "erro": f"Erro inesperado: {str(e)}",
            "classificacao": "ERRO",
            "confianca": 0.0,
            "justificativa": "Ocorreu um erro durante o processamento"
        }

@app.list_tools()
async def list_tools() -> list[Tool]:
    """
    Lista as ferramentas disponíveis no MCP Server.
    """
    return [
        Tool(
            name="classify_image",
            description=(
                "Classifica uma imagem como GRÁFICO ou NÃO-GRÁFICO usando IA local. "
                "Fornece uma descrição textual da imagem e recebe uma classificação "
                "com nível de confiança e justificativa."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "image_description": {
                        "type": "string",
                        "description": (
                            "Descrição detalhada da imagem a ser classificada. "
                            "Inclua elementos visuais, cores, formas, texto visível, "
                            "e qualquer característica relevante."
                        )
                    }
                },
                "required": ["image_description"]
            }
        )
    ]

@app.call_tool()
async def call_tool(name: str, arguments: Any) -> list[TextContent]:
    """
    Executa a ferramenta solicitada.
    """
    if name == "classify_image":
        image_description = arguments.get("image_description", "")

        if not image_description:
            return [
                TextContent(
                    type="text",
                    text="Erro: A descrição da imagem é obrigatória."
                )
            ]

        # Classificar a imagem
        result = await classify_image_with_ollama(image_description)

        # Formatar resultado
        formatted_result = json.dumps(result, indent=2, ensure_ascii=False)

        return [
            TextContent(
                type="text",
                text=f"Resultado da classificação:\n\n{formatted_result}"
            )
        ]

    return [
        TextContent(
            type="text",
            text=f"Erro: Ferramenta '{name}' não encontrada."
        )
    ]

async def main():
    """
    Função principal para iniciar o servidor MCP.
    """
    from mcp.server.stdio import stdio_server

    async with stdio_server() as (read_stream, write_stream):
        await app.run(
            read_stream,
            write_stream,
            app.create_initialization_options()
        )

if __name__ == "__main__":
    asyncio.run(main())
