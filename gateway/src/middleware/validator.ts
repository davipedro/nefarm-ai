import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';
import { logger } from '../utils/simpleLogger';

/**
 * Schema de validação para POST /api/v1/query
 */
export const querySchema = Joi.object({
  query: Joi.string().required().min(1).max(5000).trim(),
  parameters: Joi.object().optional(),
});

/**
 * Schema de validação para POST /api/v1/execute
 */
export const executeSchema = Joi.object({
  tool: Joi.string().required().min(1).max(100).trim(),
  arguments: Joi.object().optional(),
});

/**
 * Middleware factory para validação de schemas
 * Valida o corpo da requisição contra um schema Joi
 */
export function validateBody(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Retorna todos os erros, não apenas o primeiro
      stripUnknown: true, // Remove campos não definidos no schema
    });

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message).join('; ');

      logger.warn('Validação de entrada falhou', {
        errors: errorMessages,
        body: req.body,
        ip: req.ip,
        method: req.method,
        url: req.url,
      });

      throw new AppError(
        `Validação falhou: ${errorMessages}`,
        400,
        'VALIDATION_ERROR'
      );
    }

    // Substitui body com valor validado e sanitizado
    req.body = value;
    next();
  };
}

/**
 * Middleware para sanitização de strings
 * Remove caracteres potencialmente perigosos
 */
export function sanitizeInput(req: Request, res: Response, next: NextFunction): void {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  next();
}

/**
 * Sanitiza recursivamente um objeto
 * Remove caracteres especiais perigosos mas mantém funcionalidade
 */
function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (obj !== null && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }

  return obj;
}

/**
 * Sanitiza uma string individual
 * Remove caracteres de controle e normaliza espaços
 */
function sanitizeString(str: string): string {
  return str
    // Remove caracteres de controle exceto \n, \r, \t
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Normaliza múltiplos espaços
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Middleware para validar tamanho do payload
 */
export function validatePayloadSize(req: Request, res: Response, next: NextFunction): void {
  const contentLength = req.get('content-length');

  if (contentLength) {
    const sizeMB = parseInt(contentLength, 10) / (1024 * 1024);
    const maxSize = 10; // 10MB

    if (sizeMB > maxSize) {
      logger.warn('Payload muito grande rejeitado', {
        sizeMB: sizeMB.toFixed(2),
        maxSizeMB: maxSize,
        ip: req.ip,
        method: req.method,
        url: req.url,
      });

      throw new AppError(
        `Payload muito grande. Máximo permitido: ${maxSize}MB`,
        413,
        'PAYLOAD_TOO_LARGE'
      );
    }
  }

  next();
}
