import { useState, useCallback, useRef } from 'react';

interface AgentState {
  isActive: boolean;
  currentTask: string;
  status: 'idle' | 'processing' | 'completed' | 'error';
  agents: {
    reasoner: { active: boolean; status: string; progress?: number };
    coder: { active: boolean; status: string; progress?: number };
    refiner: { active: boolean; status: string; progress?: number };
  };
}

interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost_estimate?: number;
}

interface AIResponse {
  content: string;
  windowType: string;
  caption: string;
  metadata?: Record<string, any>;
  instruction?: string;
  transformation?: string;
  dataType?: string;
}

interface AIResponseMetadata extends AIResponse {
  tokenUsage?: TokenUsage;
}

interface ModelInfo {
  id: string;
  name: string;
  icon: string;
  description: string;
  costPerToken: number;
  maxTokens: number;
  capabilities: string[];
}

interface AIModels {
  fast: ModelInfo;
  reasoning: ModelInfo;
  premium: ModelInfo;
  super: ModelInfo;
  vision: ModelInfo;
  local: ModelInfo;
}

export const µ6_useAIAgent = (
  liteLLMClient?: any,
  contextItems: any[] = [],
  onError?: (error: string) => void
) => {
  const [agentState, setAgentState] = useState<AgentState>({
    isActive: false,
    currentTask: '',
    status: 'idle',
    agents: {
      reasoner: { active: false, status: 'idle', progress: 0 },
      coder: { active: false, status: 'idle', progress: 0 },
      refiner: { active: false, status: 'idle', progress: 0 }
    }
  });

  const [selectedModel, setSelectedModel] = useState<string>('reasoning');
  const [aiMode, setAiMode] = useState<'chat' | 'tui' | 'code'>('chat');
  const [tokenUsage, setTokenUsage] = useState<TokenUsage | null>(null);
  const [responseHistory, setResponseHistory] = useState<AIResponseMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Model configurations
  const models: AIModels = {
    fast: {
      id: 'fast',
      name: 'Fast Model',
      icon: '⚡',
      description: 'Quick responses for simple tasks',
      costPerToken: 0.000001,
      maxTokens: 4000,
      capabilities: ['chat', 'simple-tasks']
    },
    reasoning: {
      id: 'reasoning',
      name: 'Reasoning Model', 
      icon: '🧠',
      description: 'Complex thinking and analysis',
      costPerToken: 0.00001,
      maxTokens: 100000,
      capabilities: ['reasoning', 'analysis', 'complex-tasks']
    },
    premium: {
      id: 'premium',
      name: 'Premium Model',
      icon: '💎',
      description: 'High-quality responses',
      costPerToken: 0.00003,
      maxTokens: 200000,
      capabilities: ['premium', 'creative', 'detailed']
    },
    super: {
      id: 'super',
      name: 'Super Model',
      icon: '🚀',
      description: 'Highest quality for critical tasks',
      costPerToken: 0.0001,
      maxTokens: 500000,
      capabilities: ['super', 'critical', 'expert']
    },
    vision: {
      id: 'vision',
      name: 'Vision Model',
      icon: '👁️',
      description: 'Image and visual analysis',
      costPerToken: 0.00005,
      maxTokens: 50000,
      capabilities: ['vision', 'image-analysis', 'tui-analysis']
    },
    local: {
      id: 'local',
      name: 'Local Model',
      icon: '💻',
      description: 'Offline processing',
      costPerToken: 0,
      maxTokens: 8000,
      capabilities: ['local', 'offline', 'privacy']
    }
  };

  // Get recommended model for specific task
  const getRecommendedModel = useCallback((task: 'reasoning' | 'coding' | 'creative' | 'vision' | 'fast'): string => {
    const recommendations = {
      reasoning: 'reasoning',
      coding: 'premium',
      creative: 'super',
      vision: 'vision',
      fast: 'fast'
    };
    return recommendations[task] || 'reasoning';
  }, []);

  // Estimate cost for request
  const estimateCost = useCallback((prompt: string, model: string): number => {
    const modelInfo = models[model as keyof AIModels];
    if (!modelInfo) return 0;

    const estimatedTokens = Math.ceil(prompt.length / 4); // Rough estimation
    return estimatedTokens * modelInfo.costPerToken;
  }, [models]);

  // Build context prompt from active items
  const buildContextPrompt = useCallback((userPrompt: string): string => {
    if (contextItems.length === 0) return userPrompt;

    let contextPrompt = '=== CONTEXT ===\n';
    contextItems.forEach(item => {
      contextPrompt += `[${item.type}: ${item.title}]\n${item.content}\n\n`;
    });
    contextPrompt += '=== USER REQUEST ===\n';
    
    return contextPrompt + userPrompt;
  }, [contextItems]);

  // Simulate agent phase with progress
  const simulateAgentPhase = useCallback(async (
    agentType: 'reasoner' | 'coder' | 'refiner',
    duration: number = 1000,
    statusMessages: string[] = []
  ) => {
    const phases = statusMessages.length || 5;
    const phaseLength = duration / phases;

    for (let i = 0; i < phases; i++) {
      const progress = ((i + 1) / phases) * 100;
      const status = statusMessages[i] || `processing... ${Math.round(progress)}%`;

      setAgentState(prev => ({
        ...prev,
        agents: {
          ...prev.agents,
          [agentType]: {
            active: true,
            status,
            progress
          }
        }
      }));

      await new Promise(resolve => setTimeout(resolve, phaseLength));
    }

    // Complete phase
    setAgentState(prev => ({
      ...prev,
      agents: {
        ...prev.agents,
        [agentType]: {
          active: false,
          status: 'completed',
          progress: 100
        }
      }
    }));
  }, []);

  // Process AI request with three-phase workflow
  const processAIRequest = useCallback(async (prompt: string): Promise<AIResponseMetadata | null> => {
    if (!prompt.trim()) return null;

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);
    setAgentState(prev => ({ 
      ...prev, 
      isActive: true,
      status: 'processing', 
      currentTask: prompt.substring(0, 50) + '...'
    }));

    try {
      const fullPrompt = buildContextPrompt(prompt);
      const estimatedCost = estimateCost(fullPrompt, selectedModel);

      if (import.meta.env.DEV) {
        console.log('🤖 AI Request Started:', {
          model: selectedModel,
          mode: aiMode,
          contextItems: contextItems.length,
          estimatedCost: `$${estimatedCost.toFixed(6)}`
        });
      }

      // Phase 1: Reasoner
      await simulateAgentPhase('reasoner', 800, [
        'analyzing request...',
        'understanding context...',
        'planning approach...',
        'reasoning complete'
      ]);

      // Phase 2: Coder
      await simulateAgentPhase('coder', 1200, [
        'generating content...',
        'structuring response...',
        'optimizing output...',
        'formatting result...',
        'coding complete'
      ]);

      // Actual AI API call (mock for now)
      let aiResponse: AIResponseMetadata;
      
      if (liteLLMClient) {
        // Use real LiteLLM client
        switch (aiMode) {
          case 'tui':
            aiResponse = await liteLLMClient.generateTUIWithMetadata(fullPrompt, {
              width: 80,
              height: 25,
              theme: 'green',
              model: models[selectedModel as keyof AIModels]?.name
            });
            break;
          case 'code':
            aiResponse = await liteLLMClient.generateCodeWithMetadata(fullPrompt, {
              language: 'typescript',
              model: models[selectedModel as keyof AIModels]?.name
            });
            break;
          default:
            aiResponse = await liteLLMClient.chatWithMetadata(fullPrompt, {
              context: `Desktop with ${contextItems.length} items in context`,
              model: models[selectedModel as keyof AIModels]?.name
            });
            break;
        }
      } else {
        // Mock response for development
        aiResponse = {
          content: `Mock ${aiMode} response for: ${prompt}`,
          windowType: aiMode === 'tui' ? 'tui' : aiMode === 'code' ? 'code' : 'notizzettel',
          caption: `AI Generated ${aiMode}`,
          metadata: { aiGenerated: true, model: selectedModel },
          tokenUsage: {
            prompt_tokens: Math.ceil(fullPrompt.length / 4),
            completion_tokens: 150,
            total_tokens: Math.ceil(fullPrompt.length / 4) + 150,
            cost_estimate: estimatedCost
          }
        };
      }

      // Phase 3: Refiner
      await simulateAgentPhase('refiner', 600, [
        'reviewing output...',
        'quality checking...',
        'finalizing response...'
      ]);

      // Update token usage
      if (aiResponse.tokenUsage) {
        setTokenUsage(aiResponse.tokenUsage);
      }

      // Add to response history
      setResponseHistory(prev => [...prev.slice(-20), aiResponse]); // Keep last 20 responses

      setAgentState(prev => ({
        ...prev,
        status: 'completed'
      }));

      setTimeout(() => {
        setAgentState(prev => ({ ...prev, status: 'idle', isActive: false }));
      }, 1000);

      if (import.meta.env.DEV) {
        console.log('✅ AI Request Completed:', {
          windowType: aiResponse.windowType,
          tokens: aiResponse.tokenUsage?.total_tokens,
          cost: `$${aiResponse.tokenUsage?.cost_estimate?.toFixed(6)}`
        });
      }

      return aiResponse;

    } catch (error: any) {
      const errorMessage = error.message || 'AI request failed';
      setError(errorMessage);
      setAgentState(prev => ({ ...prev, status: 'error' }));
      onError?.(errorMessage);

      if (import.meta.env.DEV) {
        console.error('❌ AI Request Failed:', error);
      }

      return null;
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [
    selectedModel, 
    aiMode, 
    contextItems,
    buildContextPrompt, 
    estimateCost, 
    simulateAgentPhase,
    liteLLMClient,
    onError
  ]);

  // Cancel current request
  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
      setAgentState(prev => ({ ...prev, status: 'idle', isActive: false }));
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Get usage statistics
  const getUsageStats = useCallback(() => {
    const totalTokens = responseHistory.reduce((sum, response) => 
      sum + (response.tokenUsage?.total_tokens || 0), 0
    );
    
    const totalCost = responseHistory.reduce((sum, response) => 
      sum + (response.tokenUsage?.cost_estimate || 0), 0
    );

    const modelUsage = responseHistory.reduce((acc, response) => {
      const model = response.metadata?.model || 'unknown';
      acc[model] = (acc[model] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalRequests: responseHistory.length,
      totalTokens,
      totalCost,
      modelUsage,
      averageTokensPerRequest: responseHistory.length > 0 ? totalTokens / responseHistory.length : 0
    };
  }, [responseHistory]);

  // Reset agent state
  const resetAgent = useCallback(() => {
    cancelRequest();
    setAgentState({
      isActive: false,
      currentTask: '',
      status: 'idle',
      agents: {
        reasoner: { active: false, status: 'idle', progress: 0 },
        coder: { active: false, status: 'idle', progress: 0 },
        refiner: { active: false, status: 'idle', progress: 0 }
      }
    });
    setError(null);
  }, [cancelRequest]);

  return {
    // State
    agentState,
    selectedModel,
    aiMode,
    tokenUsage,
    responseHistory,
    isLoading,
    error,
    models,

    // Actions
    processAIRequest,
    cancelRequest,
    clearError,
    resetAgent,

    // Settings
    setSelectedModel,
    setAiMode,

    // Utilities
    getRecommendedModel,
    estimateCost,
    getUsageStats,
    buildContextPrompt
  };
};