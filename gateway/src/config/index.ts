import dotenv from 'dotenv';
import path from 'path';

// Carrega variáveis de ambiente
dotenv.config();

/**
 * Configurações centralizadas do Gateway
 * Todas as configurações são carregadas de variáveis de ambiente
 */
export const config = {
  // Servidor
  port: parseInt(process.env.PORT || '8080', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // MCP Client
  mcpClient: {
    url: process.env.MCP_CLIENT_URL || 'http://localhost:3000',
    timeout: parseInt(process.env.MCP_CLIENT_TIMEOUT || '30000', 10),
  },

  // Rate Limiting
  rateLimit: {
    authenticated: parseInt(process.env.RATE_LIMIT_AUTHENTICATED || '100', 10),
    unauthenticated: parseInt(process.env.RATE_LIMIT_UNAUTHENTICATED || '20', 10),
    windowMinutes: parseInt(process.env.RATE_LIMIT_WINDOW_MIN || '1', 10),
  },

  // CORS
  cors: {
    origins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3001', 'http://localhost:5173'],
  },

  // Payload
  maxPayloadSizeMB: parseInt(process.env.MAX_PAYLOAD_SIZE_MB || '10', 10),

  // HTTPS/TLS
  https: {
    enabled: process.env.ENABLE_HTTPS === 'true',
    certPath: process.env.SSL_CERT_PATH || path.join(__dirname, '../../certs/cert.pem'),
    keyPath: process.env.SSL_KEY_PATH || path.join(__dirname, '../../certs/key.pem'),
  },

  // Circuit Breaker
  circuitBreaker: {
    timeout: parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT || '10000', 10),
    errorThresholdPercentage: parseInt(process.env.CIRCUIT_BREAKER_ERROR_THRESHOLD || '50', 10),
    resetTimeout: parseInt(process.env.CIRCUIT_BREAKER_RESET_TIMEOUT || '30000', 10),
  },

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',

  // Prompt Injection Detection
  promptInjection: {
    enabled: process.env.ENABLE_PROMPT_INJECTION_DETECTION === 'true',
    aiRateLimit: parseInt(process.env.AI_RATE_LIMIT || '5', 10),
  },
} as const;

/**
 * Valida se as configurações obrigatórias estão presentes
 */
export function validateConfig(): void {
  const errors: string[] = [];

  if (!config.mcpClient.url) {
    errors.push('MCP_CLIENT_URL não está definida');
  }

  if (config.https.enabled) {
    if (!config.https.certPath) {
      errors.push('SSL_CERT_PATH não está definida (HTTPS habilitado)');
    }
    if (!config.https.keyPath) {
      errors.push('SSL_KEY_PATH não está definida (HTTPS habilitado)');
    }
  }

  if (errors.length > 0) {
    throw new Error(`Erros de configuração:\n${errors.join('\n')}`);
  }
}
