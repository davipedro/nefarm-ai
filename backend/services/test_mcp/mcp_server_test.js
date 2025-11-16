#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

/**
 * MCP Server de Teste Simples
 * Não precisa de dependências externas, apenas retorna mensagens mockadas
 */

// Criar servidor MCP
const server = new Server(
  {
    name: "test-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Lista as ferramentas disponíveis
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "echo",
        description: "Retorna o texto que você enviar (ferramenta de teste)",
        inputSchema: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "Mensagem para retornar",
            },
          },
          required: ["message"],
        },
      },
      {
        name: "greet",
        description: "Retorna uma saudação personalizada",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Nome da pessoa para cumprimentar",
            },
          },
          required: ["name"],
        },
      },
      {
        name: "math_add",
        description: "Soma dois números (ferramenta de teste)",
        inputSchema: {
          type: "object",
          properties: {
            a: {
              type: "number",
              description: "Primeiro número",
            },
            b: {
              type: "number",
              description: "Segundo número",
            },
          },
          required: ["a", "b"],
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

  if (name === "echo") {
    const message = args.message || "";
    return {
      content: [
        {
          type: "text",
          text: `📢 Echo: ${message}`,
        },
      ],
    };
  }

  if (name === "greet") {
    const name = args.name || "Pessoa";
    return {
      content: [
        {
          type: "text",
          text: `👋 Olá, ${name}! Bem-vindo ao MCP Test Server!`,
        },
      ],
    };
  }

  if (name === "math_add") {
    const a = args.a || 0;
    const b = args.b || 0;
    const result = a + b;
    return {
      content: [
        {
          type: "text",
          text: `🧮 Resultado: ${a} + ${b} = ${result}`,
        },
      ],
    };
  }

  // Ferramenta não encontrada
  return {
    content: [
      {
        type: "text",
        text: `❌ Erro: Ferramenta '${name}' não encontrada.`,
      },
    ],
  };
});

/**
 * Inicializa o servidor
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("✅ Test MCP Server iniciado com sucesso");
}

main().catch((error) => {
  console.error("❌ Erro ao iniciar servidor:", error);
  process.exit(1);
});
