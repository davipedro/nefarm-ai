import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// URL do Ollama rodando localmente
const OLLAMA_URL = "http://localhost:11434/api/generate";
const MODEL_NAME = "llama3:8b";

/**
 * Classifica uma imagem como gráfico ou não-gráfico usando o modelo local.
 *
 * @param {string} imageDescription - Descrição textual da imagem
 * @returns {Promise<Object>} Dicionário com a classificação e justificativa
 */
async function classifyImageWithOllama(imageDescription) {
  // Montar o prompt completo para o modelo
  const prompt = `Você é um especialista em análise de imagens. Com base na descrição fornecida, classifique se a imagem é um GRÁFICO ou NÃO-GRÁFICO.

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

Descrição da imagem: ${imageDescription}

Responda APENAS no seguinte formato JSON (sem texto adicional):
{
  "classificacao": "GRAFICO" ou "NAO_GRAFICO",
  "confianca": 0.0 a 1.0,
  "justificativa": "breve explicação da decisão"
}`;

  try {
    // Fazer requisição ao Ollama
    const response = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        prompt: prompt,
        stream: false,
      }),
      signal: AbortSignal.timeout(60000), // 60 segundos timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Extrair a resposta do modelo
    const result = await response.json();
    const modelResponse = result.response || "";

    return {
      resposta_bruta: modelResponse,
    };
  } catch (error) {
    return {
      resposta_bruta: "ERROR",
    };
  }
}

// Criar instância do servidor MCP
const server = new Server(
  {
    name: "ia-local-classifier",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Lista as ferramentas disponíveis no MCP Server.
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "classify_image",
        description:
          "Classifica uma imagem como GRÁFICO ou NÃO-GRÁFICO usando IA local. " +
          "Fornece uma descrição textual da imagem e recebe uma classificação " +
          "com nível de confiança e justificativa.",
        inputSchema: {
          type: "object",
          properties: {
            image_description: {
              type: "string",
              description:
                "Descrição detalhada da imagem a ser classificada. " +
                "Inclua elementos visuais, cores, formas, texto visível, " +
                "e qualquer característica relevante.",
            },
          },
          required: ["image_description"],
        },
      },
    ],
  };
});

/**
 * Executa a ferramenta solicitada.
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "classify_image") {
    const imageDescription = args.image_description || "";

    if (!imageDescription) {
      return {
        content: [
          {
            type: "text",
            text: "Erro: A descrição da imagem é obrigatória.",
          },
        ],
      };
    }

    // Classificar a imagem
    const result = await classifyImageWithOllama(imageDescription);

    // Formatar resultado
    const formattedResult = JSON.stringify(result, null, 2);

    return {
      content: [
        {
          type: "text",
          text: `Resultado da classificação:\n\n${formattedResult}`,
        },
      ],
    };
  }

  return {
    content: [
      {
        type: "text",
        text: `Erro: Ferramenta '${name}' não encontrada.`,
      },
    ],
  };
});

/**
 * Função principal para iniciar o servidor MCP.
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Server ia-local-classifier iniciado");
}

main().catch((error) => {
  console.error("Erro ao iniciar servidor:", error);
  process.exit(1);
});
