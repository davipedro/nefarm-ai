import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

/**
 * Exemplo de cliente MCP que consome o servidor de classificação de imagens
 */
async function main() {
  // Criar o cliente MCP
  const client = new Client(
    {
      name: "ia-local-classifier-client",
      version: "1.0.0",
    },
    {
      capabilities: {},
    }
  );

  // Criar o transport stdio para conectar ao servidor
  const transport = new StdioClientTransport({
    command: "node",
    args: ["mcp_server.js"],
  });

  // Conectar ao servidor
  await client.connect(transport);

  console.log("✅ Conectado ao MCP Server!");

  try {
    // 1. Listar ferramentas disponíveis
    console.log("\n📋 Listando ferramentas disponíveis...");
    const toolsList = await client.listTools();
    console.log("Ferramentas:", JSON.stringify(toolsList, null, 2));

    // 2. Exemplo 1: Classificar uma descrição de gráfico
    console.log("\n\n🔍 Exemplo 1: Classificando um gráfico de barras");
    const result1 = await client.callTool({
      name: "classify_image",
      arguments: {
        image_description:
          "CT values from each batch. Values above the red line indicates weak or negative gene amplification, values between the red and black lines indicates adequate gene amplification, and values below the black line indicates strong gene amplification. (For interpretation of the references to colour in this figure legend, the reader is referred to the web version of this article.) Alt Text: Fig. 5",
      },
    });
    console.log("Resultado:", JSON.stringify(result1, null, 2));

    // 3. Exemplo 2: Classificar uma fotografia
    console.log("\n\n🔍 Exemplo 2: Classificando uma fotografia");
    const result2 = await client.callTool({
      name: "classify_image",
      arguments: {
        image_description:
          "Amplification plot for RNase P TaqPath test.",
      },
    });
    console.log("Resultado:", JSON.stringify(result2, null, 2));

    // 4. Exemplo 3: Classificar um infográfico com dados
    console.log("\n\n🔍 Exemplo 3: Classificando um infográfico");
    const result3 = await client.callTool({
      name: "classify_image",
      arguments: {
        image_description:
          "Study device attached to a 5 ml syringe.",
      },
    });
    console.log("Resultado:", JSON.stringify(result3, null, 2));
  } catch (error) {
    console.error("❌ Erro ao chamar ferramenta:", error);
  } finally {
    // Desconectar do servidor
    await client.close();
    console.log("\n\n👋 Desconectado do MCP Server");
  }
}

// Executar o cliente
main().catch((error) => {
  console.error("❌ Erro fatal:", error);
  process.exit(1);
});
