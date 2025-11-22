import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { ErrorCodes, detectGeminiError, formatErrorResponse } from "./errors.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Orquestrador MCP que gerencia múltiplos servidores MCP
 * e usa o Gemini para decidir qual ferramenta usar
 */
export class MCPOrchestrator {
  constructor(geminiApiKey) {
    this.clients = new Map();
    this.tools = [];
    this.geminiApiKey = geminiApiKey || "MOCK_GEMINI_API_KEY";
    this.genAI = new GoogleGenerativeAI(this.geminiApiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  }

  /**
   * Inicializa todos os MCP servers do .mcp.json
   */
  async initialize() {
    console.log("🚀 Inicializando orquestrador MCP...");

    // Ler configuração do .mcp.json
    const mcpConfigPath = path.join(__dirname, "../../.mcp.json");
    const mcpConfig = JSON.parse(await fs.readFile(mcpConfigPath, "utf-8"));

    // Conectar a cada servidor MCP
    for (const [serverName, config] of Object.entries(
      mcpConfig.mcpServers
    )) {
      try {
        console.log(`📡 Conectando ao servidor: ${serverName}...`);
        await this.connectToServer(serverName, config);
        console.log(`✅ Conectado: ${serverName}`);
      } catch (error) {
        console.error(`❌ Erro ao conectar ${serverName}:`, error.message);
      }
    }

    // Listar todas as ferramentas disponíveis
    await this.listAllTools();

    console.log(`✅ Orquestrador inicializado com ${this.tools.length} ferramentas`);
  }

  /**
   * Conecta a um servidor MCP específico
   */
  async connectToServer(serverName, config) {
    const client = new Client(
      {
        name: `orchestrator-${serverName}`,
        version: "1.0.0",
      },
      {
        capabilities: {},
      }
    );

    // Criar transport stdio
    const transport = new StdioClientTransport({
      command: config.command,
      args: config.args,
      env: { ...process.env, ...config.env },
    });

    // Conectar
    await client.connect(transport);

    // Armazenar cliente
    this.clients.set(serverName, client);
  }

  /**
   * Lista todas as ferramentas de todos os servidores
   */
  async listAllTools() {
    this.tools = [];

    for (const [serverName, client] of this.clients.entries()) {
      try {
        const toolsList = await client.listTools();

        // Adicionar ferramentas com referência ao servidor
        for (const tool of toolsList.tools || []) {
          this.tools.push({
            serverName,
            name: tool.name,
            description: tool.description,
            inputSchema: tool.inputSchema,
          });
        }
      } catch (error) {
        console.error(`Erro ao listar ferramentas de ${serverName}:`, error);
      }
    }
  }

  /**
   * Usa o Gemini para decidir qual ferramenta usar
   */
  async decideToolWithGemini(userQuery) {
    // Criar descrição de todas as ferramentas
    const toolsDescription = this.tools
      .map(
        (tool, idx) =>
          `${idx + 1}. ${tool.name} (servidor: ${tool.serverName})\n   Descrição: ${tool.description}\n   Schema: ${JSON.stringify(tool.inputSchema)}`
      )
      .join("\n\n");

    const prompt = `Você é um assistente que decide qual ferramenta usar baseado na pergunta do usuário.

Ferramentas disponíveis:
${toolsDescription}

Pergunta do usuário: "${userQuery}"

Analise a pergunta e responda APENAS no seguinte formato JSON:
{
  "tool_name": "nome_da_ferramenta",
  "server_name": "nome_do_servidor",
  "arguments": { "parametro": "valor" },
  "reasoning": "breve explicação da escolha"
}

Se nenhuma ferramenta for apropriada, responda:
{
  "tool_name": null,
  "reasoning": "explicação"
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      // Extrair JSON da resposta
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return {
          success: true,
          data: JSON.parse(jsonMatch[0]),
        };
      }

      // Se não conseguir parsear, retornar erro
      console.log("⚠️  Não foi possível parsear resposta do Gemini");
      const errorCode = ErrorCodes.GEMINI_PARSE_ERROR;
      return {
        success: false,
        errorCode,
      };
    } catch (error) {
      // Detectar tipo de erro do Gemini
      const errorCode = detectGeminiError(error);

      console.log("⚠️  Erro ao chamar Gemini");
      console.log(`❌ Tipo de erro: ${errorCode.code}`);
      console.log(`📋 Mensagem: ${error.message}`);

      return {
        success: false,
        errorCode,
      };
    }
  }

  /**
   * Executa uma ferramenta em um servidor específico
   */
  async executeTool(serverName, toolName, args) {
    const client = this.clients.get(serverName);

    if (!client) {
      const errorCode = ErrorCodes.SERVER_NOT_FOUND;
      return {
        success: false,
        errorCode,
        errorDetails: {
          serverName,
          availableServers: Array.from(this.clients.keys()),
        },
      };
    }

    try {
      const result = await client.callTool({
        name: toolName,
        arguments: args,
      });

      return {
        success: true,
        result: result.content,
      };
    } catch (error) {
      const errorCode = ErrorCodes.TOOL_EXECUTION_FAILED;
      return {
        success: false,
        errorCode,
        errorDetails: {
          serverName,
          toolName,
          originalError: error.message,
        },
      };
    }
  }

  /**
   * Processa uma consulta do usuário (orquestração completa)
   */
  async processQuery(userQuery) {
    console.log(`\n🔍 Processando: "${userQuery}"`);

    // 1. Decidir qual ferramenta usar com o Gemini
    const decision = await this.decideToolWithGemini(userQuery);
    console.log(`💭 Decisão: ${JSON.stringify(decision, null, 2)}`);

    // Se houve erro no Gemini, retornar erro estruturado
    if (!decision.success) {
      return formatErrorResponse(decision.errorCode, {
        query: userQuery,
      });
    }

    const toolDecision = decision.data;

    // Se o Gemini não encontrou ferramenta apropriada
    if (!toolDecision.tool_name) {
      return {
        success: false,
        message: toolDecision.reasoning,
        query: userQuery,
      };
    }

    // 2. Executar a ferramenta
    console.log(`⚙️  Executando: ${toolDecision.tool_name} no servidor ${toolDecision.server_name}`);
    const result = await this.executeTool(
      toolDecision.server_name,
      toolDecision.tool_name,
      toolDecision.arguments
    );

    // Se houve erro na execução da ferramenta
    if (!result.success) {
      return formatErrorResponse(result.errorCode, {
        query: userQuery,
        decision: toolDecision,
        ...result.errorDetails,
      });
    }

    // Sucesso
    return {
      success: true,
      query: userQuery,
      decision: toolDecision,
      result: result.result,
    };
  }

  /**
   * Desconecta todos os clientes
   */
  async disconnect() {
    console.log("\n👋 Desconectando todos os servidores...");

    for (const [serverName, client] of this.clients.entries()) {
      try {
        await client.close();
        console.log(`✅ Desconectado: ${serverName}`);
      } catch (error) {
        console.error(`❌ Erro ao desconectar ${serverName}:`, error);
      }
    }
  }
}
