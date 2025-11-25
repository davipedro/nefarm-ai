import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

/**
 * Configuração do Helmet para headers de segurança
 * Implementa múltiplas proteções conforme OWASP
 */
export const helmetConfig = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },

  // Strict Transport Security (HSTS)
  hsts: {
    maxAge: 31536000, // 1 ano
    includeSubDomains: true,
    preload: true,
  },

  // Previne clickjacking
  frameguard: {
    action: 'deny',
  },

  // Previne MIME sniffing
  noSniff: true,

  // Desabilita cache de DNS prefetching
  dnsPrefetchControl: {
    allow: false,
  },

  // Remove o header X-Powered-By
  hidePoweredBy: true,

  // XSS Protection (para browsers antigos)
  xssFilter: true,
});

/**
 * Middleware customizado para adicionar headers de segurança extras
 */
export function additionalSecurityHeaders(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Previne que a página seja incluída em frames
  res.setHeader('X-Frame-Options', 'DENY');

  // Força HTTPS (apenas se HTTPS habilitado)
  if (config.https.enabled) {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // Previne MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy (antigo Feature Policy)
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=()'
  );

  next();
}

/**
 * Middleware para logging de requisições
 * Registra todas as requisições para auditoria
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();

  // Armazena tempo de início na requisição
  (req as any).startTime = startTime;

  // Listener para quando a resposta terminar
  res.on('finish', () => {
    const duration = Date.now() - startTime;

    // Log simples para console
    console.log(`${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
  });

  next();
}

