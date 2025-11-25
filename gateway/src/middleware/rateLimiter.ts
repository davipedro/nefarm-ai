import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { config } from '../config';
import { logger } from '../utils/simpleLogger';

/**
 * Rate Limiter para usuários não autenticados
 * Limite: 20 req/min (configurável)
 */
export const unauthenticatedLimiter = rateLimit({
  windowMs: config.rateLimit.windowMinutes * 60 * 1000,
  max: config.rateLimit.unauthenticated,
  message: {
    error: {
      message: 'Muitas requisições deste IP. Tente novamente em breve.',
      code: 'RATE_LIMIT_EXCEEDED',
      statusCode: 429,
      timestamp: new Date().toISOString(),
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit excedido (não autenticado)', {
      ip: req.ip,
      method: req.method,
      url: req.url,
    });

    res.status(429).json({
      error: {
        message: 'Muitas requisições deste IP. Tente novamente em breve.',
        code: 'RATE_LIMIT_EXCEEDED',
        statusCode: 429,
        timestamp: new Date().toISOString(),
      },
    });
  },
});

/**
 * Rate Limiter para usuários autenticados
 * Limite: 100 req/min (configurável)
 */
export const authenticatedLimiter = rateLimit({
  windowMs: config.rateLimit.windowMinutes * 60 * 1000,
  max: config.rateLimit.authenticated,
  message: {
    error: {
      message: 'Limite de requisições excedido. Tente novamente em breve.',
      code: 'RATE_LIMIT_EXCEEDED',
      statusCode: 429,
      timestamp: new Date().toISOString(),
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Usa userId se disponível, senão usa IP
  keyGenerator: (req) => {
    return (req as any).userId || req.ip || 'unknown';
  },
  handler: (req, res) => {
    logger.warn('Rate limit excedido (autenticado)', {
      userId: (req as any).userId,
      ip: req.ip,
      method: req.method,
      url: req.url,
    });

    res.status(429).json({
      error: {
        message: 'Limite de requisições excedido. Tente novamente em breve.',
        code: 'RATE_LIMIT_EXCEEDED',
        statusCode: 429,
        timestamp: new Date().toISOString(),
      },
    });
  },
});

/**
 * Rate Limiter específico para requisições de IA
 * Limite mais restritivo: 5 req/min
 */
export const aiRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMinutes * 60 * 1000,
  max: config.promptInjection.aiRateLimit,
  message: {
    error: {
      message: 'Limite de requisições para IA excedido. Aguarde antes de fazer nova requisição.',
      code: 'AI_RATE_LIMIT_EXCEEDED',
      statusCode: 429,
      timestamp: new Date().toISOString(),
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return (req as any).userId || req.ip || 'unknown';
  },
  handler: (req, res) => {
    logger.warn('Rate limit de IA excedido', {
      userId: (req as any).userId,
      ip: req.ip,
      method: req.method,
      url: req.url,
    });

    res.status(429).json({
      error: {
        message: 'Limite de requisições para IA excedido. Aguarde antes de fazer nova requisição.',
        code: 'AI_RATE_LIMIT_EXCEEDED',
        statusCode: 429,
        timestamp: new Date().toISOString(),
      },
    });
  },
});

/**
 * Speed Limiter: Diminui velocidade de resposta quando muitas requisições
 * Não bloqueia, mas adiciona delay progressivo
 */
export const speedLimiter = slowDown({
  windowMs: 60 * 1000, // 1 minuto
  delayAfter: 50, // Após 50 requisições, começa a adicionar delay
  delayMs: () => 500, // Adiciona 500ms de delay
});
