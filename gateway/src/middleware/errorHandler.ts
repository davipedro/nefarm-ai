import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/simpleLogger';
import { ErrorResponse } from '../types';

/**
 * Classe de erro customizada com código e status
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR'
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Middleware global de tratamento de erros
 * Captura todos os erros e retorna resposta padronizada
 * NÃO expõe stack traces ou detalhes de implementação
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  // Determina status code
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const code = err instanceof AppError ? err.code : 'INTERNAL_ERROR';

  // Loga o erro completo (com stack trace)
  logger.error('Erro capturado pelo errorHandler', {
    error: err.message,
    stack: err.stack,
    statusCode,
    code,
    method: req.method,
    url: req.url,
    ip: req.ip,
  });

  // Mensagem de erro sanitizada para o cliente
  let clientMessage = err.message;

  // Em produção, não expõe detalhes de erros internos
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    clientMessage = 'Erro interno do servidor';
  }

  // Resposta padronizada
  const errorResponse: ErrorResponse = {
    error: {
      message: clientMessage,
      code,
      statusCode,
      timestamp: new Date().toISOString(),
    },
  };

  res.status(statusCode).json(errorResponse);
}

/**
 * Middleware para capturar rotas não encontradas
 */
export function notFoundHandler(req: Request, res: Response): void {
  const errorResponse: ErrorResponse = {
    error: {
      message: `Rota ${req.method} ${req.path} não encontrada`,
      code: 'NOT_FOUND',
      statusCode: 404,
      timestamp: new Date().toISOString(),
    },
  };

  logger.warn('Rota não encontrada', {
    method: req.method,
    path: req.path,
    ip: req.ip,
  });

  res.status(404).json(errorResponse);
}
