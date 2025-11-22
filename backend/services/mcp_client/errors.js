/**
 * Códigos de erro padronizados para o MCP Orchestrator
 */

export const ErrorCodes = {
  // Erros de validação (4xx)
  MISSING_QUERY: {
    code: "MISSING_QUERY",
    message: "Campo 'query' é obrigatório",
    httpStatus: 400,
    retryable: false,
  },
  MISSING_PARAMETERS: {
    code: "MISSING_PARAMETERS",
    message: "Campos 'server_name' e 'tool_name' são obrigatórios",
    httpStatus: 400,
    retryable: false,
  },
  INVALID_JSON: {
    code: "INVALID_JSON",
    message: "JSON inválido no corpo da requisição",
    httpStatus: 400,
    retryable: false,
  },
  ROUTE_NOT_FOUND: {
    code: "ROUTE_NOT_FOUND",
    message: "Rota não encontrada",
    httpStatus: 404,
    retryable: false,
  },

  // Erros de serviço (5xx)
  ORCHESTRATOR_NOT_INITIALIZED: {
    code: "ORCHESTRATOR_NOT_INITIALIZED",
    message: "Orquestrador não inicializado",
    httpStatus: 503,
    retryable: true,
    retryAfter: 5, // segundos
  },
  SERVER_NOT_FOUND: {
    code: "SERVER_NOT_FOUND",
    message: "Servidor MCP não encontrado",
    httpStatus: 404,
    retryable: false,
  },
  TOOL_EXECUTION_FAILED: {
    code: "TOOL_EXECUTION_FAILED",
    message: "Erro ao executar ferramenta",
    httpStatus: 500,
    retryable: true,
    retryAfter: 3,
  },

  // Erros de IA (Gemini)
  GEMINI_OVERLOADED: {
    code: "GEMINI_OVERLOADED",
    message: "O modelo Gemini está sobrecarregado. Tente novamente em alguns instantes.",
    httpStatus: 503,
    retryable: true,
    retryAfter: 10, // segundos
    fallbackMode: "mock",
  },
  GEMINI_RATE_LIMIT: {
    code: "GEMINI_RATE_LIMIT",
    message: "Limite de requisições do Gemini atingido",
    httpStatus: 429,
    retryable: true,
    retryAfter: 60,
  },
  GEMINI_UNAVAILABLE: {
    code: "GEMINI_UNAVAILABLE",
    message: "Serviço Gemini temporariamente indisponível",
    httpStatus: 503,
    retryable: true,
    retryAfter: 30,
    fallbackMode: "mock",
  },
  GEMINI_PARSE_ERROR: {
    code: "GEMINI_PARSE_ERROR",
    message: "Não foi possível interpretar a resposta do Gemini",
    httpStatus: 500,
    retryable: true,
    retryAfter: 5,
    fallbackMode: "mock",
  },

  // Erro genérico
  INTERNAL_ERROR: {
    code: "INTERNAL_ERROR",
    message: "Erro interno do servidor",
    httpStatus: 500,
    retryable: true,
    retryAfter: 5,
  },
};

/**
 * Detecta o tipo de erro do Gemini baseado na mensagem
 */
export function detectGeminiError(error) {
  const errorMessage = error.message || "";

  if (errorMessage.includes("503") || errorMessage.includes("overloaded")) {
    return ErrorCodes.GEMINI_OVERLOADED;
  }

  if (errorMessage.includes("429") || errorMessage.includes("rate limit")) {
    return ErrorCodes.GEMINI_RATE_LIMIT;
  }

  if (
    errorMessage.includes("fetch") ||
    errorMessage.includes("network") ||
    errorMessage.includes("timeout")
  ) {
    return ErrorCodes.GEMINI_UNAVAILABLE;
  }

  return ErrorCodes.GEMINI_PARSE_ERROR;
}

/**
 * Formata uma resposta de erro padronizada
 */
export function formatErrorResponse(errorCode, additionalInfo = {}) {
  const response = {
    success: false,
    httpStatus: errorCode.httpStatus, // Para uso interno no servidor
    error: {
      code: errorCode.code,
      message: errorCode.message,
      retryable: errorCode.retryable,
      timestamp: new Date().toISOString(),
      ...additionalInfo,
    },
  };

  if (errorCode.retryAfter) {
    response.error.retryAfter = errorCode.retryAfter;
  }

  if (errorCode.fallbackMode) {
    response.error.fallbackMode = errorCode.fallbackMode;
  }

  return response;
}
