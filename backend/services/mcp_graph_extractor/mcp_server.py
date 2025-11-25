#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
MCP Server para extracao de dados de graficos usando Gemini API
"""
import asyncio
import os
import logging
import sys
import json
from pathlib import Path
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent
from google import genai
from google.genai import types
from dotenv import load_dotenv

# Carregar variaveis de ambiente (override=True garante precedencia do .env local)
load_dotenv(override=True)

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(message)s',
    handlers=[logging.StreamHandler(sys.stderr)]
)

# Criar servidor MCP
app = Server("graph-extractor")

# Inicializar cliente Gemini
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    logging.error("GOOGLE_API_KEY nao encontrada no ambiente")
    sys.exit(1)

client = genai.Client(api_key=GOOGLE_API_KEY)


# ============================================================================
# TOOL: extract_graph_data
# ============================================================================

async def extract_graph_data(image_path: str) -> str:
    """
    Extrai dados de pontos (coordenadas X,Y) de uma imagem de grafico usando Gemini API.

    Args:
        image_path: Caminho completo para arquivo de imagem do grafico

    Returns:
        Dados extraidos em formato CSV (X,Y)
    """
    # Validar que arquivo existe
    if not os.path.exists(image_path):
        return f"Erro: Arquivo nao encontrado em {image_path}"

    # Validar extensao de imagem
    valid_extensions = {'.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.heic', '.heif'}
    file_ext = Path(image_path).suffix.lower()
    if file_ext not in valid_extensions:
        return f"Erro: Formato de arquivo nao suportado. Use: {', '.join(valid_extensions)}"

    try:
        logging.info(f"Lendo imagem: {image_path}")

        # Ler imagem como bytes (metodo inline)
        with open(image_path, 'rb') as f:
            image_bytes = f.read()

        # Determinar MIME type baseado na extensao
        mime_types = {
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.bmp': 'image/bmp',
            '.webp': 'image/webp',
            '.heic': 'image/heic',
            '.heif': 'image/heif'
        }
        mime_type = mime_types.get(file_ext, 'image/jpeg')

        logging.info(f"Enviando para Gemini API (mime_type={mime_type})...")

        # Criar prompt para extracao de dados
        prompt = """Analyze this graph image and extract the data points as coordinates.

Instructions:
1. Identify the X and Y axes and their scales/units
2. Extract ALL visible data points from the graph
3. Return the data in JSON format with this exact structure:
{
  "x_axis": {"label": "...", "unit": "...", "min": number, "max": number},
  "y_axis": {"label": "...", "unit": "...", "min": number, "max": number},
  "data_points": [
    {"x": number, "y": number},
    {"x": number, "y": number}
  ]
}

Important:
- Extract numeric values only
- Preserve the order of points if visible
- Be as accurate as possible with the coordinate values
- If there are multiple series/lines, combine all points in a single array
- Return ONLY the JSON object, no other text"""

        # Enviar para Gemini usando metodo inline
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=[
                types.Part.from_bytes(
                    data=image_bytes,
                    mime_type=mime_type,
                ),
                prompt
            ]
        )

        logging.info("Resposta recebida do Gemini")

        # Processar resposta
        response_text = response.text.strip()

        # Tentar extrair JSON da resposta (pode vir com markdown code blocks)
        if '```json' in response_text:
            json_start = response_text.find('```json') + 7
            json_end = response_text.find('```', json_start)
            response_text = response_text[json_start:json_end].strip()
        elif '```' in response_text:
            json_start = response_text.find('```') + 3
            json_end = response_text.find('```', json_start)
            response_text = response_text[json_start:json_end].strip()

        # Parse JSON
        try:
            data = json.loads(response_text)
        except json.JSONDecodeError as e:
            logging.error(f"Erro ao fazer parse do JSON: {e}")
            logging.error(f"Resposta original: {response_text}")
            return f"Erro: Resposta do Gemini nao esta em formato JSON valido.\nResposta: {response_text}"

        # Validar estrutura
        if 'data_points' not in data or not isinstance(data['data_points'], list):
            return f"Erro: Estrutura JSON invalida. Falta campo 'data_points'.\nDados: {json.dumps(data, indent=2)}"

        logging.info(f"Extraidos {len(data['data_points'])} pontos de dados")

        # Preparar resposta JSON estruturada
        response_data = {
            "metadata": {
                "x_axis": data.get('x_axis', {"label": "N/A", "unit": "N/A", "min": None, "max": None}),
                "y_axis": data.get('y_axis', {"label": "N/A", "unit": "N/A", "min": None, "max": None})
            },
            "data_points": data['data_points'],
            "total_points": len(data['data_points'])
        }

        # Retornar JSON serializado
        return json.dumps(response_data, ensure_ascii=False)

    except Exception as e:
        logging.error(f"Erro durante extracao: {str(e)}")
        return f"Erro durante extracao: {str(e)}"


# ============================================================================
# MCP HANDLERS
# ============================================================================

@app.list_tools()
async def list_tools() -> list[Tool]:
    """Lista as ferramentas disponiveis."""
    return [
        Tool(
            name="extract_graph_data",
            description="Extrai dados do gráfico. Extrai dados de pontos (coordenadas X,Y) de uma imagem de grafico usando Gemini AI. Retorna os dados em formato CSV com metadados dos eixos.",
            inputSchema={
                "type": "object",
                "properties": {
                    "image_path": {
                        "type": "string",
                        "description": "Caminho absoluto para o arquivo de imagem do grafico (formatos: PNG, JPG, JPEG, GIF, BMP, WebP, HEIC, HEIF)"
                    }
                },
                "required": ["image_path"]
            }
        )
    ]


@app.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    """Executa uma ferramenta."""

    if name == "extract_graph_data":
        image_path = arguments.get("image_path", "")

        if not image_path:
            return [TextContent(type="text", text="Erro: image_path nao pode ser vazio")]

        result = await extract_graph_data(image_path)
        return [TextContent(type="text", text=result)]

    else:
        return [TextContent(type="text", text=f"Erro: Ferramenta '{name}' nao encontrada")]


# ============================================================================
# MAIN
# ============================================================================

async def main():
    """Inicia o servidor MCP via stdio."""
    logging.info("Iniciando Graph Extractor MCP server (PID=%d)...", os.getpid())
    async with stdio_server() as (read_stream, write_stream):
        logging.info("Servidor rodando via stdio. Aguardando conexoes...")
        await app.run(
            read_stream,
            write_stream,
            app.create_initialization_options()
        )


if __name__ == "__main__":
    asyncio.run(main())
