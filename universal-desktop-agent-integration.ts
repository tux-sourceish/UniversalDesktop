// UniversalDesktop Agent Integration Example
// Demonstrates how to integrate Archon patterns into UniversalDesktop

import { EventEmitter } from 'events';
import { app, BrowserWindow, ipcMain, screen, globalShortcut } from 'electron';
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

// Import the Archon interfaces
import {
  AgentDependencies,
  AgentState,
  DesktopAgentSystem,
  DesktopService,
  RAGService,
  ConfigService,
  SystemInfo,
  WindowInfo,
  CommandResult,
  FileOperation,
  FileResult,
  UIAction,
  UIResult,
  AgentMessage
} from './archon-typescript-interfaces';

// =============================================================================
// UniversalDesktop-Specific Implementations
// =============================================================================

export class UniversalDesktopService implements DesktopService {
  private mainWindow: BrowserWindow | null = null;
  private eventBus: EventEmitter;

  constructor(mainWindow: BrowserWindow, eventBus: EventEmitter) {
    this.mainWindow = mainWindow;
    this.eventBus = eventBus;
    this.setupIPCHandlers();
  }

  private setupIPCHandlers(): void {
    // IPC handlers for desktop operations
    ipcMain.handle('agent-execute-command', async (_, command: string, args: string[]) => {
      return await this.executeCommand(command, args);
    });

    ipcMain.handle('agent-get-system-info', async () => {
      return await this.getSystemInfo();
    });

    ipcMain.handle('agent-get-active-windows', async () => {
      return await this.getActiveWindows();
    });

    ipcMain.handle('agent-manage-files', async (_, operation: FileOperation) => {
      return await this.manageFiles(operation);
    });

    ipcMain.handle('agent-interact-ui', async (_, action: UIAction) => {
      return await this.interactWithUI(action);
    });
  }

  async getSystemInfo(): Promise<SystemInfo> {
    const os = require('os');
    const { powerMonitor } = require('electron');
    
    return {
      platform: os.platform(),
      architecture: os.arch(),
      totalMemory: os.totalmem(),
      availableMemory: os.freemem(),
      cpuUsage: await this.getCPUUsage(),
      osVersion: os.release()
    };
  }

  async getActiveWindows(): Promise<WindowInfo[]> {
    const windows = BrowserWindow.getAllWindows();
    const displays = screen.getAllDisplays();
    
    return windows.map(window => ({
      id: window.id.toString(),
      title: window.getTitle(),
      application: 'UniversalDesktop',
      bounds: window.getBounds(),
      isActive: window.isFocused(),
      isMinimized: window.isMinimized()
    }));
  }

  async executeCommand(command: string, args: string[] = []): Promise<CommandResult> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const fullCommand = `${command} ${args.join(' ')}`;
      
      exec(fullCommand, { timeout: 30000 }, (error, stdout, stderr) => {
        const duration = Date.now() - startTime;
        
        if (error) {
          resolve({
            success: false,
            stdout: stdout || '',
            stderr: stderr || error.message,
            exitCode: error.code || 1,
            duration
          });
        } else {
          resolve({
            success: true,
            stdout: stdout || '',
            stderr: stderr || '',
            exitCode: 0,
            duration
          });
        }
      });
    });
  }

  async manageFiles(operation: FileOperation): Promise<FileResult> {
    try {
      switch (operation.type) {
        case 'create':
          await fs.writeFile(operation.source, operation.content || '');
          return { success: true, path: operation.source };
          
        case 'read':
          const content = await fs.readFile(operation.source, 'utf-8');
          return { success: true, path: operation.source, content };
          
        case 'update':
          await fs.writeFile(operation.source, operation.content || '');
          return { success: true, path: operation.source };
          
        case 'delete':
          await fs.unlink(operation.source);
          return { success: true, path: operation.source };
          
        case 'move':
          if (!operation.destination) throw new Error('Destination required for move');
          await fs.rename(operation.source, operation.destination);
          return { success: true, path: operation.destination };
          
        case 'copy':
          if (!operation.destination) throw new Error('Destination required for copy');
          await fs.copyFile(operation.source, operation.destination);
          return { success: true, path: operation.destination };
          
        default:
          throw new Error(`Unsupported operation: ${operation.type}`);
      }
    } catch (error) {
      return {
        success: false,
        path: operation.source,
        error: error.message
      };
    }
  }

  async interactWithUI(action: UIAction): Promise<UIResult> {
    try {
      switch (action.type) {
        case 'focus':
          if (this.mainWindow) {
            this.mainWindow.focus();
            return { success: true };
          }
          break;
          
        case 'click':
          // Send click event to renderer process
          if (this.mainWindow) {
            this.mainWindow.webContents.send('ui-action', action);
            return { success: true };
          }
          break;
          
        case 'type':
          // Send keyboard input to renderer process
          if (this.mainWindow) {
            this.mainWindow.webContents.send('ui-action', action);
            return { success: true };
          }
          break;
          
        case 'key':
          // Send keyboard shortcut
          if (this.mainWindow) {
            this.mainWindow.webContents.send('ui-action', action);
            return { success: true };
          }
          break;
          
        default:
          throw new Error(`Unsupported UI action: ${action.type}`);
      }
      
      return { success: false, error: 'Main window not available' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async monitorProcess(pid: number): Promise<any> {
    // Implementation for process monitoring
    return { pid, status: 'running' };
  }

  private async getCPUUsage(): Promise<number> {
    return new Promise((resolve) => {
      const os = require('os');
      const cpus = os.cpus();
      
      let totalIdle = 0;
      let totalTick = 0;
      
      cpus.forEach(cpu => {
        for (const type in cpu.times) {
          totalTick += cpu.times[type];
        }
        totalIdle += cpu.times.idle;
      });
      
      const idle = totalIdle / cpus.length;
      const total = totalTick / cpus.length;
      const usage = 100 - ~~(100 * idle / total);
      
      resolve(usage);
    });
  }
}

// =============================================================================
// UniversalDesktop RAG Service Implementation
// =============================================================================

export class UniversalDesktopRAGService implements RAGService {
  private vectorStore: Map<string, { embedding: number[], content: string, metadata: any }>;
  private openaiClient: any; // Replace with actual OpenAI client
  private embeddingModel: string = 'text-embedding-3-small';

  constructor(openaiClient: any) {
    this.openaiClient = openaiClient;
    this.vectorStore = new Map();
    this.initializeDesktopKnowledge();
  }

  private async initializeDesktopKnowledge(): Promise<void> {
    // Index UniversalDesktop-specific documentation
    const desktopDocs = [
      {
        id: 'desktop-automation',
        content: 'UniversalDesktop provides comprehensive desktop automation capabilities including window management, file operations, system monitoring, and UI interaction.',
        metadata: { category: 'automation', priority: 'high' }
      },
      {
        id: 'system-integration',
        content: 'System integration features allow agents to interact with the operating system, execute commands, manage processes, and access system APIs.',
        metadata: { category: 'system', priority: 'high' }
      },
      {
        id: 'ui-automation',
        content: 'UI automation enables agents to interact with desktop applications, click elements, type text, and navigate user interfaces programmatically.',
        metadata: { category: 'ui', priority: 'medium' }
      },
      {
        id: 'file-management',
        content: 'File management capabilities include creating, reading, updating, deleting, moving, and copying files and directories with proper permission handling.',
        metadata: { category: 'files', priority: 'high' }
      }
    ];

    for (const doc of desktopDocs) {
      await this.indexDocument({
        id: doc.id,
        title: doc.id,
        content: doc.content,
        metadata: doc.metadata,
        chunks: []
      });
    }
  }

  async getEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openaiClient.embeddings.create({
        model: this.embeddingModel,
        input: text
      });
      return response.data[0].embedding;
    } catch (error) {
      console.error('Error getting embedding:', error);
      return new Array(1536).fill(0); // Return zero vector on error
    }
  }

  async retrieveRelevantDocumentation(query: string, matchCount: number = 4): Promise<string> {
    try {
      const queryEmbedding = await this.getEmbedding(query);
      const similarities = new Map<string, number>();
      
      // Calculate similarities
      for (const [id, doc] of this.vectorStore) {
        const similarity = this.cosineSimilarity(queryEmbedding, doc.embedding);
        similarities.set(id, similarity);
      }
      
      // Sort by similarity and take top matches
      const sortedMatches = Array.from(similarities.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, matchCount);
      
      // Format results
      const results = sortedMatches.map(([id, similarity]) => {
        const doc = this.vectorStore.get(id);
        return `# ${id}\n\n${doc?.content}\n\n---\n`;
      });
      
      return results.join('\n');
    } catch (error) {
      console.error('Error retrieving documentation:', error);
      return 'Error retrieving documentation';
    }
  }

  async indexDocument(document: any): Promise<void> {
    const embedding = await this.getEmbedding(document.content);
    this.vectorStore.set(document.id, {
      embedding,
      content: document.content,
      metadata: document.metadata
    });
  }

  async searchSimilar(query: string, filters?: Record<string, any>): Promise<any[]> {
    const results = await this.retrieveRelevantDocumentation(query);
    return [{ content: results }];
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

// =============================================================================
// UniversalDesktop Configuration Service
// =============================================================================

export class UniversalDesktopConfigService implements ConfigService {
  private config: Map<string, any>;
  private configPath: string;

  constructor() {
    this.config = new Map();
    this.configPath = path.join(app.getPath('userData'), 'agent-config.json');
    this.loadConfig();
  }

  private async loadConfig(): Promise<void> {
    try {
      const data = await fs.readFile(this.configPath, 'utf-8');
      const config = JSON.parse(data);
      
      for (const [key, value] of Object.entries(config)) {
        this.config.set(key, value);
      }
    } catch (error) {
      // Config file doesn't exist, use defaults
      this.setDefaults();
    }
  }

  private setDefaults(): void {
    this.config.set('model', 'gpt-4');
    this.config.set('temperature', 0.7);
    this.config.set('maxTokens', 4000);
    this.config.set('timeout', 30000);
  }

  async saveConfig(): Promise<void> {
    const config = Object.fromEntries(this.config);
    await fs.writeFile(this.configPath, JSON.stringify(config, null, 2));
  }

  getModel(): any {
    // Return mock model for now - replace with actual LLM integration
    return {
      generate: async (context: any) => ({
        content: `Mock response for: ${context.message}`,
        toolCalls: []
      })
    };
  }

  get(key: string): any {
    return this.config.get(key);
  }

  set(key: string, value: any): void {
    this.config.set(key, value);
    this.saveConfig();
  }
}

// =============================================================================
// UniversalDesktop Agent Manager
// =============================================================================

export class UniversalDesktopAgentManager {
  private agentSystem: DesktopAgentSystem;
  private eventBus: EventEmitter;
  private dependencies: AgentDependencies;
  private mainWindow: BrowserWindow | null = null;

  constructor(mainWindow: BrowserWindow, openaiClient: any) {
    this.mainWindow = mainWindow;
    this.eventBus = new EventEmitter();
    
    // Initialize services
    const desktopService = new UniversalDesktopService(mainWindow, this.eventBus);
    const ragService = new UniversalDesktopRAGService(openaiClient);
    const configService = new UniversalDesktopConfigService();
    
    this.dependencies = {
      ragService,
      desktopService,
      eventBus: this.eventBus,
      configService,
      messageHistory: []
    };
    
    this.agentSystem = new DesktopAgentSystem(this.dependencies);
    this.setupEventHandlers();
    this.setupGlobalShortcuts();
  }

  private setupEventHandlers(): void {
    // Handle agent system events
    this.eventBus.on('agent-node-start', (data) => {
      this.sendToRenderer('agent-status', {
        type: 'node-start',
        node: data.node,
        timestamp: new Date().toISOString()
      });
    });

    this.eventBus.on('agent-node-complete', (data) => {
      this.sendToRenderer('agent-status', {
        type: 'node-complete',
        node: data.node,
        result: data.result,
        timestamp: new Date().toISOString()
      });
    });

    this.eventBus.on('agent-node-error', (data) => {
      this.sendToRenderer('agent-status', {
        type: 'node-error',
        node: data.node,
        error: data.error.message,
        timestamp: new Date().toISOString()
      });
    });

    // Handle IPC messages from renderer
    ipcMain.handle('agent-process-request', async (_, message: string) => {
      return await this.processRequest(message);
    });

    ipcMain.handle('agent-get-status', async () => {
      return this.getStatus();
    });

    ipcMain.handle('agent-stop', async () => {
      return this.stop();
    });
  }

  private setupGlobalShortcuts(): void {
    // Register global shortcuts for agent activation
    globalShortcut.register('CommandOrControl+Shift+A', () => {
      this.activateAgent();
    });

    globalShortcut.register('CommandOrControl+Shift+S', () => {
      this.showAgentStatus();
    });
  }

  private sendToRenderer(channel: string, data: any): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(channel, data);
    }
  }

  private activateAgent(): void {
    this.sendToRenderer('agent-activate', {
      timestamp: new Date().toISOString()
    });
  }

  private showAgentStatus(): void {
    this.sendToRenderer('agent-show-status', {
      timestamp: new Date().toISOString()
    });
  }

  async processRequest(message: string): Promise<AgentState> {
    try {
      // Add message to history
      const userMessage: AgentMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: message,
        timestamp: new Date()
      };
      
      this.dependencies.messageHistory.push(userMessage);
      
      // Process with agent system
      const result = await this.agentSystem.processRequest(message);
      
      // Add assistant response to history
      const assistantMessage: AgentMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.scope || 'Processing complete',
        timestamp: new Date()
      };
      
      this.dependencies.messageHistory.push(assistantMessage);
      
      return result;
    } catch (error) {
      console.error('Error processing agent request:', error);
      throw error;
    }
  }

  getStatus(): any {
    return {
      isRunning: true,
      messageHistory: this.dependencies.messageHistory,
      agentState: this.agentSystem ? 'active' : 'inactive',
      timestamp: new Date().toISOString()
    };
  }

  stop(): boolean {
    try {
      globalShortcut.unregisterAll();
      this.eventBus.removeAllListeners();
      return true;
    } catch (error) {
      console.error('Error stopping agent manager:', error);
      return false;
    }
  }
}

// =============================================================================
// Integration with UniversalDesktop Main Process
// =============================================================================

export function initializeAgentSystem(mainWindow: BrowserWindow): UniversalDesktopAgentManager {
  // This would typically initialize with actual OpenAI client
  const mockOpenAIClient = {
    embeddings: {
      create: async (params: any) => ({
        data: [{ embedding: new Array(1536).fill(0.1) }]
      })
    }
  };

  return new UniversalDesktopAgentManager(mainWindow, mockOpenAIClient);
}

// Usage in main UniversalDesktop process:
/*
import { initializeAgentSystem } from './universal-desktop-agent-integration';

// In your main process initialization
const agentManager = initializeAgentSystem(mainWindow);

// The agent system is now integrated and ready to use
// Users can activate agents with Ctrl+Shift+A
// Agent status can be viewed with Ctrl+Shift+S
// IPC handlers are set up for renderer communication
*/

// =============================================================================
// Renderer Process Integration Example
// =============================================================================

export const rendererIntegration = `
// In your renderer process (React/Vue/etc.)

import { ipcRenderer } from 'electron';

export class AgentInterface {
  private eventHandlers: Map<string, Function[]> = new Map();

  constructor() {
    this.setupIPCHandlers();
  }

  private setupIPCHandlers(): void {
    ipcRenderer.on('agent-status', (_, data) => {
      this.emit('status', data);
    });

    ipcRenderer.on('agent-activate', (_, data) => {
      this.emit('activate', data);
    });

    ipcRenderer.on('agent-show-status', (_, data) => {
      this.emit('show-status', data);
    });

    ipcRenderer.on('ui-action', (_, action) => {
      this.handleUIAction(action);
    });
  }

  async sendRequest(message: string): Promise<any> {
    return await ipcRenderer.invoke('agent-process-request', message);
  }

  async getStatus(): Promise<any> {
    return await ipcRenderer.invoke('agent-get-status');
  }

  async stop(): Promise<boolean> {
    return await ipcRenderer.invoke('agent-stop');
  }

  on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  private emit(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event) || [];
    handlers.forEach(handler => handler(data));
  }

  private handleUIAction(action: any): void {
    // Handle UI actions from agents
    switch (action.type) {
      case 'click':
        this.simulateClick(action.target);
        break;
      case 'type':
        this.simulateTyping(action.value);
        break;
      // Add more UI action handlers
    }
  }

  private simulateClick(target: any): void {
    // Implement click simulation
    const element = document.querySelector(target.selector);
    if (element) {
      element.click();
    }
  }

  private simulateTyping(text: string): void {
    // Implement typing simulation
    const activeElement = document.activeElement as HTMLInputElement;
    if (activeElement) {
      activeElement.value = text;
      activeElement.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
}

// Usage in React component:
export const AgentPanel: React.FC = () => {
  const [agentInterface] = useState(() => new AgentInterface());
  const [status, setStatus] = useState<any>(null);
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    agentInterface.on('status', (data) => {
      setStatus(data);
    });

    agentInterface.on('activate', () => {
      // Show agent activation UI
      setMessages(prev => [...prev, 'Agent activated']);
    });

    return () => {
      agentInterface.removeAllListeners();
    };
  }, []);

  const sendMessage = async (message: string) => {
    try {
      const result = await agentInterface.sendRequest(message);
      setMessages(prev => [...prev, \`User: \${message}\`, \`Agent: \${result.scope}\`]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="agent-panel">
      <div className="agent-status">
        Status: {status?.type || 'idle'}
      </div>
      
      <div className="agent-messages">
        {messages.map((msg, index) => (
          <div key={index} className="message">{msg}</div>
        ))}
      </div>
      
      <div className="agent-input">
        <input
          type="text"
          placeholder="Send message to agent..."
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              sendMessage(e.currentTarget.value);
              e.currentTarget.value = '';
            }
          }}
        />
      </div>
    </div>
  );
};
`;

export default UniversalDesktopAgentManager;