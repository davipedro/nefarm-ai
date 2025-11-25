import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';
import { logger } from '../utils/simpleLogger';
import { config } from '../config';

/**
 * Padrões suspeitos de prompt injection
 * Baseado em técnicas conhecidas de jailbreaking e manipulação de LLMs
 */
const INJECTION_PATTERNS = [
  // Tentativas de ignorar instruções do sistema
  /ignore\s+(previous|all|above|prior)\s+(instructions?|prompts?|commands?)/gi,
  /forget\s+(everything|all|previous|prior)/gi,
  /disregard\s+(previous|all|above|prior)/gi,

  // Tentativas de revelar o prompt do sistema
  /show\s+(me\s+)?(the\s+)?(system\s+)?(prompt|instructions?)/gi,
  /what\s+(is|are)\s+(your|the)\s+(system\s+)?(prompt|instructions?)/gi,
  /reveal\s+(your|the)\s+(system\s+)?(prompt|instructions?)/gi,
  /print\s+(your|the)\s+(system\s+)?(prompt|instructions?)/gi,

  // Role-playing malicioso
  /you\s+are\s+now\s+(a|an)\s+/gi,
  /pretend\s+(to\s+be|you\s+are)/gi,
  /act\s+as\s+(if|though|a|an)/gi,
  /roleplay\s+as/gi,

  // Tentativas de injeção de comandos
  /system\s*:\s*/gi,
  /assistant\s*:\s*/gi,
  /\[SYSTEM\]/gi,
  /\[INST\]/gi,
  /<\|system\|>/gi,
  /<\|im_start\|>/gi,

  // Tentativas de bypass
  /jailbreak/gi,
  /DAN\s+mode/gi, // "Do Anything Now"
  /developer\s+mode/gi,

  // Caracteres de controle e encoding suspeito
  /\\x[0-9a-f]{2}/gi, // Hex encoding
  /\\u[0-9a-f]{4}/gi, // Unicode encoding
  /&#x?[0-9a-f]+;/gi, // HTML entities

  // Tentativas de injeção SQL/NoSQL (caso a IA tenha acesso a bancos)
  /'\s*(OR|AND)\s*'?\d+/gi,
  /UNION\s+SELECT/gi,
  /DROP\s+TABLE/gi,
  /\$where/gi,
  /\$ne/gi,

  // Tentativas de injeção de script
  /<script/gi,
  /javascript:/gi,
  /onerror\s*=/gi,
  /onclick\s*=/gi,
];

/**
 * Palavras-chave suspeitas que aumentam o score de risco
 */
const SUSPICIOUS_KEYWORDS = [
  'bypass',
  'override',
  'sudo',
  'admin',
  'root',
  'privilege',
  'execute',
  'eval',
  'exec',
  '__import__',
  'os.system',
];

/**
 * Middleware de detecção de prompt injection
 * Analisa o conteúdo da requisição em busca de padrões maliciosos
 */
export function detectPromptInjection(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Só aplica se a detecção estiver habilitada
  if (!config.promptInjection.enabled) {
    return next();
  }

  // Só analisa rotas que enviam dados para a IA
  const aiRoutes = ['/api/v1/query', '/api/v1/execute'];
  if (!aiRoutes.some((route) => req.path === route)) {
    return next();
  }

  try {
    // Extrai texto para análise
    const textToAnalyze = extractTextFromRequest(req);

    if (!textToAnalyze) {
      return next();
    }

    // Calcula score de risco
    const riskScore = calculateRiskScore(textToAnalyze);

    // Se score alto, bloqueia
    if (riskScore >= 5) {
      logger.warn('Possível prompt injection detectado', {
        riskScore,
        ip: req.ip,
        userId: (req as any).userId,
        method: req.method,
        url: req.url,
        textPreview: textToAnalyze.substring(0, 100) + '...',
      });

      throw new AppError(
        'Requisição bloqueada: conteúdo suspeito detectado',
        400,
        'PROMPT_INJECTION_DETECTED'
      );
    }

    // Se score médio, loga mas permite
    if (riskScore >= 2) {
      logger.info('Conteúdo potencialmente suspeito (score baixo)', {
        riskScore,
        ip: req.ip,
        userId: (req as any).userId,
        method: req.method,
        url: req.url,
      });
    }

    next();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    // Se houver erro na análise, permite a requisição mas loga
    logger.error('Erro ao analisar prompt injection', {
      error: (error as Error).message,
      ip: req.ip,
      method: req.method,
      url: req.url,
    });

    next();
  }
}

/**
 * Extrai texto relevante da requisição para análise
 */
function extractTextFromRequest(req: Request): string {
  const parts: string[] = [];

  if (req.body) {
    if (typeof req.body === 'string') {
      parts.push(req.body);
    } else if (typeof req.body === 'object') {
      // Extrai valores de string do objeto
      extractStringsFromObject(req.body, parts);
    }
  }

  if (req.query) {
    extractStringsFromObject(req.query, parts);
  }

  return parts.join(' ');
}

/**
 * Extrai recursivamente strings de um objeto
 */
function extractStringsFromObject(obj: any, result: string[]): void {
  if (typeof obj === 'string') {
    result.push(obj);
    return;
  }

  if (Array.isArray(obj)) {
    obj.forEach((item) => extractStringsFromObject(item, result));
    return;
  }

  if (obj !== null && typeof obj === 'object') {
    Object.values(obj).forEach((value) => extractStringsFromObject(value, result));
  }
}

/**
 * Calcula score de risco baseado em padrões e heurísticas
 * Retorna: 0-1 (baixo), 2-4 (médio), 5+ (alto)
 */
function calculateRiskScore(text: string): number {
  let score = 0;

  // Verifica padrões conhecidos (cada match +2 pontos)
  for (const pattern of INJECTION_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) {
      score += matches.length * 2;
    }
  }

  // Verifica palavras-chave suspeitas (cada palavra +1 ponto)
  const lowerText = text.toLowerCase();
  for (const keyword of SUSPICIOUS_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      score += 1;
    }
  }

  // Heurísticas adicionais

  // Texto muito longo pode ser tentativa de overflow (>10000 chars)
  if (text.length > 10000) {
    score += 1;
  }

  // Muitos caracteres especiais consecutivos
  const specialCharsRatio = (text.match(/[<>{}[\]\\\/|]/g) || []).length / text.length;
  if (specialCharsRatio > 0.1) {
    score += 2;
  }

  // Muitos espaços/quebras de linha consecutivas (possível tentativa de esconder)
  if (/\s{10,}/.test(text)) {
    score += 1;
  }

  return score;
}
