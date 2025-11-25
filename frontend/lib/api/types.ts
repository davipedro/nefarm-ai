/**
 * Type definitions for API communication between frontend and backend
 */

// ============================================================================
// Backend Response Types (PMC MCP)
// ============================================================================

export interface BackendArticle {
  title: string;
  authors: string; // Comma-separated string
  year: string; // String representation
  pmcid: string;
  pmid: string;
  doi: string;
  url: string;
  license: string;
}

export interface BackendFigure {
  id: string;
  title: string;
  caption: string;
  url: string; // CDN URL
  local_path?: string; // Optional downloaded path
  width?: string;
  height?: string;
  alt_text?: string;
}

export interface BackendGraphData {
  metadata: {
    x_axis: {
      label: string;
      unit: string;
      min: number;
      max: number;
    };
    y_axis: {
      label: string;
      unit: string;
      min: number;
      max: number;
    };
  };
  data_points: Array<{ x: number; y: number }>;
  total_points: number;
}

// ============================================================================
// MCP Tool Response Types
// ============================================================================

export interface MCPToolContent {
  type: "text";
  text: string; // May contain JSON stringified data
}

export interface MCPToolResult {
  content: MCPToolContent[];
}

// ============================================================================
// Workflow Response Types
// ============================================================================

export interface WorkflowStep {
  step: number;
  tool: string;
  server: string;
  description: string;
  success: boolean;
  result?: any;
  error?: any;
}

export interface QueryResponse {
  success: boolean;
  query: string;
  workflow_id?: string;
  reasoning?: string;
  single_step?: boolean;
  result?: any;
  steps?: WorkflowStep[];
  final_result?: any;
  context?: any;
  timestamp?: string;
  error?: string;
  custom_workflow?: boolean;
}

export interface WorkflowResponse {
  success: boolean;
  workflow_id: string;
  custom_workflow: boolean;
  reasoning: string;
  steps: WorkflowStep[];
  final_result?: any;
  context?: any;
}

export interface ToolResponse {
  success: boolean;
  server_name: string;
  tool_name: string;
  timestamp: string;
  result?: any;
  errorCode?: ErrorCode;
  errorDetails?: any;
}

// ============================================================================
// Error Types
// ============================================================================

export interface ErrorCode {
  code: string;
  message: string;
  statusCode: number;
  retryable: boolean;
  retryAfter?: number;
}

export interface ApiError {
  error: ErrorCode;
  timestamp: string;
  context?: any;
}

// ============================================================================
// Health Check Types
// ============================================================================

export interface HealthResponse {
  status: "ok" | "error";
  timestamp: string;
  orchestrator: "connected" | "disconnected";
}

// ============================================================================
// Tools and Workflows List Types
// ============================================================================

export interface ToolInfo {
  serverName: string;
  name: string;
  description: string;
  inputSchema: any;
}

export interface ToolsResponse {
  tools: ToolInfo[];
  total: number;
}

export interface WorkflowInfo {
  id: string;
  name: string;
  description: string;
  use_cases: string[];
  base_steps: any[];
}

export interface WorkflowsResponse {
  workflows: WorkflowInfo[];
  total: number;
}
