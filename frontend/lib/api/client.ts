/**
 * API Client for backend communication with retry logic and error handling
 */

import {
  QueryResponse,
  WorkflowResponse,
  ToolResponse,
  HealthResponse,
  ToolsResponse,
  WorkflowsResponse,
} from "./types";

export class ApiClient {
  private baseUrl: string;
  private maxRetries: number = 3;
  private retryDelay: number = 1000; // Initial retry delay in ms
  private timeout: number = 30000; // 30 seconds timeout

  constructor(baseUrl?: string) {
    this.baseUrl =
      baseUrl ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:3000";
  }

  /**
   * Process a natural language query
   * Backend uses Gemini to decide which workflow to execute
   */
  async query(userQuery: string): Promise<QueryResponse> {
    return this.fetchWithRetry<QueryResponse>("/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: userQuery }),
    });
  }

  /**
   * Execute a specific workflow by ID
   */
  async executeWorkflow(
    workflowId: string,
    args: Record<string, any> = {}
  ): Promise<WorkflowResponse> {
    return this.fetchWithRetry<WorkflowResponse>("/workflow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        workflow_id: workflowId,
        arguments: args,
      }),
    });
  }

  /**
   * Execute a specific tool directly
   */
  async executeTool(
    serverName: string,
    toolName: string,
    args: Record<string, any> = {}
  ): Promise<ToolResponse> {
    return this.fetchWithRetry<ToolResponse>("/execute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        server_name: serverName,
        tool_name: toolName,
        arguments: args,
      }),
    });
  }

  /**
   * Get health status of backend
   */
  async getHealth(): Promise<HealthResponse> {
    return this.fetchWithRetry<HealthResponse>("/health", {
      method: "GET",
    });
  }

  /**
   * List all available tools from all MCP servers
   */
  async getTools(): Promise<ToolsResponse> {
    return this.fetchWithRetry<ToolsResponse>("/tools", {
      method: "GET",
    });
  }

  /**
   * List all available workflows
   */
  async getWorkflows(): Promise<WorkflowsResponse> {
    return this.fetchWithRetry<WorkflowsResponse>("/workflows", {
      method: "GET",
    });
  }

  /**
   * Fetch with automatic retry logic for failed requests
   */
  private async fetchWithRetry<T>(
    endpoint: string,
    options: RequestInit,
    retryCount: number = 0
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      // Check if online
      if (!navigator.onLine) {
        throw new Error("OFFLINE: Você está offline. Verifique sua conexão.");
      }

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      // Make request
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Parse response
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;

        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText, success: false };
        }

        // Check if error is retryable
        if (this.shouldRetry(response.status, errorData) && retryCount < this.maxRetries) {
          const delay = this.calculateRetryDelay(retryCount, errorData);
          console.log(
            `Retrying request after ${delay}ms (attempt ${retryCount + 1}/${this.maxRetries})`
          );
          await this.sleep(delay);
          return this.fetchWithRetry<T>(endpoint, options, retryCount + 1);
        }

        // Return error as response
        return errorData as T;
      }

      const data = await response.json();
      return data as T;
    } catch (error: any) {
      // Handle network errors
      if (error.name === "AbortError") {
        throw new Error(
          "TIMEOUT: Requisição excedeu o tempo limite. Tente novamente."
        );
      }

      if (error.message?.includes("ECONNREFUSED") || error.message?.includes("fetch failed")) {
        throw new Error(
          "CONNECTION_REFUSED: Servidor não está rodando. Certifique-se de que o backend está ativo na porta 3000."
        );
      }

      if (error.message?.includes("OFFLINE")) {
        throw error; // Re-throw offline error
      }

      // Retry on network errors
      if (retryCount < this.maxRetries) {
        const delay = this.calculateRetryDelay(retryCount);
        console.log(
          `Network error, retrying after ${delay}ms (attempt ${retryCount + 1}/${this.maxRetries})`
        );
        await this.sleep(delay);
        return this.fetchWithRetry<T>(endpoint, options, retryCount + 1);
      }

      throw new Error(`NETWORK_ERROR: ${error.message || "Erro de rede desconhecido"}`);
    }
  }

  /**
   * Determine if request should be retried based on status code and error data
   */
  private shouldRetry(statusCode: number, errorData: any): boolean {
    // Retry on server errors (5xx)
    if (statusCode >= 500) {
      return true;
    }

    // Retry on rate limit (429)
    if (statusCode === 429) {
      return true;
    }

    // Check error data for retryable flag
    if (errorData?.errorCode?.retryable === true) {
      return true;
    }

    // Check for specific error codes that are retryable
    const errorString = JSON.stringify(errorData).toLowerCase();
    if (
      errorString.includes("gemini_overloaded") ||
      errorString.includes("gemini_unavailable") ||
      errorString.includes("orchestrator_not_initialized") ||
      errorString.includes("tool_execution_failed")
    ) {
      return true;
    }

    return false;
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private calculateRetryDelay(retryCount: number, errorData?: any): number {
    // Use server-provided retry delay if available
    if (errorData?.errorCode?.retryAfter) {
      return errorData.errorCode.retryAfter * 1000; // Convert to ms
    }

    // Check for specific error types with known delays
    const errorString = JSON.stringify(errorData || {}).toLowerCase();
    if (errorString.includes("rate_limit")) {
      return 60000; // 1 minute for rate limit
    }
    if (errorString.includes("overloaded")) {
      return 10000; // 10 seconds for overload
    }
    if (errorString.includes("unavailable")) {
      return 30000; // 30 seconds for unavailable
    }

    // Exponential backoff: 1s, 2s, 4s, 8s, ...
    return this.retryDelay * Math.pow(2, retryCount);
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get base URL being used
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Update configuration
   */
  setConfig(config: {
    baseUrl?: string;
    maxRetries?: number;
    retryDelay?: number;
    timeout?: number;
  }) {
    if (config.baseUrl) this.baseUrl = config.baseUrl;
    if (config.maxRetries !== undefined) this.maxRetries = config.maxRetries;
    if (config.retryDelay !== undefined) this.retryDelay = config.retryDelay;
    if (config.timeout !== undefined) this.timeout = config.timeout;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
