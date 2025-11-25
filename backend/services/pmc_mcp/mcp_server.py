#!/usr/bin/env python3
"""
PMC MCP Server - Busca e Extração de Artigos Científicos

Fornece ferramentas para:
- Buscar artigos no Europe PMC
- Extrair figuras e legendas de artigos PMC
"""

import logging
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import sys
import os
from pathlib import Path

from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(message)s',
    handlers=[logging.StreamHandler(sys.stderr)]
)

# Criar servidor MCP
app = Server("pmc-mcp")


# ============================================================================
# TOOL 1: search_articles
# ============================================================================

def search_articles(query: str, max_results: int = 10) -> list:
    """
    Busca artigos no Europe PMC.

    Args:
        query: Termo de busca
        max_results: Número máximo de resultados (padrão: 10)

    Returns:
        Lista de artigos com metadados
    """
    url = (
        "https://www.ebi.ac.uk/europepmc/webservices/rest/search"
        f"?query={query}"
        f"&resultType=core&format=json"
        f"&pageSize={max_results}"
    )

    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        data = response.json()

        results = []
        for result in data.get("resultList", {}).get("result", []):
            article = {
                "title": result.get("title", ""),
                "authors": ", ".join(
                    a.get("fullName", "")
                    for a in result.get("authorList", {}).get("author", [])
                ),
                "year": result.get("pubYear", ""),
                "license": result.get("license", ""),
                "pmcid": result.get("pmcid", ""),
                "pmid": result.get("pmid", ""),
                "doi": result.get("doi", ""),
                "url": result.get("fullTextUrlList", {}).get("fullTextUrl", [{}])[0].get("url", "")
            }
            results.append(article)

        return results

    except requests.RequestException as e:
        raise Exception(f"Erro ao buscar artigos: {str(e)}")


# ============================================================================
# TOOL 2: extract_figures
# ============================================================================

def download_image(img_url: str, save_dir: str, filename: str) -> str:
    """
    Baixa uma imagem da URL e salva no diretório especificado.

    Args:
        img_url: URL da imagem
        save_dir: Diretório onde a imagem será salva
        filename: Nome do arquivo para salvar

    Returns:
        Caminho completo do arquivo salvo, ou None se houver erro
    """
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }

        response = requests.get(img_url, headers=headers, timeout=30)
        response.raise_for_status()

        # Cria o diretório se não existir
        Path(save_dir).mkdir(parents=True, exist_ok=True)

        # Caminho completo do arquivo
        filepath = os.path.join(save_dir, filename)

        # Salva a imagem
        with open(filepath, 'wb') as f:
            f.write(response.content)

        return filepath

    except Exception as e:
        print(f"Erro ao baixar imagem {img_url}: {e}", file=sys.stderr)
        return None


def extract_figures(pmcid: str, download_images: bool = False, images_dir: str = "imagens") -> list:
    """
    Extrai figuras e legendas de um artigo PMC.

    Args:
        pmcid: ID do artigo (ex: "PMC9423874")
        download_images: Se True, baixa as imagens localmente (padrão: False)
        images_dir: Diretório onde salvar as imagens (padrão: "imagens")

    Returns:
        Lista de figuras com metadados (e caminho local se download_images=True)
    """
    url = f"https://pmc.ncbi.nlm.nih.gov/articles/{pmcid}/"

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }

    try:
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")

        figures = []

        for figure in soup.find_all("figure"):
            fig_data = {}

            # Extrai ID da figura
            fig_id = figure.get("id", "")
            fig_data["id"] = fig_id

            # Extrai título
            title_tag = figure.find("h4", class_="obj_head")
            fig_data["title"] = title_tag.get_text(strip=True) if title_tag else ""

            # Extrai URL da imagem
            img_url = None
            img_tag = figure.find("img", class_="graphic")
            if img_tag and img_tag.get("src"):
                img_url = img_tag["src"]
                img_url = urljoin(url, img_url)

            fig_data["url"] = img_url

            # Extrai legenda
            caption_tag = figure.find("figcaption")
            caption = caption_tag.get_text(strip=True) if caption_tag else "Sem legenda"
            fig_data["caption"] = caption

            # Extrai alt text
            img_tag = figure.find("img")
            fig_data["alt_text"] = img_tag.get("alt", "") if img_tag else ""

            # Extrai dimensões
            if img_tag:
                fig_data["width"] = img_tag.get("width", "")
                fig_data["height"] = img_tag.get("height", "")

            # Baixa a imagem se solicitado
            if download_images and img_url:
                # Extrai a extensão da URL ou usa .jpg como padrão
                ext = os.path.splitext(img_url)[1] or '.jpg'
                # Nome do arquivo: pmcid_figid.ext (ex: PMC9423874_Fig1.jpg)
                filename = f"{pmcid}_{fig_id}{ext}"

                # Baixa e salva a imagem
                local_path = download_image(img_url, images_dir, filename)
                if local_path:
                    fig_data["local_path"] = local_path

            if img_url:
                figures.append(fig_data)

        return figures

    except requests.RequestException as e:
        raise Exception(f"Erro ao extrair figuras: {str(e)}")


# ============================================================================
# MCP HANDLERS
# ============================================================================

@app.list_tools()
async def list_tools() -> list[Tool]:
    """Lista as ferramentas disponíveis."""
    return [
        Tool(
            name="search_articles",
            description="Busca artigos científicos no Europe PMC. Retorna título, autores, ano, PMCID, DOI e URL.",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Termo de busca (ex: 'molecular docking AND cancer')"
                    },
                    "max_results": {
                        "type": "integer",
                        "description": "Número máximo de resultados (padrão: 10, máximo: 100)",
                        "default": 10
                    }
                },
                "required": ["query"]
            }
        ),
        Tool(
            name="extract_figures",
            description="Extrai todas as figuras e suas legendas de um artigo PMC. Pode baixar as imagens localmente. Retorna ID, título, legenda, URL da imagem, alt text e caminho local (se download_images=true).",
            inputSchema={
                "type": "object",
                "properties": {
                    "pmcid": {
                        "type": "string",
                        "description": "ID do artigo no formato PMC + números (ex: 'PMC9423874')"
                    },
                    "download_images": {
                        "type": "boolean",
                        "description": "Se true, baixa as imagens localmente (padrão: false)",
                        "default": False
                    },
                    "images_dir": {
                        "type": "string",
                        "description": "Diretório onde salvar as imagens (padrão: 'imagens')",
                        "default": "imagens"
                    }
                },
                "required": ["pmcid"]
            }
        )
    ]


@app.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    """Executa uma ferramenta."""

    if name == "search_articles":
        query = arguments.get("query", "")
        max_results = arguments.get("max_results", 10)

        if not query:
            return [TextContent(type="text", text="❌ Erro: Query não pode ser vazia")]

        if max_results < 1 or max_results > 100:
            return [TextContent(type="text", text="❌ Erro: max_results deve estar entre 1 e 100")]

        try:
            results = search_articles(query, max_results)

            if not results:
                return [TextContent(
                    type="text",
                    text="[]"  # Return empty array as JSON
                )]

            # Return results as JSON string
            import json
            return [TextContent(type="text", text=json.dumps(results, ensure_ascii=False))]

        except Exception as e:
            return [TextContent(type="text", text=f"❌ Erro ao buscar artigos: {str(e)}")]

    elif name == "extract_figures":
        pmcid = arguments.get("pmcid", "")
        download_images = arguments.get("download_images", False)
        images_dir = arguments.get("images_dir", "imagens")

        if not pmcid:
            return [TextContent(type="text", text="❌ Erro: PMCID não pode ser vazio")]

        if not pmcid.startswith("PMC"):
            return [TextContent(type="text", text="❌ Erro: PMCID deve começar com 'PMC' (ex: 'PMC9423874')")]

        try:
            figures = extract_figures(pmcid, download_images, images_dir)

            if not figures:
                return [TextContent(
                    type="text",
                    text="[]"  # Return empty array as JSON
                )]

            # Return figures as JSON string
            import json
            return [TextContent(type="text", text=json.dumps(figures, ensure_ascii=False))]

        except Exception as e:
            return [TextContent(type="text", text=f"❌ Erro ao extrair figuras: {str(e)}")]

    else:
        return [TextContent(type="text", text=f"❌ Ferramenta '{name}' não encontrada")]


# ============================================================================
# MAIN
# ============================================================================

async def main():
    """Inicia o servidor MCP via stdio."""
    logging.info("Iniciando PMC MCP server (PID=%d)...", os.getpid())
    async with stdio_server() as (read_stream, write_stream):
        logging.info("Servidor rodando via stdio. Aguardando conexões...")
        await app.run(
            read_stream,
            write_stream,
            app.create_initialization_options()
        )


if __name__ == "__main__":
    import asyncio
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    asyncio.run(main())
