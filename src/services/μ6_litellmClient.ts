// LiteLLM Client Service for UniversalDesktop
// Handles connection and model management for local LiteLLM instance

export interface LiteLLMModel {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

export interface LiteLLMResponse {
  data: LiteLLMModel[];
  object: string;
}

export interface CompletionRequest {
  model: string;
  prompt: string;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  stream?: boolean;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  model: string;
  messages: ChatMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  stream?: boolean;
}

export interface ChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
    index: number;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface AIResponseMetadata {
  content: string;
  caption: string;        // Human-readable description
  instruction: string;    // System instruction for handling
  transformation: string; // UI transformation hints
  dataType: string;      // Explicit data type
  windowType: 'notizzettel' | 'tabelle' | 'code' | 'browser' | 'terminal' | 'tui' | 'media' | 'chart' | 'calendar';
  metadata: Record<string, any>; // Additional metadata for the window
  tokenUsage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface CompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    text: string;
    index: number;
    finish_reason: string;
    logprobs: any;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class LiteLLMClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    // Read configuration from environment variables
    this.baseUrl = import.meta.env.VITE_LITELLM_BASE_URL || 'http://localhost:4001';
    this.apiKey = import.meta.env.VITE_LITELLM_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('⚠️ VITE_LITELLM_API_KEY not set in environment variables');
    }
  }

  /**
   * Get all available models from LiteLLM instance
   */
  async getAvailableModels(): Promise<LiteLLMModel[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/v1/models?return_wildcard_routes=false&include_model_access_groups=false&only_model_access_groups=false`,
        {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'x-litellm-api-key': this.apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: LiteLLMResponse = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching models:', error);
      throw error;
    }
  }

  /**
   * Get models grouped by type (online/local)
   */
  async getModelsByType(): Promise<{
    online: LiteLLMModel[];
    local: LiteLLMModel[];
  }> {
    const models = await this.getAvailableModels();
    
    return {
      online: models.filter(model => 
        model.id.includes('online') || 
        model.id.includes('nexus-online') || 
        model.id.includes('kira-online')
      ),
      local: models.filter(model => 
        model.id.includes('local') || 
        model.id.includes('kira-local')
      )
    };
  }

  /**
   * Test connection to LiteLLM instance
   */
  async testConnection(): Promise<boolean> {
    try {
      const models = await this.getAvailableModels();
      return models.length > 0;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  /**
   * Send completion request to LiteLLM
   */
  async createCompletion(request: CompletionRequest): Promise<CompletionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating completion:', error);
      throw error;
    }
  }

  /**
   * Send chat request to LiteLLM
   */
  async createChatCompletion(request: ChatRequest): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating chat completion:', error);
      throw error;
    }
  }

  /**
   * Chat with AI - simplified interface
   */
  async chat(message: string, options: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
    systemPrompt?: string;
  } = {}): Promise<string> {
    const messages: ChatMessage[] = [];
    
    if (options.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }
    
    messages.push({ role: 'user', content: message });

    const request: ChatRequest = {
      model: options.model || this.getRecommendedModels().reasoning,
      messages,
      max_tokens: options.maxTokens || 1000,
      temperature: options.temperature || 0.7,
    };

    const response = await this.createChatCompletion(request);
    return response.choices[0]?.message?.content || '';
  }

  /**
   * Enhanced chat with metadata generation
   */
  async chatWithMetadata(message: string, options: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
    context?: string;
  } = {}): Promise<AIResponseMetadata> {
    const metadataPrompt = `Du bist ein intelligenter Content-Analyzer. Analysiere die folgende Benutzeranfrage und erstelle eine strukturierte Antwort mit Metadaten.

Benutzeranfrage: "${message}"
${options.context ? `Kontext: ${options.context}` : ''}

Erstelle eine JSON-Antwort mit folgender Struktur:
{
  "content": "Der eigentliche Inhalt/Antwort",
  "caption": "Kurze, menschenlesbare Beschreibung (max 50 Zeichen)",
  "instruction": "System-Anweisung für die Verarbeitung",
  "transformation": "UI-Transformations-Hinweise (kommagetrennt)",
  "dataType": "Expliziter Datentyp (z.B. 'code:python', 'table:csv', 'text:markdown')",
  "windowType": "Fenster-Typ für die Anzeige",
  "metadata": {}
}

Fenster-Typen: notizzettel, tabelle, code, browser, terminal, tui, media, chart, calendar
Transformation-Hints: syntax-highlight:LANGUAGE, show-run-button, show-export-button, editable, readonly, terminal-theme:THEME

Antworte nur mit gültigem JSON.`;

    const response = await this.createChatCompletion({
      model: options.model || this.getRecommendedModels().reasoning,
      messages: [
        { role: 'user', content: metadataPrompt }
      ],
      max_tokens: options.maxTokens || 1500,
      temperature: options.temperature || 0.3,
    });

    const jsonResponse = response.choices[0]?.message?.content || '';
    const tokenUsage = response.usage;

    try {
      // Extract JSON from response if wrapped in code blocks
      const cleanJson = jsonResponse.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return {
        content: parsed.content || '',
        caption: parsed.caption || 'AI Response',
        instruction: parsed.instruction || 'display',
        transformation: parsed.transformation || '',
        dataType: parsed.dataType || 'text:plain',
        windowType: parsed.windowType || 'notizzettel',
        metadata: parsed.metadata || {},
        tokenUsage: tokenUsage
      };
    } catch (error) {
      console.error('Failed to parse AI metadata response:', error);
      // Fallback: Create metadata from plain text
      const isCode = jsonResponse.includes('function') || jsonResponse.includes('class') || jsonResponse.includes('import');
      const isTUI = jsonResponse.includes('─') || jsonResponse.includes('│') || jsonResponse.includes('┌');
      
      return {
        content: jsonResponse,
        caption: isCode ? 'Generated Code' : isTUI ? 'Generated TUI' : 'AI Chat Response',
        instruction: 'display',
        transformation: isCode ? 'syntax-highlight' : isTUI ? 'terminal-theme:green' : '',
        dataType: isCode ? 'code:text' : isTUI ? 'tui:80x25' : 'text:plain',
        windowType: isCode ? 'code' : isTUI ? 'tui' : 'notizzettel',
        metadata: isTUI ? { tuiTheme: 'green', tuiWidth: 80, tuiHeight: 25 } : {},
        tokenUsage: tokenUsage
      };
    }
  }

  /**
   * Generate Terminal UI (TUI) content
   */
  async generateTUI(prompt: string, options: {
    model?: string;
    width?: number;
    height?: number;
  } = {}): Promise<string> {
    const width = options.width || 80;
    const height = options.height || 25;
    
    const systemPrompt = `Du bist ein Experte für Terminal User Interfaces (TUI).
Erstelle zeichenbasierte UIs mit Box-Drawing-Charakteren.
Nutze nur ASCII/CP437 Zeichen.
Ausgabe muss genau ${width} Zeichen breit und ${height} Zeilen hoch sein.
Box-Drawing: ─ │ ┌ ┐ └ ┘ ├ ┤ ┬ ┴ ┼ ═ ║ ╔ ╗ ╚ ╝
Fülle leere Bereiche mit Leerzeichen auf.
Antworte nur mit dem TUI-Content, keine Erklärungen.`;

    return await this.chat(prompt, {
      model: options.model || this.getRecommendedModels().vision,
      systemPrompt,
      maxTokens: 2000,
      temperature: 0.3,
    });
  }

  /**
   * Generate TUI with metadata
   */
  async generateTUIWithMetadata(prompt: string, options: {
    model?: string;
    width?: number;
    height?: number;
    theme?: string;
  } = {}): Promise<AIResponseMetadata> {
    const width = options.width || 80;
    const height = options.height || 25;
    const theme = options.theme || 'green';
    
    const response = await this.createChatCompletion({
      model: options.model || this.getRecommendedModels().vision,
      messages: [
        { 
          role: 'system', 
          content: `Du bist ein Experte für Terminal User Interfaces (TUI).
Erstelle zeichenbasierte UIs mit Box-Drawing-Charakteren.
Nutze nur ASCII/CP437 Zeichen.
Ausgabe muss genau ${width} Zeichen breit und ${height} Zeilen hoch sein.
Box-Drawing: ─ │ ┌ ┐ └ ┘ ├ ┤ ┬ ┴ ┼ ═ ║ ╔ ╗ ╚ ╝
Fülle leere Bereiche mit Leerzeichen auf.
Antworte nur mit dem TUI-Content, keine Erklärungen.`
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: 2000,
      temperature: 0.3,
    });

    const tuiContent = response.choices[0]?.message?.content || '';
    const tokenUsage = response.usage;
    
    return {
      content: tuiContent,
      caption: `TUI: ${prompt.substring(0, 30)}...`,
      instruction: 'display-terminal',
      transformation: `terminal-theme:${theme}, readonly, monospace`,
      dataType: `tui:${width}x${height}`,
      windowType: 'tui',
      metadata: {
        tuiWidth: width,
        tuiHeight: height,
        tuiTheme: theme,
        readOnly: true
      },
      tokenUsage: tokenUsage
    };
  }

  /**
   * Generate code content
   */
  async generateCode(prompt: string, options: {
    model?: string;
    language?: string;
    maxTokens?: number;
  } = {}): Promise<string> {
    const language = options.language || 'typescript';
    
    const systemPrompt = `Du bist ein Experte für ${language} Programmierung.
Erstelle sauberen, gut dokumentierten Code.
Folge Best Practices und moderne Konventionen.
Antworte nur mit Code, keine zusätzlichen Erklärungen.`;

    return await this.chat(prompt, {
      model: options.model || this.getRecommendedModels().reasoning,
      systemPrompt,
      maxTokens: options.maxTokens || 2000,
      temperature: 0.2,
    });
  }

  /**
   * Generate code with metadata
   */
  async generateCodeWithMetadata(prompt: string, options: {
    model?: string;
    language?: string;
    maxTokens?: number;
  } = {}): Promise<AIResponseMetadata> {
    const language = options.language || 'typescript';
    
    const response = await this.createChatCompletion({
      model: options.model || this.getRecommendedModels().reasoning,
      messages: [
        { 
          role: 'system', 
          content: `Du bist ein Experte für ${language} Programmierung.
Erstelle sauberen, gut dokumentierten Code.
Folge Best Practices und moderne Konventionen.
Antworte nur mit Code, keine zusätzlichen Erklärungen.`
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: options.maxTokens || 2000,
      temperature: 0.2,
    });

    const codeContent = response.choices[0]?.message?.content || '';
    const tokenUsage = response.usage;
    
    // Determine transformations based on language
    const transformations = [`syntax-highlight:${language}`];
    
    if (['python', 'javascript', 'typescript', 'bash', 'sh'].includes(language)) {
      transformations.push('show-run-button');
    }
    
    if (['sql', 'json', 'csv'].includes(language)) {
      transformations.push('show-export-button');
    }
    
    return {
      content: codeContent,
      caption: `${language.toUpperCase()}: ${prompt.substring(0, 25)}...`,
      instruction: 'display-code',
      transformation: transformations.join(', '),
      dataType: `code:${language}`,
      windowType: 'code',
      metadata: {
        language,
        editable: true,
        executable: ['python', 'javascript', 'typescript', 'bash', 'sh'].includes(language)
      },
      tokenUsage: tokenUsage
    };
  }

  /**
   * Get recommended models for different use cases
   * Model preferences can be configured via environment variables or dynamically selected
   */
  getRecommendedModels(): Record<string, string> {
    return {
      // For fast responses and simple tasks
      'fast': import.meta.env.VITE_LITELLM_MODEL_FAST || 'kira-online/gemini-2.5-flash',
      // For complex reasoning and analysis
      'reasoning': import.meta.env.VITE_LITELLM_MODEL_REASONING || 'nexus-online/claude-sonnet-4',
      // For premium quality responses
      'premium': import.meta.env.VITE_LITELLM_MODEL_PREMIUM || 'kira-online/gemini-2.5-pro',
      // For super high-quality responses
      'super': import.meta.env.VITE_LITELLM_MODEL_SUPER || 'nexus-online/claude-opus-4',
      // For vision/image analysis
      'vision': import.meta.env.VITE_LITELLM_MODEL_VISION || 'kira-local/llava-vision',
      // For local/offline processing
      'local': import.meta.env.VITE_LITELLM_MODEL_LOCAL || 'kira-local/llama3.1-8b'
    };
  }

  /**
   * Get model categories with descriptions for UI
   */
  getModelCategories(): Record<string, { model: string; description: string; icon: string }> {
    const recommended = this.getRecommendedModels();
    return {
      'fast': {
        model: recommended.fast,
        description: 'Schnelle Antworten für einfache Aufgaben',
        icon: '⚡'
      },
      'reasoning': {
        model: recommended.reasoning,
        description: 'Komplexes Denken und Analyse',
        icon: '🧠'
      },
      'premium': {
        model: recommended.premium,
        description: 'Premium-Qualität für wichtige Aufgaben',
        icon: '💎'
      },
      'super': {
        model: recommended.super,
        description: 'Höchste Qualität für kritische Aufgaben',
        icon: '🚀'
      },
      'vision': {
        model: recommended.vision,
        description: 'Bild- und TUI-Analyse',
        icon: '👁️'
      },
      'local': {
        model: recommended.local,
        description: 'Lokale Verarbeitung ohne Internet',
        icon: '💻'
      }
    };
  }

  /**
   * Get current configuration
   */
  getConfig(): { baseUrl: string; hasApiKey: boolean } {
    return {
      baseUrl: this.baseUrl,
      hasApiKey: !!this.apiKey
    };
  }
}

// Export singleton instance
export const liteLLMClient = new LiteLLMClient();

// React Hook for LiteLLM
import { useState, useCallback } from 'react';

export interface UseLiteLLMState {
  isLoading: boolean;
  error: string | null;
  lastResponse: string | null;
}

export interface UseLiteLLMResult extends UseLiteLLMState {
  chat: (message: string, options?: Parameters<LiteLLMClient['chat']>[1]) => Promise<string>;
  chatWithMetadata: (message: string, options?: Parameters<LiteLLMClient['chatWithMetadata']>[1]) => Promise<AIResponseMetadata>;
  generateTUI: (prompt: string, options?: Parameters<LiteLLMClient['generateTUI']>[1]) => Promise<string>;
  generateTUIWithMetadata: (prompt: string, options?: Parameters<LiteLLMClient['generateTUIWithMetadata']>[1]) => Promise<AIResponseMetadata>;
  generateCode: (prompt: string, options?: Parameters<LiteLLMClient['generateCode']>[1]) => Promise<string>;
  generateCodeWithMetadata: (prompt: string, options?: Parameters<LiteLLMClient['generateCodeWithMetadata']>[1]) => Promise<AIResponseMetadata>;
  clearError: () => void;
  reset: () => void;
}

export function useLiteLLM(): UseLiteLLMResult {
  const [state, setState] = useState<UseLiteLLMState>({
    isLoading: false,
    error: null,
    lastResponse: null,
  });

  const updateState = useCallback((updates: Partial<UseLiteLLMState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const handleRequest = useCallback(async <T>(
    requestFn: () => Promise<T>,
    onSuccess?: (result: T) => void
  ): Promise<T> => {
    try {
      updateState({ isLoading: true, error: null });
      const result = await requestFn();
      updateState({ 
        isLoading: false, 
        lastResponse: typeof result === 'string' ? result : JSON.stringify(result) 
      });
      onSuccess?.(result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      updateState({ 
        isLoading: false, 
        error: errorMessage,
        lastResponse: null 
      });
      throw error;
    }
  }, [updateState]);

  const chat = useCallback(async (
    message: string, 
    options?: Parameters<LiteLLMClient['chat']>[1]
  ): Promise<string> => {
    return handleRequest(() => liteLLMClient.chat(message, options));
  }, [handleRequest]);

  const chatWithMetadata = useCallback(async (
    message: string, 
    options?: Parameters<LiteLLMClient['chatWithMetadata']>[1]
  ): Promise<AIResponseMetadata> => {
    return handleRequest(() => liteLLMClient.chatWithMetadata(message, options));
  }, [handleRequest]);

  const generateTUI = useCallback(async (
    prompt: string, 
    options?: Parameters<LiteLLMClient['generateTUI']>[1]
  ): Promise<string> => {
    return handleRequest(() => liteLLMClient.generateTUI(prompt, options));
  }, [handleRequest]);

  const generateTUIWithMetadata = useCallback(async (
    prompt: string, 
    options?: Parameters<LiteLLMClient['generateTUIWithMetadata']>[1]
  ): Promise<AIResponseMetadata> => {
    return handleRequest(() => liteLLMClient.generateTUIWithMetadata(prompt, options));
  }, [handleRequest]);

  const generateCode = useCallback(async (
    prompt: string, 
    options?: Parameters<LiteLLMClient['generateCode']>[1]
  ): Promise<string> => {
    return handleRequest(() => liteLLMClient.generateCode(prompt, options));
  }, [handleRequest]);

  const generateCodeWithMetadata = useCallback(async (
    prompt: string, 
    options?: Parameters<LiteLLMClient['generateCodeWithMetadata']>[1]
  ): Promise<AIResponseMetadata> => {
    return handleRequest(() => liteLLMClient.generateCodeWithMetadata(prompt, options));
  }, [handleRequest]);

  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      lastResponse: null,
    });
  }, []);

  return {
    ...state,
    chat,
    chatWithMetadata,
    generateTUI,
    generateTUIWithMetadata,
    generateCode,
    generateCodeWithMetadata,
    clearError,
    reset,
  };
}

// Utility functions
export async function checkModelAvailability(): Promise<void> {
  console.log('🔍 Checking LiteLLM model availability...');
  
  const config = liteLLMClient.getConfig();
  console.log('🔧 Configuration:', config);
  
  if (!config.hasApiKey) {
    throw new Error('LiteLLM API key not configured. Please set VITE_LITELLM_API_KEY environment variable.');
  }
  
  try {
    const models = await liteLLMClient.getAvailableModels();
    const modelsByType = await liteLLMClient.getModelsByType();
    
    console.log('📊 Available Models:', models.length);
    console.log('🌐 Online Models:', modelsByType.online.map(m => m.id));
    console.log('🖥️ Local Models:', modelsByType.local.map(m => m.id));
    
    // Test connection with a local model
    const recommendedModels = liteLLMClient.getRecommendedModels();
    const testModel = recommendedModels.vision;
    console.log(`🧪 Testing connection with ${testModel}...`);
    
    const testResponse = await liteLLMClient.createCompletion({
      model: testModel,
      prompt: 'Test connection',
      max_tokens: 10
    });
    
    console.log('✅ LiteLLM connection successful!');
    console.log('📝 Test response:', testResponse.choices[0].text);
    
  } catch (error) {
    console.error('❌ LiteLLM connection failed:', error);
    throw error;
  }
}
