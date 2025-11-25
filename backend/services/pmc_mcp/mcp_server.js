#!/usr/bin/env node

/**
 * PMC MCP Server - Busca e Extração de Artigos Científicos
 *
 * Fornece ferramentas para:
 * - Buscar artigos no Europe PMC
 * - Extrair figuras e legendas de artigos PMC
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import * as cheerio from "cheerio";
import fs from "fs";
import path from "path";

// Criar servidor MCP
const server = new Server(
  {
    name: "pmc-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// ============================================================================
// TOOL 1: search_articles
// ============================================================================

/**
 * Busca artigos no Europe PMC.
 *
 * @param {string} query - Termo de busca
 * @param {number} maxResults - Número máximo de resultados (padrão: 10)
 * @returns {Promise<Array>} Lista de artigos com metadados
 */
async function searchArticles(query, maxResults = 10) {
  const url =
    `https://www.ebi.ac.uk/europepmc/webservices/rest/search` +
    `?query=${encodeURIComponent(query)}` +
    `&resultType=core&format=json` +
    `&pageSize=${maxResults}`;

  const response = await fetch(url, {
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    throw new Error(`Erro HTTP: ${response.status}`);
  }

  const data = await response.json();

  const results = [];
  const resultList = data.resultList?.result || [];

  for (const result of resultList) {
    const authors = (result.authorList?.author || [])
      .map((a) => a.fullName || "")
      .join(", ");

    const fullTextUrls = result.fullTextUrlList?.fullTextUrl || [];
    const articleUrl = fullTextUrls.length > 0 ? fullTextUrls[0].url || "" : "";

    const article = {
      title: result.title || "",
      authors: authors,
      year: result.pubYear || "",
      license: result.license || "",
      pmcid: result.pmcid || "",
      pmid: result.pmid || "",
      doi: result.doi || "",
      url: articleUrl,
    };

    results.push(article);
  }

  return results;
}

// ============================================================================
// TOOL 2: extract_figures
// ============================================================================

/**
 * Baixa uma imagem da URL e salva no diretório especificado.
 *
 * @param {string} imgUrl - URL da imagem
 * @param {string} saveDir - Diretório onde a imagem será salva
 * @param {string} filename - Nome do arquivo para salvar
 * @returns {Promise<string|null>} Caminho completo do arquivo salvo, ou null se houver erro
 */
async function downloadImage(imgUrl, saveDir, filename) {
  try {
    const response = await fetch(imgUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    // Cria o diretório se não existir
    fs.mkdirSync(saveDir, { recursive: true });

    // Caminho completo do arquivo
    const filepath = path.join(saveDir, filename);

    // Salva a imagem
    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(filepath, buffer);

    return filepath;
  } catch (e) {
    console.error(`Erro ao baixar imagem ${imgUrl}: ${e.message}`);
    return null;
  }
}

/**
 * Extrai figuras e legendas de um artigo PMC.
 *
 * @param {string} pmcid - ID do artigo (ex: "PMC9423874")
 * @param {boolean} downloadImages - Se true, baixa as imagens localmente (padrão: false)
 * @param {string} imagesDir - Diretório onde salvar as imagens (padrão: "imagens")
 * @returns {Promise<Array>} Lista de figuras com metadados (e caminho local se downloadImages=true)
 */
async function extractFigures(
  pmcid,
  downloadImages = false,
  imagesDir = "imagens"
) {
  const url = `https://pmc.ncbi.nlm.nih.gov/articles/${pmcid}/`;

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    },
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    throw new Error(`Erro HTTP: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const figures = [];

  $("figure").each(async function () {
    const figure = $(this);
    const figData = {};

    // Extrai ID da figura
    const figId = figure.attr("id") || "";
    figData.id = figId;

    // Extrai título
    const titleTag = figure.find("h4.obj_head");
    figData.title = titleTag.length > 0 ? titleTag.text().trim() : "";

    // Extrai URL da imagem
    let imgUrl = null;
    const imgTag = figure.find("img.graphic");
    if (imgTag.length > 0 && imgTag.attr("src")) {
      imgUrl = imgTag.attr("src");
      // Resolve URL relativa
      imgUrl = new URL(imgUrl, url).href;
    }
    figData.url = imgUrl;

    // Extrai legenda
    const captionTag = figure.find("figcaption");
    const caption =
      captionTag.length > 0 ? captionTag.text().trim() : "Sem legenda";
    figData.caption = caption;

    // Extrai alt text
    const imgForAlt = figure.find("img");
    figData.alt_text =
      imgForAlt.length > 0 ? imgForAlt.attr("alt") || "" : "";

    // Extrai dimensões
    if (imgForAlt.length > 0) {
      figData.width = imgForAlt.attr("width") || "";
      figData.height = imgForAlt.attr("height") || "";
    }

    if (imgUrl) {
      figures.push({ ...figData, downloadImages, imagesDir, pmcid });
    }
  });

  // Processar downloads de imagens (se solicitado)
  const processedFigures = [];
  for (const fig of figures) {
    const { downloadImages: shouldDownload, imagesDir: dir, pmcid: id, ...figData } = fig;

    if (shouldDownload && figData.url) {
      // Extrai a extensão da URL ou usa .jpg como padrão
      const ext = path.extname(new URL(figData.url).pathname) || ".jpg";
      // Nome do arquivo: pmcid_figid.ext (ex: PMC9423874_Fig1.jpg)
      const filename = `${id}_${figData.id}${ext}`;

      // Baixa e salva a imagem
      const localPath = await downloadImage(figData.url, dir, filename);
      if (localPath) {
        figData.local_path = localPath;
      }
    }

    processedFigures.push(figData);
  }

  return processedFigures;
}

// ============================================================================
// MCP HANDLERS
// ============================================================================

/**
 * Lista as ferramentas disponíveis
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "search_articles",
        description:
          "Busca artigos científicos no Europe PMC. Retorna título, autores, ano, PMCID, DOI e URL.",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description:
                "Termo de busca (ex: 'molecular docking AND cancer')",
            },
            max_results: {
              type: "integer",
              description:
                "Número máximo de resultados (padrão: 10, máximo: 100)",
              default: 10,
            },
          },
          required: ["query"],
        },
      },
      {
        name: "extract_figures",
        description:
          "Extrai todas as figuras e suas legendas de um artigo PMC. Pode baixar as imagens localmente. Retorna ID, título, legenda, URL da imagem, alt text e caminho local (se download_images=true).",
        inputSchema: {
          type: "object",
          properties: {
            pmcid: {
              type: "string",
              description:
                "ID do artigo no formato PMC + números (ex: 'PMC9423874')",
            },
            download_images: {
              type: "boolean",
              description:
                "Se true, baixa as imagens localmente (padrão: false)",
              default: false,
            },
            images_dir: {
              type: "string",
              description:
                "Diretório onde salvar as imagens (padrão: 'imagens')",
              default: "imagens",
            },
          },
          required: ["pmcid"],
        },
      },
    ],
  };
});

/**
 * Executa a ferramenta solicitada
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "search_articles") {
    const query = args.query || "";
    const maxResults = args.max_results || 10;

    if (!query) {
      return {
        content: [{ type: "text", text: "❌ Erro: Query não pode ser vazia" }],
      };
    }

    if (maxResults < 1 || maxResults > 100) {
      return {
        content: [
          { type: "text", text: "❌ Erro: max_results deve estar entre 1 e 100" },
        ],
      };
    }

    try {
      const results = await searchArticles(query, maxResults);

      if (results.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "[]",  // Return empty array as JSON
            },
          ],
        };
      }

      // Return results as JSON string
      return {
        content: [{ type: "text", text: JSON.stringify(results) }],
      };
    } catch (e) {
      return {
        content: [
          { type: "text", text: `❌ Erro ao buscar artigos: ${e.message}` },
        ],
      };
    }
  }

  if (name === "extract_figures") {
    const pmcid = args.pmcid || "";
    const downloadImages = args.download_images || false;
    const imagesDir = args.images_dir || "imagens";

    if (!pmcid) {
      return {
        content: [{ type: "text", text: "❌ Erro: PMCID não pode ser vazio" }],
      };
    }

    if (!pmcid.startsWith("PMC")) {
      return {
        content: [
          {
            type: "text",
            text: "❌ Erro: PMCID deve começar com 'PMC' (ex: 'PMC9423874')",
          },
        ],
      };
    }

    try {
      const figures = await extractFigures(pmcid, downloadImages, imagesDir);

      if (figures.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "[]",  // Return empty array as JSON
            },
          ],
        };
      }

      // Return figures as JSON string
      return {
        content: [{ type: "text", text: JSON.stringify(figures) }],
      };
    } catch (e) {
      return {
        content: [
          { type: "text", text: `❌ Erro ao extrair figuras: ${e.message}` },
        ],
      };
    }
  }

  // Ferramenta não encontrada
  return {
    content: [{ type: "text", text: `❌ Ferramenta '${name}' não encontrada` }],
  };
});

// ============================================================================
// MAIN
// ============================================================================

/**
 * Inicializa o servidor MCP via stdio
 */
async function main() {
  console.error(`Iniciando PMC MCP server (PID=${process.pid})...`);
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Servidor rodando via stdio. Aguardando conexões...");
}

main().catch((error) => {
  console.error("❌ Erro ao iniciar servidor:", error);
  process.exit(1);
});
