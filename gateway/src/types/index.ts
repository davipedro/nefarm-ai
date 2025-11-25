import { Request } from 'express';

/**
 * Extensão do Request do Express para incluir dados customizados
 */
export interface CustomRequest extends Request {
  userId?: string;
  startTime?: number;
  isAuthenticated?: boolean;
}

/**
 * Estrutura de erro padronizada
 */
export interface ErrorResponse {
  error: {
    message: string;
    code: string;
    statusCode: number;
    timestamp: string;
  };
}

/**
 * Estrutura de resposta de health check
 */
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  services: {
    mcpClient: 'up' | 'down';
  };
}

/**
 * Dados de payload para validação
 */
export interface QueryPayload {
  query: string;
  parameters?: Record<string, unknown>;
}

export interface ExecutePayload {
  tool: string;
  arguments?: Record<string, unknown>;
}
