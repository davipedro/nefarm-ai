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
    this.workflows = [];
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

    // Carregar workflows disponíveis (DESABILITADO - usar apenas tools diretas)
    // await this.loadWorkflows();
    this.workflows = []; // Workflows desabilitados

    console.log(`✅ Orquestrador inicializado com ${this.tools.length} ferramentas (workflows desabilitados)`);
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
        // Aumentar timeout para 20 minutos (especialmente para ia-local com Ollama e workflows longos)
        timeout: 1200000, // 20 minutos em ms
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
   * Carrega workflows disponíveis do arquivo workflows.json
   */
  async loadWorkflows() {
    try {
      const workflowsPath = path.join(__dirname, "workflows.json");
      const workflowsData = JSON.parse(await fs.readFile(workflowsPath, "utf-8"));
      this.workflows = workflowsData.workflows || [];
      console.log(`📋 Carregados ${this.workflows.length} workflows`);
    } catch (error) {
      console.error("⚠️  Erro ao carregar workflows:", error.message);
      this.workflows = [];
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
   * Usa o Gemini para decidir qual workflow executar
   */
  async decideWorkflowWithGemini(userQuery) {
    // Criar descrição dos workflows disponíveis
    const workflowsDescription = this.workflows
      .map(
        (wf, idx) =>
          `${idx + 1}. ${wf.name} (ID: ${wf.id})\n   Descrição: ${wf.description}\n   Casos de uso: ${wf.use_cases.join(", ")}\n   Steps base: ${wf.base_steps.length} passos`
      )
      .join("\n\n");

    // Criar descrição de todas as ferramentas
    const toolsDescription = this.tools
      .map(
        (tool, idx) =>
          `${idx + 1}. ${tool.name} (servidor: ${tool.serverName})\n   Descrição: ${tool.description}\n   Schema: ${JSON.stringify(tool.inputSchema)}`
      )
      .join("\n\n");

    const prompt = `Você é um assistente que cria workflows de execução de ferramentas.

WORKFLOWS BASE DISPONÍVEIS:
${workflowsDescription}

FERRAMENTAS DISPONÍVEIS:
${toolsDescription}

Pergunta do usuário: "${userQuery}"

Analise a pergunta e crie um workflow. Você pode:
1. Usar um workflow base (mantenha os steps, mas ajuste arguments)
2. Modificar um workflow base (adicione, remova ou altere steps)
3. Criar workflow totalmente novo

RESPONDA APENAS NO FORMATO JSON:
{
  "workflow_id": "id_do_workflow_base_usado" ou null,
  "custom_workflow": true ou false,
  "steps": [
    {
      "step": 1,
      "tool_name": "nome_da_ferramenta",
      "server_name": "nome_do_servidor",
      "arguments": { "parametro": "valor" },
      "input_mapping": {
        "arg_name": "$step.N.result.path.to.value"
      },
      "description": "breve descrição do que este step faz"
    }
  ],
  "reasoning": "explicação da escolha e estrutura do workflow"
}

ESTRUTURA DE RETORNO DAS TOOLS MCP:
Todas as tools MCP retornam dados no formato:
result: [
  {
    "type": "text",
    "text": "{\"campo1\": \"valor1\", ...}"  // JSON stringified ou texto simples
  }
]
O sistema automaticamente faz parse do JSON dentro do campo "text" quando você usa input_mapping.
Para acessar campos, use o path após "result[0]":
- "$step.1.result[0].campo1" irá pegar "valor1" do JSON parseado automaticamente

result: [
  {
    "type": "text",
    "text": "{\"campo1\": \"valor1\", ...}"  // JSON stringified ou texto simples
  }
]

O sistema automaticamente faz parse do JSON dentro do campo "text" quando você usa input_mapping.
Para acessar campos, use o path após result[0]:
- "$step.1.result[0].campo1" irá pegar "valor1" do JSON parseado automaticamente

REGRAS IMPORTANTES PARA INPUT_MAPPING:
- Use "$step.N.result[0].campo" para pegar dados do step N
- O sistema faz parse automático do JSON dentro de result[0].text
- Use "$context.path" para pegar do contexto global
- Valores fixos vão direto em "arguments"
- input_mapping é opcional, use apenas quando precisar de dados de steps anteriores

EXEMPLOS:
Exemplo 1: "buscar artigos sobre propofol"
{
  "workflow_id": "search_only",
  "custom_workflow": false,
  "steps": [{"step": 1, "tool_name": "search_articles", "server_name": "pmc-mcp", "arguments": {"query": "propofol"}, "description": "Buscar artigos"}],
  "reasoning": "Query simples de busca"
}

Exemplo 2: "buscar artigos sobre propofol e extrair os gráficos"
{
  "workflow_id": "search_and_extract_graphs",
  "custom_workflow": false,
  "steps": [
    {"step": 1, "tool_name": "search_articles", "server_name": "pmc-mcp", "arguments": {"query": "propofol"}, "description": "Buscar artigos"},
    {"step": 2, "tool_name": "extract_figures", "server_name": "pmc-mcp", "input_mapping": {"pmcid": "$step.1.result[0].pmcid"}, "description": "Extrair figuras"},
    {"step": 3, "tool_name": "extract_graph_data", "server_name": "graph-extractor", "input_mapping": {"image_path": "$step.2.result.figures[0].path"}, "description": "Extrair dados"}
  ],
  "reasoning": "Workflow completo de busca e extração"
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
   * Função auxiliar para parsear result de MCP tool se for JSON stringified
   */
  parseMCPResult(result) {
    // Se result é array, processar cada item
    if (Array.isArray(result)) {
      return result.map(item => this.parseMCPResult(item));
    }

    // Se é objeto MCP com type: "text" e text parece JSON, fazer parse
    if (result && typeof result === 'object' && result.type === 'text' && typeof result.text === 'string') {
      try {
        // Tentar parsear o text como JSON
        if (result.text.trim().startsWith('{') || result.text.trim().startsWith('[')) {
          const parsed = JSON.parse(result.text);
          return parsed;
        }
      } catch (e) {
        // Se não for JSON válido, retornar o text como está
        return result.text;
      }
      return result.text;
    }

    return result;
  }

  /**
   * Função auxiliar para navegar em objetos usando path (ex: "result[0].pmcid")
   */
  getNestedValue(obj, path) {
    try {
      // Remove espaços e divide o path
      const keys = path.replace(/\s/g, "").split(/\.|\[|\]/).filter(Boolean);

      let current = obj;
      for (const key of keys) {
        if (current === undefined || current === null) {
          return undefined;
        }
        current = current[key];

        // Se chegamos em um resultado MCP, fazer parse se necessário
        if (current && typeof current === 'object' && current.type === 'text') {
          current = this.parseMCPResult(current);
        }
      }

      return current;
    } catch (error) {
      console.error(`❌ Erro ao navegar no path "${path}":`, error.message);
      return undefined;
    }
  }

  /**
   * Resolve input_mapping substituindo referências $step.N.path pelos valores reais
   */
  resolveMapping(args, mapping, context) {
    const resolved = { ...args };

    if (!mapping) return resolved;

    for (const [key, pathExpression] of Object.entries(mapping)) {
      try {
        if (typeof pathExpression === 'string' && pathExpression.startsWith('$step.')) {
          // Extrai: $step.2.result.pmcid -> stepNum=2, path=result.pmcid
          const match = pathExpression.match(/\$step\.(\d+)\.(.+)/);
          if (!match) {
            console.error(`❌ Formato inválido de mapping: ${pathExpression}`);
            continue;
          }

          const stepNum = parseInt(match[1]);
          const valuePath = match[2];

          // Busca no context.steps
          const stepData = context.steps.find(s => s.step === stepNum);
          if (!stepData) {
            console.error(`❌ Step ${stepNum} não encontrado no contexto`);
            continue;
          }

          // Extrai o valor usando getNestedValue
          const value = this.getNestedValue(stepData, valuePath);
          if (value !== undefined) {
            resolved[key] = value;
            console.log(`  📌 Mapping resolvido: ${key} = ${JSON.stringify(value)}`);
          } else {
            console.error(`❌ Valor não encontrado em ${pathExpression}`);
          }
        } else if (typeof pathExpression === 'string' && pathExpression.startsWith('$context.')) {
          // Suporte para $context.path no futuro
          const valuePath = pathExpression.replace('$context.', '');
          const value = this.getNestedValue(context, valuePath);
          if (value !== undefined) {
            resolved[key] = value;
          }
        }
      } catch (error) {
        console.error(`❌ Erro ao resolver mapping para "${key}":`, error.message);
      }
    }

    return resolved;
  }

  /**
   * Executa um workflow completo (múltiplos steps em sequência)
   */
  async executeWorkflow(workflowPlan) {
    console.log(`\n🔄 Executando workflow (${workflowPlan.steps.length} steps)`);
    console.log(`📋 Workflow ID: ${workflowPlan.workflow_id || 'custom'}`);
    console.log(`📝 Reasoning: ${workflowPlan.reasoning}`);

    const context = { steps: [] };
    const results = [];

    for (const step of workflowPlan.steps) {
      console.log(`\n⚙️  Step ${step.step}: ${step.description || step.tool_name}`);

      // 1. Resolver input_mapping (se houver)
      const resolvedArgs = this.resolveMapping(
        step.arguments || {},
        step.input_mapping,
        context
      );

      console.log(`  🔧 Tool: ${step.tool_name} @ ${step.server_name}`);
      console.log(`  📥 Arguments:`, JSON.stringify(resolvedArgs, null, 2));

      // 2. Executar tool
      const result = await this.executeTool(
        step.server_name,
        step.tool_name,
        resolvedArgs
      );

      // 3. Armazenar no contexto
      const stepResult = {
        step: step.step,
        tool: step.tool_name,
        server: step.server_name,
        description: step.description,
        success: result.success,
        result: result.success ? result.result : null,
        error: !result.success ? result : null
      };

      context.steps.push(stepResult);
      results.push(stepResult);

      if (result.success) {
        console.log(`  ✅ Step ${step.step} concluído`);
      } else {
        console.log(`  ❌ Step ${step.step} falhou`);
        // Parar workflow se algum step falhar
        break;
      }
    }

    const allSuccess = results.every(r => r.success);
    console.log(`\n${allSuccess ? '✅' : '❌'} Workflow finalizado`);

    return {
      success: allSuccess,
      workflow_id: workflowPlan.workflow_id,
      custom_workflow: workflowPlan.custom_workflow,
      reasoning: workflowPlan.reasoning,
      steps: results,
      final_result: results[results.length - 1]?.result,
      context: context
    };
  }

  /**
   * Processa uma consulta do usuário (orquestração completa)
   */
  async processQuery(userQuery) {
    console.log(`\n🔍 Processando: "${userQuery}"`);

    // 1. Decidir workflow com o Gemini
    const decision = await this.decideWorkflowWithGemini(userQuery);
    console.log(`💭 Decisão Workflow: ${JSON.stringify(decision, null, 2)}`);

    // Se houve erro no Gemini, retornar erro estruturado
    if (!decision.success) {
      return formatErrorResponse(decision.errorCode, {
        query: userQuery,
      });
    }

    const workflowPlan = decision.data;

    // Validar que temos steps
    if (!workflowPlan.steps || workflowPlan.steps.length === 0) {
      return {
        success: false,
        message: workflowPlan.reasoning || "Nenhuma ação apropriada encontrada",
        query: userQuery,
      };
    }

    // 2. Se for apenas 1 step, executar diretamente (compatibilidade)
    if (workflowPlan.steps.length === 1) {
      const singleStep = workflowPlan.steps[0];
      console.log(`⚙️  Executando single tool: ${singleStep.tool_name} no servidor ${singleStep.server_name}`);

      const result = await this.executeTool(
        singleStep.server_name,
        singleStep.tool_name,
        singleStep.arguments || {}
      );

      if (!result.success) {
        return formatErrorResponse(result.errorCode, {
          query: userQuery,
          step: singleStep,
          ...result.errorDetails,
        });
      }

      return {
        success: true,
        query: userQuery,
        workflow_id: workflowPlan.workflow_id,
        reasoning: workflowPlan.reasoning,
        single_step: true,
        result: result.result,
      };
    }

    // 3. Se temos múltiplos steps, executar workflow completo
    const workflowResult = await this.executeWorkflow(workflowPlan);

    return {
      success: workflowResult.success,
      query: userQuery,
      ...workflowResult,
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
