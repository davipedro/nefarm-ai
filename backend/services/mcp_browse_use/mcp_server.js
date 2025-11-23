#!/usr/bin/env node

/**
 * Browser Use MCP Server - Download de Imagens
 *
 * Fornece ferramentas para:
 * - Baixar imagens de URLs
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs";
import path from "path";
import crypto from "crypto";

// Diretório fixo para salvar imagens
const IMAGES_DIR = "C:/Users/souzs/projects/trabalho-sistemas-dist/nefarm-ai/images_temp";

// Criar servidor MCP
const server = new Server(
  {
    name: "browser-use-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// ============================================================================
// TOOL: download_image
// ============================================================================

/**
 * Valida se a URL é válida e usa protocolo HTTP/HTTPS
 * @param {string} url - URL para validar
 * @returns {boolean} true se válida
 */
function isValidUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Extrai a extensão do arquivo da URL ou Content-Type
 * @param {string} url - URL da imagem
 * @param {string} contentType - Content-Type do response
 * @returns {string} extensão do arquivo
 */
function getExtension(url, contentType) {
  // Tentar extrair da URL primeiro
  try {
    const urlPath = new URL(url).pathname;
    const urlExt = path.extname(urlPath).toLowerCase();

    if (urlExt && [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".bmp", ".ico"].includes(urlExt)) {
      return urlExt;
    }
  } catch {}

  // Mapear Content-Type para extensão
  const mimeMap = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/svg+xml": ".svg",
    "image/bmp": ".bmp",
    "image/x-icon": ".ico",
  };

  if (contentType) {
    const mime = contentType.split(";")[0].trim().toLowerCase();
    if (mimeMap[mime]) {
      return mimeMap[mime];
    }
  }

  // Padrão
  return ".jpg";
}

/**
 * Gera um nome de arquivo aleatório
 * @param {string} ext - extensão do arquivo
 * @returns {string} nome do arquivo
 */
function generateRandomFilename(ext) {
  const randomId = crypto.randomBytes(8).toString("hex");
  return `img_${randomId}${ext}`;
}

/**
 * Baixa uma imagem de uma URL e salva localmente
 *
 * @param {string} imageUrl - URL da imagem
 * @returns {Promise<Object>} Informações do download
 */
async function downloadImage(imageUrl) {
  // Validar URL
  if (!isValidUrl(imageUrl)) {
    throw new Error("URL inválida. Use formato http:// ou https://");
  }

  // Fazer requisição
  const response = await fetch(imageUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      "Accept": "image/*,*/*;q=0.8",
    },
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
  }

  // Verificar se é uma imagem
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.startsWith("image/")) {
    console.error(`Aviso: Content-Type não é imagem: ${contentType}`);
  }

  // Determinar extensão e gerar nome aleatório
  const ext = getExtension(imageUrl, contentType);
  const filename = generateRandomFilename(ext);

  // Criar diretório se não existir
  fs.mkdirSync(IMAGES_DIR, { recursive: true });

  // Caminho completo
  const filepath = path.join(IMAGES_DIR, filename);

  // Baixar e salvar
  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(filepath, buffer);

  // Retornar informações
  return {
    success: true,
    filepath: filepath,
    filename: filename,
    size: buffer.length,
    contentType: contentType,
    url: imageUrl,
  };
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
        name: "download_image",
        description:
          "Baixa uma imagem de uma URL e salva em images_temp. O nome do arquivo é gerado automaticamente.",
        inputSchema: {
          type: "object",
          properties: {
            image_url: {
              type: "string",
              description: "URL da imagem para baixar (http:// ou https://)",
            },
          },
          required: ["image_url"],
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

  if (name === "download_image") {
    const imageUrl = args.image_url || "";

    // Validações
    if (!imageUrl) {
      return {
        content: [
          { type: "text", text: "❌ Erro: image_url é obrigatório" },
        ],
      };
    }

    if (!isValidUrl(imageUrl)) {
      return {
        content: [
          {
            type: "text",
            text: "❌ Erro: URL inválida. Use formato http:// ou https://",
          },
        ],
      };
    }

    try {
      const result = await downloadImage(imageUrl);

      // Formatar tamanho
      const sizeKB = (result.size / 1024).toFixed(2);
      const sizeMB = (result.size / (1024 * 1024)).toFixed(2);
      const sizeStr = result.size > 1024 * 1024
        ? `${sizeMB} MB`
        : `${sizeKB} KB`;

      const response = [
        `✅ Imagem baixada com sucesso!`,
        ``,
        `📁 Arquivo: ${result.filename}`,
        `📂 Caminho: ${result.filepath}`,
        `📊 Tamanho: ${sizeStr}`,
        `🖼️ Tipo: ${result.contentType}`,
        `🔗 URL: ${result.url}`,
      ].join("\n");

      return {
        content: [{ type: "text", text: response }],
      };
    } catch (e) {
      let errorMsg = e.message;

      // Melhorar mensagens de erro comuns
      if (e.name === "TimeoutError" || errorMsg.includes("timeout")) {
        errorMsg = "Timeout: A imagem demorou mais de 30s para baixar";
      } else if (errorMsg.includes("ENOTFOUND")) {
        errorMsg = "Domínio não encontrado. Verifique a URL.";
      } else if (errorMsg.includes("ECONNREFUSED")) {
        errorMsg = "Conexão recusada pelo servidor.";
      }

      return {
        content: [
          { type: "text", text: `❌ Erro ao baixar imagem: ${errorMsg}` },
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
  console.error(`Iniciando Browser Use MCP server (PID=${process.pid})...`);
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("✅ Browser Use MCP Server iniciado com sucesso");
}

main().catch((error) => {
  console.error("❌ Erro ao iniciar servidor:", error);
  process.exit(1);
});
