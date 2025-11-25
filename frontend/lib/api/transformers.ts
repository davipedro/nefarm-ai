/**
 * Data transformation layer between backend and frontend models
 */

import {
  BackendArticle,
  BackendFigure,
  BackendGraphData,
  QueryResponse,
  MCPToolContent,
} from "./types";
import { Article, Graph } from "@/lib/mockData";

export class DataTransformer {
  /**
   * Transform backend article to frontend Article model
   * Note: Backend doesn't return abstract, journal, or graph count
   * These will be populated in subsequent steps or use placeholders
   */
  static transformArticle(backendArticle: BackendArticle): Article {
    return {
      id: backendArticle.pmcid || backendArticle.pmid || "",
      title: backendArticle.title || "Untitled",
      authors: backendArticle.authors
        ? backendArticle.authors.split(",").map((a) => a.trim())
        : [],
      year: parseInt(backendArticle.year) || new Date().getFullYear(),
      pmid: backendArticle.pmid || "",
      journal: "N/A", // Not provided by backend
      abstract: "Clique para ver detalhes do artigo", // Placeholder
      doi: backendArticle.doi || "",
      license: backendArticle.license || "",
      graphCount: 0, // Will be updated after extract_figures
      graphs: [], // Will be populated after extract_figures
    };
  }

  /**
   * Transform backend figure to frontend Graph model
   */
  static transformFigure(backendFigure: BackendFigure): Graph {
    return {
      id: backendFigure.id,
      imageUrl: backendFigure.url,
      caption: backendFigure.caption || "Sem legenda",
      type: this.classifyGraphType(
        backendFigure.caption || "",
        backendFigure.title || ""
      ),
      extractedData: undefined, // Will be populated after graph extraction
    };
  }

  /**
   * Classify graph type from caption/title using keyword matching
   * Uses heuristics to determine the most likely graph type
   */
  static classifyGraphType(caption: string, title: string): string {
    const text = `${caption} ${title}`.toLowerCase();

    // Check for specific graph types
    if (text.includes("bar") || text.includes("histogram"))
      return "Bar chart";
    if (
      text.includes("line") ||
      text.includes("curve") ||
      text.includes("time course") ||
      text.includes("temporal")
    )
      return "Line graph";
    if (text.includes("scatter") || text.includes("correlation"))
      return "Scatter plot";
    if (
      (text.includes("dose") && text.includes("response")) ||
      text.includes("concentration-effect")
    )
      return "Dose-response curve";
    if (text.includes("pie") || text.includes("proportion"))
      return "Pie chart";
    if (text.includes("box") || text.includes("whisker")) return "Box plot";
    if (text.includes("heat") || text.includes("matrix")) return "Heatmap";
    if (text.includes("survival") || text.includes("kaplan"))
      return "Survival curve";

    // Default
    return "Graph";
  }

  /**
   * Transform backend graph extraction data to frontend format
   */
  static transformGraphData(
    backendData: BackendGraphData
  ): Array<{ x: number; y: number }> {
    if (!backendData || !backendData.data_points) {
      return [];
    }
    return backendData.data_points;
  }

  /**
   * Parse MCP tool result
   * MCP tools return: [{type: "text", text: "..."}]
   * The text field may contain JSON stringified data or plain text
   */
  static parseToolResult(result: any): any {
    // Handle array of MCP content objects
    if (Array.isArray(result) && result.length > 0 && result[0]?.type === "text") {
      const text = result[0].text;

      // Try to parse as JSON
      if (text && typeof text === "string") {
        const trimmed = text.trim();
        if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
          try {
            return JSON.parse(trimmed);
          } catch (e) {
            // Not valid JSON, return as text
            return { text: trimmed };
          }
        }
        return { text: trimmed };
      }
      return result[0];
    }

    // Already parsed or different format
    return result;
  }

  /**
   * Extract workflow result based on workflow response structure
   * Handles both single-step and multi-step workflows
   */
  static extractWorkflowResult(response: QueryResponse): {
    articles?: Article[];
    figures?: Graph[];
    graphData?: Array<{ x: number; y: number }>;
    rawData?: any;
  } {
    if (!response.success) return {};

    // Single step response
    if (response.single_step && response.result) {
      const parsed = this.parseToolResult(response.result);
      return { rawData: parsed };
    }

    // Multi-step workflow - get last step result
    if (response.steps && response.steps.length > 0) {
      const lastStep = response.steps[response.steps.length - 1];
      if (lastStep?.success && lastStep.result) {
        const parsed = this.parseToolResult(lastStep.result);
        return { rawData: parsed };
      }
    }

    // Use final_result if available
    if (response.final_result) {
      const parsed = this.parseToolResult(response.final_result);
      return { rawData: parsed };
    }

    return {};
  }

  /**
   * Extract articles from search_articles tool result
   */
  static extractArticlesFromResult(result: any): Article[] {
    const parsed = this.parseToolResult(result);

    // Check if it's an array of articles
    if (Array.isArray(parsed)) {
      return parsed
        .filter((item) => item.title) // Filter out invalid entries
        .map((item) => this.transformArticle(item as BackendArticle));
    }

    // Check if it's wrapped in a results field
    if (parsed.results && Array.isArray(parsed.results)) {
      return parsed.results
        .filter((item: any) => item.title)
        .map((item: any) => this.transformArticle(item as BackendArticle));
    }

    return [];
  }

  /**
   * Extract figures from extract_figures tool result
   */
  static extractFiguresFromResult(result: any): Graph[] {
    const parsed = this.parseToolResult(result);

    // Check if it's an array of figures
    if (Array.isArray(parsed)) {
      return parsed
        .filter((item) => item.url) // Filter out invalid entries
        .map((item) => this.transformFigure(item as BackendFigure));
    }

    // Check if it's wrapped in a figures field
    if (parsed.figures && Array.isArray(parsed.figures)) {
      return parsed.figures
        .filter((item: any) => item.url)
        .map((item: any) => this.transformFigure(item as BackendFigure));
    }

    return [];
  }

  /**
   * Extract graph data from extract_graph_data tool result
   */
  static extractGraphDataFromResult(
    result: any
  ): Array<{ x: number; y: number }> {
    const parsed = this.parseToolResult(result);

    // Direct BackendGraphData format
    if (parsed.data_points && Array.isArray(parsed.data_points)) {
      return this.transformGraphData(parsed as BackendGraphData);
    }

    // Check if data is in a nested field
    if (parsed.data && Array.isArray(parsed.data)) {
      return parsed.data;
    }

    return [];
  }

  /**
   * Check if response contains an error
   */
  static isErrorResponse(response: any): boolean {
    return !response.success || response.error !== undefined;
  }

  /**
   * Extract error message from response
   */
  static getErrorMessage(response: any): string {
    if (typeof response.error === "string") {
      return response.error;
    }

    if (response.error?.message) {
      return response.error.message;
    }

    if (response.errorCode?.message) {
      return response.errorCode.message;
    }

    return "Erro desconhecido ao processar requisição";
  }

  /**
   * Check if error is retryable
   */
  static isRetryableError(response: any): boolean {
    // Check error code retryable flag
    if (response.errorCode?.retryable === true) {
      return true;
    }

    // Check for specific error codes
    const errorString = JSON.stringify(response).toLowerCase();
    if (
      errorString.includes("gemini_overloaded") ||
      errorString.includes("gemini_unavailable") ||
      errorString.includes("rate_limit")
    ) {
      return true;
    }

    return false;
  }

  /**
   * Get retry delay from error response (in milliseconds)
   */
  static getRetryDelay(response: any): number {
    if (response.errorCode?.retryAfter) {
      return response.errorCode.retryAfter * 1000; // Convert to ms
    }

    // Default retry delays based on error type
    const errorString = JSON.stringify(response).toLowerCase();
    if (errorString.includes("rate_limit")) {
      return 60000; // 1 minute
    }
    if (errorString.includes("overloaded")) {
      return 10000; // 10 seconds
    }
    if (errorString.includes("unavailable")) {
      return 30000; // 30 seconds
    }

    return 5000; // Default 5 seconds
  }
}
