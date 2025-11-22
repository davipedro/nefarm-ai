import "dotenv/config";
import http from "http";
import { MCPOrchestrator } from "./orchestrator.js";
import { ErrorCodes, formatErrorResponse } from "./errors.js";

// Configurações
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "MOCK_GEMINI_API_KEY";
if (process.env.GEMINI_API_KEY) {
  console.log("chave encontrada");
} else {
  console.log("chave não definida");
}

// Instância do orquestrador
let orchestrator = null;

/**
 * Parse do corpo da requisição JSON
 */
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(new Error("JSON inválido"));
      }
    });

    req.on("error", reject);
  });
}

/**
 * Envia resposta JSON
 */
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(data, null, 2));
}

/**
 * Roteador principal
 */
async function handleRequest(req, res) {
  console.log('[index.js - handleRequest] request: ', req);
  const { method, url } = req;

  // CORS preflight
  if (method === "OPTIONS") {
    sendJSON(res, 200, { ok: true });
    return;
  }

  try {
    // GET /health - Health check
    if (method === "GET" && url === "/health") {
      sendJSON(res, 200, {
        status: "ok",
        timestamp: new Date().toISOString(),
        orchestrator: orchestrator ? "connected" : "disconnected",
      });
      return;
    }

    // GET /tools - Lista todas as ferramentas disponíveis
    if (method === "GET" && url === "/tools") {
      if (!orchestrator) {
        sendJSON(res, 503, {
          error: "Orquestrador não inicializado",
        });
        return;
      }

      sendJSON(res, 200, {
        tools: orchestrator.tools,
        total: orchestrator.tools.length,
      });
      return;
    }

    // POST /query - Processa uma consulta
    if (method === "POST" && url === "/query") {
      if (!orchestrator) {
        sendJSON(res, 503, {
          error: "Orquestrador não inicializado",
        });
        return;
      }

      const body = await parseBody(req);

      if (!body.query) {
        sendJSON(res, 400, {
          error: "Campo 'query' é obrigatório",
        });
        return;
      }

      const result = await orchestrator.processQuery(body.query);

      // Extrair httpStatus (para uso interno) e remover da resposta
      const httpStatus = result.httpStatus || (result.success ? 200 : 500);
      delete result.httpStatus; // Não enviar ao cliente

      sendJSON(res, httpStatus, {
        timestamp: new Date().toISOString(),
        ...result,
      });
      return;
    }

    // POST /execute - Executa uma ferramenta específica diretamente
    if (method === "POST" && url === "/execute") {
      if (!orchestrator) {
        sendJSON(res, 503, {
          error: "Orquestrador não inicializado",
        });
        return;
      }

      const body = await parseBody(req);

      if (!body.server_name || !body.tool_name) {
        sendJSON(res, 400, {
          error: "Campos 'server_name' e 'tool_name' são obrigatórios",
        });
        return;
      }

      const result = await orchestrator.executeTool(
        body.server_name,
        body.tool_name,
        body.arguments || {}
      );

      // Determinar HTTP status code
      let httpStatus = 200;
      if (!result.success && result.errorCode) {
        httpStatus = result.errorCode.httpStatus;
        // Formatar erro se ainda não foi formatado
        if (!result.error) {
          const formatted = formatErrorResponse(result.errorCode, result.errorDetails || {});
          Object.assign(result, formatted);
        }
      }

      // Remover campos internos
      delete result.errorCode;
      delete result.errorDetails;
      delete result.httpStatus;

      sendJSON(res, httpStatus, {
        server_name: body.server_name,
        tool_name: body.tool_name,
        timestamp: new Date().toISOString(),
        ...result,
      });
      return;
    }

    // Rota não encontrada
    sendJSON(res, 404, {
      error: "Rota não encontrada",
      availableRoutes: [
        "GET /health",
        "GET /tools",
        "POST /query",
        "POST /execute",
      ],
    });
  } catch (error) {
    console.error("Erro ao processar requisição:", error);
    sendJSON(res, 500, {
      error: error.message,
    });
  }
}

/**
 * Inicializa o servidor
 */
async function startServer() {
  try {
    console.log("🚀 Iniciando servidor MCP Orchestrator...\n");

    // Inicializar orquestrador
    orchestrator = new MCPOrchestrator(GEMINI_API_KEY);
    await orchestrator.initialize();

    // Criar servidor HTTP
    const server = http.createServer(handleRequest);

    server.listen(PORT, () => {
      console.log(`\n✅ Servidor rodando em http://localhost:${PORT}`);
      console.log("\n📋 Rotas disponíveis:");
      console.log(`   GET  http://localhost:${PORT}/health`);
      console.log(`   GET  http://localhost:${PORT}/tools`);
      console.log(`   POST http://localhost:${PORT}/query`);
      console.log(`   POST http://localhost:${PORT}/execute\n`);
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      console.log("\n\n⏹️  Encerrando servidor...");
      if (orchestrator) {
        await orchestrator.disconnect();
      }
      server.close(() => {
        console.log("👋 Servidor encerrado");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("❌ Erro ao iniciar servidor:", error);
    process.exit(1);
  }
}

// Iniciar
startServer();
