import CircuitBreaker from 'opossum';
import axios, { AxiosRequestConfig } from 'axios';
import { config } from '../config';
import { logger } from './simpleLogger';

/**
 * Configuração do Circuit Breaker para o MCP Client
 * Protege contra falhas em cascata quando o MCP Client está indisponível
 */
const circuitBreakerOptions = {
  timeout: config.circuitBreaker.timeout, // Timeout de requisição
  errorThresholdPercentage: config.circuitBreaker.errorThresholdPercentage, // % de erros para abrir
  resetTimeout: config.circuitBreaker.resetTimeout, // Tempo até tentar fechar novamente
  name: 'mcp-client-circuit-breaker',
};

/**
 * Função que será protegida pelo circuit breaker
 * Faz requisição HTTP para o MCP Client
 */
async function makeRequest(requestConfig: AxiosRequestConfig): Promise<any> {
  try {
    const response = await axios(requestConfig);
    return response.data;
  } catch (error: any) {
    logger.error('Erro ao fazer requisição ao MCP Client', {
      error: error.message,
      url: requestConfig.url,
      method: requestConfig.method,
    });
    throw error;
  }
}

// Cria instância do circuit breaker
export const mcpClientBreaker = new CircuitBreaker(makeRequest, circuitBreakerOptions);

/**
 * Event listeners do circuit breaker para logging
 */

// Quando o circuito abre (muitos erros)
mcpClientBreaker.on('open', () => {
  logger.error('Circuit Breaker ABERTO - MCP Client indisponível', {
    state: 'OPEN',
    errorThreshold: config.circuitBreaker.errorThresholdPercentage,
  });
});

// Quando o circuito fecha (serviço voltou)
mcpClientBreaker.on('close', () => {
  logger.info('Circuit Breaker FECHADO - MCP Client disponível novamente', {
    state: 'CLOSED',
  });
});

// Quando o circuito está meio-aberto (testando se serviço voltou)
mcpClientBreaker.on('halfOpen', () => {
  logger.warn('Circuit Breaker MEIO-ABERTO - Testando MCP Client', {
    state: 'HALF_OPEN',
  });
});

// Quando uma requisição é rejeitada pelo circuito aberto
mcpClientBreaker.on('reject', () => {
  logger.warn('Requisição rejeitada pelo Circuit Breaker', {
    state: mcpClientBreaker.opened ? 'OPEN' : 'UNKNOWN',
  });
});

// Quando uma requisição falha
mcpClientBreaker.on('failure', (error) => {
  logger.error('Falha na requisição ao MCP Client', {
    error: error.message,
  });
});

// Quando uma requisição tem sucesso
mcpClientBreaker.on('success', () => {
  logger.debug('Requisição ao MCP Client bem-sucedida');
});

/**
 * Função auxiliar para fazer requisições usando o circuit breaker
 */
export async function requestWithCircuitBreaker(
  method: string,
  path: string,
  data?: any
): Promise<any> {
  const requestConfig: AxiosRequestConfig = {
    method,
    url: `${config.mcpClient.url}${path}`,
    data,
    timeout: config.mcpClient.timeout,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  try {
    return await mcpClientBreaker.fire(requestConfig);
  } catch (error: any) {
    // Se o circuito estiver aberto
    if (mcpClientBreaker.opened) {
      throw new Error('Serviço temporariamente indisponível. Tente novamente em instantes.');
    }

    // Outros erros
    throw error;
  }
}

/**
 * Retorna estatísticas do circuit breaker
 */
export function getCircuitBreakerStats() {
  const stats = mcpClientBreaker.stats;

  return {
    state: mcpClientBreaker.opened ? 'OPEN' : mcpClientBreaker.halfOpen ? 'HALF_OPEN' : 'CLOSED',
    fires: stats.fires,
    successes: stats.successes,
    failures: stats.failures,
    rejects: stats.rejects,
    timeouts: stats.timeouts,
    fallbacks: stats.fallbacks,
    latencyMean: stats.latencyMean,
  };
}
