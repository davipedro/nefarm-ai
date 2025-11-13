import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

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
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
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
        return JSON.parse(jsonMatch[0]);
      }

      return {
        tool_name: null,
        reasoning: "Não foi possível parsear a resposta do Gemini",
      };
    } catch (error) {
      // Fallback para modo mock
      console.log("⚠️  Gemini em modo mock - usando fallback");
      return this.mockToolDecision(userQuery);
    }
  }

  /**
   * Decisão mockada quando o Gemini não está disponível
   */
  mockToolDecision(userQuery) {
    const query = userQuery.toLowerCase();

    // Lógica simples de matching
    if (query.includes("imagem") || query.includes("classificar")) {
      return {
        tool_name: "classify_image",
        server_name: "ia-local-classifier",
        arguments: {
          image_description: "Descrição mockada para teste",
        },
        reasoning: "Detectei palavras relacionadas a classificação de imagem",
      };
    }

    if (query.includes("buscar") || query.includes("pesquisar") || query.includes("artigo")) {
      return {
        tool_name: "search",
        server_name: "pubmedmcp",
        arguments: {
          query: userQuery,
        },
        reasoning: "Detectei intenção de busca de artigos",
      };
    }

    if (query.includes("navegar") || query.includes("site") || query.includes("web")) {
      return {
        tool_name: "browser",
        server_name: "browser-use",
        arguments: {
          url: "https://example.com",
        },
        reasoning: "Detectei intenção de navegação web",
      };
    }

    return {
      tool_name: null,
      reasoning: "Nenhuma ferramenta apropriada encontrada para esta consulta",
    };
  }

  /**
   * Executa uma ferramenta em um servidor específico
   */
  async executeTool(serverName, toolName, args) {
    const client = this.clients.get(serverName);

    if (!client) {
      throw new Error(`Servidor ${serverName} não encontrado`);
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
      return {
        success: false,
        error: error.message,
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

    if (!decision.tool_name) {
      return {
        success: false,
        message: decision.reasoning,
      };
    }

    // 2. Executar a ferramenta
    console.log(`⚙️  Executando: ${decision.tool_name} no servidor ${decision.server_name}`);
    const result = await this.executeTool(
      decision.server_name,
      decision.tool_name,
      decision.arguments
    );

    return {
      success: result.success,
      decision,
      result: result.result || result.error,
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
