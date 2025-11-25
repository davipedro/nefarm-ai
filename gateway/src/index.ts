import express, { Application } from 'express';
import cors from 'cors';
import compression from 'compression';
import fs from 'fs';
import https from 'https';
import http from 'http';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { config, validateConfig } from './config';
import { logger } from './utils/simpleLogger';
import {
  helmetConfig,
  additionalSecurityHeaders,
  requestLogger,
} from './middleware/security';
import {
  errorHandler,
  notFoundHandler,
} from './middleware/errorHandler';
import {
  unauthenticatedLimiter,
  speedLimiter,
  aiRateLimiter,
} from './middleware/rateLimiter';
import {
  sanitizeInput,
  validatePayloadSize,
} from './middleware/validator';
import { detectPromptInjection } from './middleware/promptInjection';

/**
 * Inicializa e configura a aplicação Express
 */
function createApp(): Application {
  const app = express();

  // ========================================
  // NÍVEL 1: Funcionalidade Básica
  // ========================================

  // Parsing de JSON com limite de tamanho
  app.use(express.json({ limit: `${config.maxPayloadSizeMB}mb` }));
  app.use(express.urlencoded({ extended: true, limit: `${config.maxPayloadSizeMB}mb` }));

  // Compressão de respostas
  app.use(compression());

  // CORS configurado
  app.use(
    cors({
      origin: (origin, callback) => {
        // Permite requisições sem origin (ex: Postman, curl)
        if (!origin) {
          return callback(null, true);
        }

        // Verifica se a origin está na allowlist
        if (config.cors.origins.includes(origin)) {
          callback(null, true);
        } else {
          logger.warn('Origem CORS bloqueada', origin);
          callback(new Error('Origem não permitida pelo CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // ========================================
  // NÍVEL 2: Segurança Robusta
  // ========================================

  // Headers de segurança (Helmet)
  app.use(helmetConfig);
  app.use(additionalSecurityHeaders);

  // Rate limiting global (não autenticado)
  app.use(unauthenticatedLimiter);

  // Speed limiting (slow down progressivo)
  app.use(speedLimiter);

  // Validação de tamanho de payload
  app.use(validatePayloadSize);

  // Sanitização de entrada
  app.use(sanitizeInput);

  // Logger de requisições
  app.use(requestLogger);

  // ========================================
  // NÍVEL 4: Detecção de Prompt Injection
  // ========================================

  // Aplica rate limiting e detecção de injection nas rotas de IA
  app.use('/api/v1/query', aiRateLimiter, detectPromptInjection);
  app.use('/api/v1/execute', aiRateLimiter, detectPromptInjection);

  // ========================================
  // Proxy Reverso para MCP Client
  // ========================================

  // Rota raiz
  app.get('/', (req, res) => {
    res.json({
      service: 'NEFARM-AI API Gateway',
      version: '1.0.0',
      status: 'operational',
      timestamp: new Date().toISOString(),
      documentation: '/api/v1',
    });
  });

  // Proxy reverso para todas as rotas /api/v1/*
  app.use(
    '/api/v1',
    createProxyMiddleware({
      target: config.mcpClient.url,
      changeOrigin: true,
      pathRewrite: {
        '^/api/v1': '', // Remove /api/v1 do path antes de enviar ao MCP Client
      },
      timeout: config.mcpClient.timeout,
      proxyTimeout: config.mcpClient.timeout,
      // Importante para requisições longas
      ws: false,
      selfHandleResponse: false,
      // Configurações de buffer e streaming
      buffer: undefined,
      onError: (err, req, res) => {
        logger.error('Erro no proxy', err.message);
        if (!res.headersSent) {
          res.status(502).json({
            error: {
              message: 'Erro ao comunicar com o serviço backend',
              code: 'BAD_GATEWAY',
              statusCode: 502,
              timestamp: new Date().toISOString(),
            },
          });
        }
      },
      onProxyReq: (proxyReq, req, res) => {
        logger.debug(`Proxy: ${req.method} ${req.url} -> ${config.mcpClient.url}`);
        // Remove timeout padrão do Node.js
        proxyReq.setTimeout(0);
      },
      onProxyRes: (proxyRes, req, res) => {
        logger.debug(`Proxy Response: ${proxyRes.statusCode}`);
        // Remove timeout da resposta
        proxyRes.setTimeout(0);
      },
    })
  );

  // ========================================
  // Error Handlers
  // ========================================

  // Handler para rotas não encontradas
  app.use(notFoundHandler);

  // Handler global de erros
  app.use(errorHandler);

  return app;
}

/**
 * Inicia o servidor HTTP ou HTTPS
 */
async function startServer(): Promise<void> {
  try {
    // Valida configurações
    validateConfig();

    // Cria aplicação
    const app = createApp();

    // Decide se usa HTTP ou HTTPS
    let server: http.Server | https.Server;

    if (config.https.enabled) {
      // ========================================
      // NÍVEL 3: HTTPS/TLS
      // ========================================

      logger.info('Modo HTTPS habilitado');

      // Verifica se certificados existem
      if (!fs.existsSync(config.https.certPath)) {
        throw new Error(`Certificado SSL não encontrado: ${config.https.certPath}`);
      }

      if (!fs.existsSync(config.https.keyPath)) {
        throw new Error(`Chave SSL não encontrada: ${config.https.keyPath}`);
      }

      // Carrega certificados
      const credentials = {
        cert: fs.readFileSync(config.https.certPath),
        key: fs.readFileSync(config.https.keyPath),
      };

      // Cria servidor HTTPS
      server = https.createServer(credentials, app);

      logger.info('Certificados SSL carregados com sucesso');
    } else {
      // Cria servidor HTTP
      server = http.createServer(app);
    }

    // Configura timeouts do servidor para requisições longas
    server.setTimeout(config.mcpClient.timeout + 10000); // Timeout maior que o do proxy
    server.keepAliveTimeout = config.mcpClient.timeout + 10000;
    server.headersTimeout = config.mcpClient.timeout + 15000;

    // Inicia servidor
    server.listen(config.port, () => {
      console.log('========================================');
      console.log('🚀 NEFARM-AI API Gateway INICIADO');
      console.log('========================================');
      console.log(`Protocolo: ${config.https.enabled ? 'HTTPS' : 'HTTP'}`);
      console.log(`Porta: ${config.port}`);
      console.log(`Ambiente: ${config.nodeEnv}`);
      console.log(`MCP Client: ${config.mcpClient.url}`);
      console.log(`Timeout: ${config.mcpClient.timeout}ms`);
      console.log(`Rate Limit (não auth): ${config.rateLimit.unauthenticated} req/min`);
      console.log(`Rate Limit (auth): ${config.rateLimit.authenticated} req/min`);
      console.log(`Rate Limit (IA): ${config.promptInjection.aiRateLimit} req/min`);
      console.log(`Prompt Injection Detection: ${config.promptInjection.enabled ? 'Habilitado' : 'Desabilitado'}`);
      console.log('========================================');
      console.log(`URL: ${config.https.enabled ? 'https' : 'http'}://localhost:${config.port}`);
      console.log('========================================');
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM recebido. Encerrando servidor gracefully...');

      server.close(() => {
        logger.info('Servidor encerrado');
        process.exit(0);
      });

      // Força encerramento após 10 segundos
      setTimeout(() => {
        logger.error('Timeout no graceful shutdown. Forçando encerramento.');
        process.exit(1);
      }, 10000);
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT recebido. Encerrando servidor...');

      server.close(() => {
        logger.info('Servidor encerrado');
        process.exit(0);
      });
    });

    // Trata erros não capturados
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection detectado', { reason, promise });
    });

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception detectado', error.message);

      // Em produção, encerra o processo
      if (config.nodeEnv === 'production') {
        process.exit(1);
      }
    });
  } catch (error) {
    logger.error('Erro ao iniciar servidor', (error as Error).message);
    process.exit(1);
  }
}

// Inicia o servidor se executado diretamente
if (require.main === module) {
  startServer();
}

export { createApp, startServer };
