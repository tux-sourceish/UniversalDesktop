// TypeScript interfaces and implementations for Archon multi-agent patterns
// Adapted for UniversalDesktop integration

import { EventEmitter } from 'events';

// =============================================================================
// Core Agent Interfaces
// =============================================================================

export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant' | 'tool' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface AgentState {
  latestUserMessage: string;
  messages: AgentMessage[];
  scope: string;
  advisorOutput: string;
  fileList: string[];
  refinedPrompt: string;
  refinedTools: string;
  refinedAgent: string;
  desktopContext?: DesktopContext;
}

export interface DesktopContext {
  systemInfo: SystemInfo;
  activeWindows: WindowInfo[];
  fileSystemState: FileSystemState;
  runningProcesses: ProcessInfo[];
  userPreferences: UserPreferences;
}

export interface SystemInfo {
  platform: string;
  architecture: string;
  totalMemory: number;
  availableMemory: number;
  cpuUsage: number;
  osVersion: string;
}

export interface WindowInfo {
  id: string;
  title: string;
  application: string;
  bounds: { x: number; y: number; width: number; height: number };
  isActive: boolean;
  isMinimized: boolean;
}

export interface FileSystemState {
  workingDirectory: string;
  recentFiles: string[];
  watchedPaths: string[];
  permissions: Record<string, string[]>;
}

export interface ProcessInfo {
  pid: number;
  name: string;
  cpuUsage: number;
  memoryUsage: number;
  startTime: Date;
  status: 'running' | 'stopped' | 'sleeping';
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  shortcuts: Record<string, string>;
  automationLevel: 'basic' | 'intermediate' | 'advanced';
}

// =============================================================================
// Agent Dependencies and Tools
// =============================================================================

export interface AgentDependencies {
  ragService: RAGService;
  desktopService: DesktopService;
  eventBus: EventEmitter;
  configService: ConfigService;
  messageHistory: AgentMessage[];
}

export interface AgentTool {
  name: string;
  description: string;
  parameters: Record<string, any>;
  execute(args: any, dependencies: AgentDependencies): Promise<any>;
}

export interface RAGService {
  getEmbedding(text: string): Promise<number[]>;
  retrieveRelevantDocumentation(query: string, matchCount?: number): Promise<string>;
  indexDocument(document: Document): Promise<void>;
  searchSimilar(query: string, filters?: Record<string, any>): Promise<DocumentChunk[]>;
}

export interface DesktopService {
  getSystemInfo(): Promise<SystemInfo>;
  getActiveWindows(): Promise<WindowInfo[]>;
  executeCommand(command: string, args?: string[]): Promise<CommandResult>;
  interactWithUI(action: UIAction): Promise<UIResult>;
  manageFiles(operation: FileOperation): Promise<FileResult>;
  monitorProcess(pid: number): Promise<ProcessInfo>;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  url?: string;
  metadata: Record<string, any>;
  chunks: DocumentChunk[];
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  content: string;
  chunkNumber: number;
  embedding: number[];
  metadata: Record<string, any>;
}

// =============================================================================
// Agent Base Classes
// =============================================================================

export abstract class BaseAgent {
  protected model: LLMModel;
  protected systemPrompt: string;
  protected dependencies: AgentDependencies;
  protected tools: Map<string, AgentTool>;
  protected eventBus: EventEmitter;

  constructor(
    model: LLMModel,
    systemPrompt: string,
    dependencies: AgentDependencies
  ) {
    this.model = model;
    this.systemPrompt = systemPrompt;
    this.dependencies = dependencies;
    this.tools = new Map();
    this.eventBus = dependencies.eventBus;
  }

  addTool(tool: AgentTool): void {
    this.tools.set(tool.name, tool);
  }

  async run(message: string, context?: any): Promise<AgentResult> {
    const fullContext = await this.buildContext(message, context);
    const response = await this.model.generate(fullContext);
    
    if (response.toolCalls) {
      const toolResults = await this.executeTools(response.toolCalls);
      return this.combineResults(response, toolResults);
    }
    
    return { 
      data: response.content, 
      messages: [response],
      context: fullContext 
    };
  }

  protected async buildContext(message: string, additionalContext?: any): Promise<AgentContext> {
    const ragResults = await this.dependencies.ragService.retrieveRelevantDocumentation(message);
    const desktopContext = await this.dependencies.desktopService.getSystemInfo();
    
    return {
      message,
      systemPrompt: this.systemPrompt,
      messageHistory: this.dependencies.messageHistory,
      ragResults,
      desktopContext,
      additionalContext,
      availableTools: Array.from(this.tools.keys())
    };
  }

  protected async executeTools(toolCalls: ToolCall[]): Promise<ToolResult[]> {
    const results: ToolResult[] = [];
    
    for (const toolCall of toolCalls) {
      const tool = this.tools.get(toolCall.name);
      if (!tool) {
        results.push({
          toolName: toolCall.name,
          success: false,
          error: `Tool not found: ${toolCall.name}`
        });
        continue;
      }
      
      try {
        const result = await tool.execute(toolCall.args, this.dependencies);
        results.push({
          toolName: toolCall.name,
          success: true,
          result
        });
      } catch (error) {
        results.push({
          toolName: toolCall.name,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }

  protected combineResults(response: LLMResponse, toolResults: ToolResult[]): AgentResult {
    return {
      data: response.content,
      messages: [response],
      toolResults,
      context: response.context
    };
  }
}

// =============================================================================
// Specialized Desktop Agents
// =============================================================================

export class DesktopWorkflowAgent extends BaseAgent {
  constructor(dependencies: AgentDependencies) {
    super(
      dependencies.configService.getModel(),
      `You are a desktop workflow automation expert specializing in understanding user intent 
       and creating efficient desktop automation workflows. You have access to system commands,
       file operations, UI interactions, and desktop APIs.`,
      dependencies
    );
    
    this.addTool(new SystemCommandTool());
    this.addTool(new FileManagementTool());
    this.addTool(new UIInteractionTool());
    this.addTool(new DesktopAPITool());
  }
}

export class SystemAnalysisAgent extends BaseAgent {
  constructor(dependencies: AgentDependencies) {
    super(
      dependencies.configService.getModel(),
      `You are a system analysis specialist that monitors system resources, processes,
       and performance. You can diagnose issues, suggest optimizations, and provide
       insights about system behavior.`,
      dependencies
    );
    
    this.addTool(new SystemMonitorTool());
    this.addTool(new ProcessManagementTool());
    this.addTool(new PerformanceAnalysisTool());
  }
}

export class UIAutomationAgent extends BaseAgent {
  constructor(dependencies: AgentDependencies) {
    super(
      dependencies.configService.getModel(),
      `You are a UI automation specialist that can interact with desktop applications,
       windows, and UI elements. You understand accessibility patterns and can perform
       complex UI interactions.`,
      dependencies
    );
    
    this.addTool(new WindowManagementTool());
    this.addTool(new ElementInteractionTool());
    this.addTool(new AccessibilityTool());
  }
}

export class FileSystemAgent extends BaseAgent {
  constructor(dependencies: AgentDependencies) {
    super(
      dependencies.configService.getModel(),
      `You are a file system specialist that can manage files, directories, and
       file operations efficiently. You understand file permissions, metadata,
       and can organize file systems effectively.`,
      dependencies
    );
    
    this.addTool(new FileOperationsTool());
    this.addTool(new DirectoryManagementTool());
    this.addTool(new FileSearchTool());
    this.addTool(new FileWatcherTool());
  }
}

// =============================================================================
// Agent Graph Workflow
// =============================================================================

export interface AgentNode {
  name: string;
  agent: BaseAgent;
  handler: AgentNodeHandler;
}

export type AgentNodeHandler = (state: AgentState) => Promise<Partial<AgentState>>;

export interface AgentEdge {
  from: string;
  to: string | string[];
  condition?: (state: AgentState) => string | string[];
}

export class AgentGraph {
  private state: AgentState;
  private nodes: Map<string, AgentNode>;
  private edges: Map<string, AgentEdge>;
  private eventBus: EventEmitter;
  private isRunning: boolean = false;

  constructor(eventBus: EventEmitter) {
    this.state = this.initializeState();
    this.nodes = new Map();
    this.edges = new Map();
    this.eventBus = eventBus;
  }

  private initializeState(): AgentState {
    return {
      latestUserMessage: '',
      messages: [],
      scope: '',
      advisorOutput: '',
      fileList: [],
      refinedPrompt: '',
      refinedTools: '',
      refinedAgent: '',
      desktopContext: undefined
    };
  }

  addNode(name: string, agent: BaseAgent, handler: AgentNodeHandler): void {
    this.nodes.set(name, { name, agent, handler });
  }

  addEdge(from: string, to: string | string[], condition?: (state: AgentState) => string | string[]): void {
    this.edges.set(from, { from, to, condition });
  }

  async execute(initialMessage: string): Promise<AgentState> {
    this.state.latestUserMessage = initialMessage;
    this.isRunning = true;
    
    let currentNode = "analyze_desktop_context";
    
    while (currentNode !== "END" && this.isRunning) {
      const node = this.nodes.get(currentNode);
      if (!node) {
        console.warn(`Node not found: ${currentNode}`);
        break;
      }
      
      this.eventBus.emit('agent-node-start', { node: currentNode, state: this.state });
      
      try {
        const result = await node.handler(this.state);
        this.state = { ...this.state, ...result };
        
        this.eventBus.emit('agent-node-complete', { node: currentNode, result, state: this.state });
        
        currentNode = await this.getNextNode(currentNode);
      } catch (error) {
        this.eventBus.emit('agent-node-error', { node: currentNode, error, state: this.state });
        break;
      }
    }
    
    this.isRunning = false;
    return this.state;
  }

  private async getNextNode(currentNode: string): Promise<string> {
    const edge = this.edges.get(currentNode);
    if (!edge) return "END";
    
    if (edge.condition) {
      const next = edge.condition(this.state);
      return Array.isArray(next) ? next[0] : next;
    }
    
    return Array.isArray(edge.to) ? edge.to[0] : edge.to;
  }

  stop(): void {
    this.isRunning = false;
  }

  getState(): AgentState {
    return { ...this.state };
  }
}

// =============================================================================
// Desktop-Specific Agent Tools
// =============================================================================

export class SystemCommandTool implements AgentTool {
  name = "execute_system_command";
  description = "Execute system commands with proper error handling and security";
  parameters = {
    command: { type: "string", description: "The command to execute" },
    args: { type: "array", description: "Command arguments", items: { type: "string" } },
    timeout: { type: "number", description: "Timeout in milliseconds", default: 30000 }
  };

  async execute(args: any, dependencies: AgentDependencies): Promise<CommandResult> {
    const { command, args: cmdArgs = [], timeout = 30000 } = args;
    
    return await dependencies.desktopService.executeCommand(command, cmdArgs);
  }
}

export class FileManagementTool implements AgentTool {
  name = "manage_files";
  description = "Perform file operations like create, read, update, delete, move, copy";
  parameters = {
    operation: { type: "string", enum: ["create", "read", "update", "delete", "move", "copy"] },
    source: { type: "string", description: "Source file/directory path" },
    destination: { type: "string", description: "Destination path (for move/copy)" },
    content: { type: "string", description: "Content for create/update operations" }
  };

  async execute(args: any, dependencies: AgentDependencies): Promise<FileResult> {
    const operation: FileOperation = {
      type: args.operation,
      source: args.source,
      destination: args.destination,
      content: args.content
    };
    
    return await dependencies.desktopService.manageFiles(operation);
  }
}

export class UIInteractionTool implements AgentTool {
  name = "interact_with_ui";
  description = "Interact with desktop UI elements, windows, and applications";
  parameters = {
    action: { type: "string", enum: ["click", "type", "key", "scroll", "drag", "focus"] },
    target: { type: "object", description: "Target element or window selector" },
    value: { type: "string", description: "Value for type/key actions" }
  };

  async execute(args: any, dependencies: AgentDependencies): Promise<UIResult> {
    const action: UIAction = {
      type: args.action,
      target: args.target,
      value: args.value
    };
    
    return await dependencies.desktopService.interactWithUI(action);
  }
}

export class DesktopAPITool implements AgentTool {
  name = "access_desktop_apis";
  description = "Access desktop APIs for system integration and automation";
  parameters = {
    api: { type: "string", description: "API endpoint or service name" },
    method: { type: "string", enum: ["GET", "POST", "PUT", "DELETE"] },
    params: { type: "object", description: "API parameters" }
  };

  async execute(args: any, dependencies: AgentDependencies): Promise<any> {
    // Implementation depends on specific desktop APIs available
    // This is a placeholder for desktop-specific API access
    return { success: true, data: "Desktop API access result" };
  }
}

// =============================================================================
// Supporting Interfaces
// =============================================================================

export interface LLMModel {
  generate(context: AgentContext): Promise<LLMResponse>;
}

export interface LLMResponse {
  content: string;
  toolCalls?: ToolCall[];
  context?: any;
}

export interface ToolCall {
  name: string;
  args: any;
}

export interface AgentContext {
  message: string;
  systemPrompt: string;
  messageHistory: AgentMessage[];
  ragResults: string;
  desktopContext: any;
  additionalContext?: any;
  availableTools: string[];
}

export interface AgentResult {
  data: string;
  messages: AgentMessage[];
  toolResults?: ToolResult[];
  context?: any;
}

export interface ToolResult {
  toolName: string;
  success: boolean;
  result?: any;
  error?: string;
}

export interface CommandResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
  duration: number;
}

export interface FileOperation {
  type: 'create' | 'read' | 'update' | 'delete' | 'move' | 'copy';
  source: string;
  destination?: string;
  content?: string;
}

export interface FileResult {
  success: boolean;
  path: string;
  content?: string;
  error?: string;
  metadata?: Record<string, any>;
}

export interface UIAction {
  type: 'click' | 'type' | 'key' | 'scroll' | 'drag' | 'focus';
  target: any;
  value?: string;
}

export interface UIResult {
  success: boolean;
  element?: any;
  screenshot?: string;
  error?: string;
}

export interface ConfigService {
  getModel(): LLMModel;
  get(key: string): any;
  set(key: string, value: any): void;
}

// =============================================================================
// Usage Example
// =============================================================================

export class DesktopAgentSystem {
  private graph: AgentGraph;
  private eventBus: EventEmitter;
  private dependencies: AgentDependencies;

  constructor(dependencies: AgentDependencies) {
    this.dependencies = dependencies;
    this.eventBus = dependencies.eventBus;
    this.graph = new AgentGraph(this.eventBus);
    
    this.setupGraph();
    this.setupEventHandlers();
  }

  private setupGraph(): void {
    // Create specialized agents
    const workflowAgent = new DesktopWorkflowAgent(this.dependencies);
    const systemAgent = new SystemAnalysisAgent(this.dependencies);
    const uiAgent = new UIAutomationAgent(this.dependencies);
    const fileAgent = new FileSystemAgent(this.dependencies);

    // Add nodes to graph
    this.graph.addNode("analyze_desktop_context", systemAgent, this.analyzeDesktopContext.bind(this));
    this.graph.addNode("plan_workflow", workflowAgent, this.planWorkflow.bind(this));
    this.graph.addNode("execute_ui_actions", uiAgent, this.executeUIActions.bind(this));
    this.graph.addNode("manage_files", fileAgent, this.manageFiles.bind(this));
    this.graph.addNode("monitor_execution", systemAgent, this.monitorExecution.bind(this));

    // Define workflow edges
    this.graph.addEdge("analyze_desktop_context", "plan_workflow");
    this.graph.addEdge("plan_workflow", ["execute_ui_actions", "manage_files"], this.routeToExecution.bind(this));
    this.graph.addEdge("execute_ui_actions", "monitor_execution");
    this.graph.addEdge("manage_files", "monitor_execution");
  }

  private setupEventHandlers(): void {
    this.eventBus.on('agent-node-start', (data) => {
      console.log(`Starting agent node: ${data.node}`);
    });

    this.eventBus.on('agent-node-complete', (data) => {
      console.log(`Completed agent node: ${data.node}`);
    });

    this.eventBus.on('agent-node-error', (data) => {
      console.error(`Error in agent node ${data.node}:`, data.error);
    });
  }

  private async analyzeDesktopContext(state: AgentState): Promise<Partial<AgentState>> {
    const systemInfo = await this.dependencies.desktopService.getSystemInfo();
    const activeWindows = await this.dependencies.desktopService.getActiveWindows();
    
    const desktopContext: DesktopContext = {
      systemInfo,
      activeWindows,
      fileSystemState: {
        workingDirectory: process.cwd(),
        recentFiles: [],
        watchedPaths: [],
        permissions: {}
      },
      runningProcesses: [],
      userPreferences: {
        theme: 'system',
        language: 'en',
        shortcuts: {},
        automationLevel: 'intermediate'
      }
    };

    return { desktopContext };
  }

  private async planWorkflow(state: AgentState): Promise<Partial<AgentState>> {
    // Use workflow agent to plan the execution
    const workflowAgent = new DesktopWorkflowAgent(this.dependencies);
    const result = await workflowAgent.run(state.latestUserMessage, state.desktopContext);
    
    return { scope: result.data };
  }

  private async executeUIActions(state: AgentState): Promise<Partial<AgentState>> {
    // Execute UI-related actions
    const uiAgent = new UIAutomationAgent(this.dependencies);
    const result = await uiAgent.run(state.scope, state.desktopContext);
    
    return { messages: [...state.messages, ...result.messages] };
  }

  private async manageFiles(state: AgentState): Promise<Partial<AgentState>> {
    // Execute file management actions
    const fileAgent = new FileSystemAgent(this.dependencies);
    const result = await fileAgent.run(state.scope, state.desktopContext);
    
    return { messages: [...state.messages, ...result.messages] };
  }

  private async monitorExecution(state: AgentState): Promise<Partial<AgentState>> {
    // Monitor execution and provide feedback
    const systemAgent = new SystemAnalysisAgent(this.dependencies);
    const result = await systemAgent.run("Monitor and analyze execution", state.desktopContext);
    
    return { messages: [...state.messages, ...result.messages] };
  }

  private routeToExecution(state: AgentState): string[] {
    // Route based on the type of actions needed
    if (state.scope.includes('file') || state.scope.includes('directory')) {
      return ['manage_files'];
    }
    if (state.scope.includes('window') || state.scope.includes('click') || state.scope.includes('UI')) {
      return ['execute_ui_actions'];
    }
    return ['execute_ui_actions', 'manage_files'];
  }

  async processRequest(message: string): Promise<AgentState> {
    return await this.graph.execute(message);
  }
}