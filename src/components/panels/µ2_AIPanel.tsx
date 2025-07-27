import React, { useState, useCallback } from 'react';
import { UDFormat } from '../../core/UDFormat';
import { μ1_WindowFactory } from '../factories/μ1_WindowFactory';

/**
 * μ2_AIPanel - WIND (☴) Views/UI - KI-Assistent Panel
 * 
 * V1-Style AI Panel mit flexiblem Three-Phase Agent System.
 * Jetzt mit Checkboxen für individuelle Agent-Auswahl!
 */

interface μ2_AIPanelProps {
  position?: 'right' | 'left' | 'floating';
  width?: number;
  visible: boolean;
  onToggle: () => void;
  rightOffset?: number; // Für Panel-Kollisionsvermeidung
  /** Callback für μ1_WindowFactory UDItem Creation */
  onCreateUDItem?: (udItem: any) => void;
  /** Context Manager for AI-aware prompts */
  contextManager?: {
    getContextSummary: () => string;
    activeContextItems: any[];
  };
}

interface μ2_AgentState {
  isActive: boolean;
  currentTask: string;
  status: 'idle' | 'processing' | 'completed' | 'error';
  agents: {
    reasoner: { active: boolean; status: string };
    coder: { active: boolean; status: string };
    refiner: { active: boolean; status: string };
  };
}

interface μ2_AgentConfig {
  key: keyof μ2_AgentState['agents'];
  icon: string;
  name: string;
  description: string;
  bagua: number;
  enabled: boolean;
}

export const μ2_AIPanel: React.FC<μ2_AIPanelProps> = ({
  position = 'right',
  width = 320,
  visible,
  onToggle,
  rightOffset = 0,
  onCreateUDItem,
  contextManager
}) => {
  
  // μ2_ Agent State Management (WIND-Pattern: UI-State-Management) 
  const [μ2_agentState, setμ2_AgentState] = useState<μ2_AgentState>({
    isActive: false,
    currentTask: '',
    status: 'idle',
    agents: {
      reasoner: { active: false, status: 'idle' },
      coder: { active: false, status: 'idle' },
      refiner: { active: false, status: 'idle' }
    }
  });

  // μ2_ Agent Configuration mit Checkboxes (FLEXIBLER WORKFLOW!)
  const [μ2_agentConfigs, setμ2_AgentConfigs] = useState<μ2_AgentConfig[]>([
    {
      key: 'reasoner',
      icon: '🧠',
      name: 'Reasoner',
      description: 'Analysiert und plant',
      bagua: UDFormat.BAGUA.FEUER,
      enabled: true
    },
    {
      key: 'coder', 
      icon: '💻',
      name: 'Coder',
      description: 'Generiert Code/Content',
      bagua: UDFormat.BAGUA.HIMMEL,
      enabled: true
    },
    {
      key: 'refiner',
      icon: '✨', 
      name: 'Refiner',
      description: 'Optimiert und finalisiert',
      bagua: UDFormat.BAGUA.DONNER,
      enabled: true
    }
  ]);

  const [μ2_inputValue, setμ2_InputValue] = useState('');
  const [μ2_selectedModel, setμ2_SelectedModel] = useState('reasoning');

  // μ2_ Toggle Agent Checkbox
  const μ2_toggleAgent = useCallback((agentKey: keyof μ2_AgentState['agents']) => {
    setμ2_AgentConfigs(prev => prev.map(config => 
      config.key === agentKey 
        ? { ...config, enabled: !config.enabled }
        : config
    ));
  }, []);

  // μ2_ Get Enabled Agents (für flexiblen Workflow)
  const μ2_getEnabledAgents = useCallback((): μ2_AgentConfig[] => {
    return μ2_agentConfigs.filter(config => config.enabled);
  }, [μ2_agentConfigs]);

  // μ2_ Real LiteLLM API Integration
  const μ2_callLiteLLMAPI = useCallback(async (
    prompt: string, 
    enabledAgents: μ2_AgentConfig[], 
    model: string
  ): Promise<any> => {
    const baseUrl = import.meta.env.VITE_LITELLM_BASE_URL || 'http://localhost:4001';
    const apiKey = import.meta.env.VITE_LITELLM_API_KEY || 'test123';
    
    // Use the already-mapped model name passed from parent
    const selectedModel = model
    const agentContext = enabledAgents.length > 1 
      ? `\nUsing specialized agents: ${enabledAgents.map(a => `${a.name} (${a.description})`).join(', ')}\n`
      : '';

    try {
      console.log('🚀 μ2 LiteLLM API Call:', { 
        baseUrl, 
        model: selectedModel, 
        agents: enabledAgents.length,
        promptLength: prompt.length,
        hasContext: prompt.includes('μ6 CONTEXT'),
        contextItems: prompt.includes('μ6 CONTEXT') ? 
          prompt.match(/\[.*?\]/g)?.length || 0 : 0
      });

      const response = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            {
              role: 'user',
              content: `${agentContext}${prompt}`
            }
          ],
          max_tokens: 2000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`LiteLLM API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content || 'No response from AI';

      console.log('✅ μ2 LiteLLM Response received:', { 
        model: selectedModel,
        responseLength: aiResponse.length,
        usage: data.usage 
      });

      // Format response based on agents and model
      if (enabledAgents.some(a => a.key === 'coder') && (aiResponse.includes('```') || aiResponse.includes('function'))) {
        return { code: aiResponse };
      } else {
        return { text: aiResponse };
      }

    } catch (error) {
      console.error('❌ μ2 LiteLLM API Error:', error);
      
      // Fallback simulation with error info
      const agentNames = enabledAgents.map(a => a.name).join(' + ');
      return {
        text: `⚠️ **LiteLLM API Error**\n\n` +
              `**Model:** ${selectedModel}\n` +
              `**Agents:** ${agentNames}\n` +
              `**Error:** ${error instanceof Error ? error.message : 'Unknown error'}\n\n` +
              `**Original Request:** ${prompt}\n\n` +
              `**Fallback:** Please check:\n` +
              `1. LiteLLM server running at ${baseUrl}\n` +
              `2. API key configured: ${apiKey.substring(0, 10)}...\n` +
              `3. Model available: ${selectedModel}\n\n` +
              `*Time: ${new Date().toLocaleString('de-DE')}*`
      };
    }
  }, []);

  // μ2_ AI Request Processing (FLEXIBLER Three-Phase Workflow)
  const μ2_processAIRequest = useCallback(async (prompt: string) => {
    if (!prompt.trim()) return;

    const enabledAgents = μ2_getEnabledAgents();
    if (enabledAgents.length === 0) return;

    setμ2_AgentState(prev => ({ 
      ...prev, 
      status: 'processing', 
      currentTask: prompt,
      isActive: true 
    }));

    try {
      // Dynamischer Workflow basierend auf enabled Agents
      for (const [index, agentConfig] of enabledAgents.entries()) {
        const agentKey = agentConfig.key;
        
        // Agent aktivieren
        setμ2_AgentState(prev => ({
          ...prev,
          agents: { 
            ...prev.agents, 
            [agentKey]: { active: true, status: 'working' }
          }
        }));

        // Simuliere Agent-Arbeit (verschiedene Zeiten je Agent)
        const workTime = 
          agentKey === 'reasoner' ? 1000 :
          agentKey === 'coder' ? 1500 :
          agentKey === 'refiner' ? 800 : 1000;
        
        await new Promise(resolve => setTimeout(resolve, workTime));

        // Agent als completed markieren (außer es ist der letzte)
        const isLastAgent = index === enabledAgents.length - 1;
        setμ2_AgentState(prev => ({
          ...prev,
          agents: { 
            ...prev.agents, 
            [agentKey]: { active: false, status: 'completed' }
          }
        }));

        // Kurze Pause zwischen Agents
        if (!isLastAgent) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }

      // Workflow completed
      setμ2_AgentState(prev => ({
        ...prev,
        status: 'completed',
        isActive: false
      }));

      // ✨ CREATE AI RESPONSE WINDOW via μ1_WindowFactory! ✨
      if (onCreateUDItem) {
        // μ6_ Generate Context-Aware Prompt using contextManager prop
        const μ6_buildContextAwarePrompt = (userPrompt: string): string => {
          try {
            // Use contextManager prop directly - clean integration!
            if (!contextManager || !contextManager.getContextSummary) {
              console.log('🔍 μ6 No contextManager available, using plain prompt');
              return userPrompt;
            }
            
            // Debug: Check contextManager state before calling getContextSummary
            console.log('🔍 μ6 ContextManager debug:', {
              hasGetContextSummary: !!contextManager.getContextSummary,
              activeContextItemsCount: contextManager.activeContextItems?.length || 0,
              activeContextItemsIds: contextManager.activeContextItems?.map(item => item.id) || []
            });
            
            // Get model name first for vision detection
            const modelMap = {
              'reasoning': 'nexus-online/claude-sonnet-4',
              'fast': 'kira-local/llama3.1-8b',
              'premium': 'kira-online/gemini-2.5-pro',
              'super': 'nexus-online/claude-sonnet-4',
              'vision': 'kira-local/llava-vision',
              'local': 'kira-local/llama3.1-8b'
            };
            const actualModelName = modelMap[μ2_selectedModel] || modelMap['reasoning'];
            
            // Check if this is a vision-capable model for enhanced context
            const isVisionModel = μ2_selectedModel === 'vision' || actualModelName.includes('vision') || actualModelName.includes('llava');
            
            // Use appropriate context method
            const contextSummary = contextManager.getContextSummary();
            
            if (!contextSummary || contextSummary.trim() === '') {
              console.log('🔍 μ6 No context items pinned, using plain prompt');
              return userPrompt;
            }
            
            const enhancedPrompt = `${contextSummary}

**USER PROMPT:**
${userPrompt}

**INSTRUCTIONS:** Use the pinned context items above for more relevant and context-aware responses.${isVisionModel ? ' If there are images in the context, analyze them in detail.' : ''}`;

            console.log('✅ μ6 Context-Aware Prompt built:', {
              originalPromptLength: userPrompt.length,
              contextLength: contextSummary.length,
              totalLength: enhancedPrompt.length,
              contextItems: contextManager.activeContextItems?.length || 0
            });
            
            return enhancedPrompt;
          } catch (error) {
            console.warn('μ6_buildContextAwarePrompt error:', error);
            return userPrompt;
          }
        };
        
        const contextAwarePrompt = μ6_buildContextAwarePrompt(prompt);
        
        // μ6_ Map selected model to actual LiteLLM model name  
        const modelMap: Record<string, string> = {
          'reasoning': import.meta.env.VITE_LITELLM_MODEL_REASONING || 'nexus-online/claude-sonnet-4',
          'fast': import.meta.env.VITE_LITELLM_MODEL_FAST || 'kira-online/gemini-2.5-flash', 
          'premium': import.meta.env.VITE_LITELLM_MODEL_PREMIUM || 'kira-online/gemini-2.5-pro',
          'vision': import.meta.env.VITE_LITELLM_MODEL_VISION || 'kira-local/llava-vision',
          'local': import.meta.env.VITE_LITELLM_MODEL_LOCAL || 'kira-local/llama3.1-8b'
        };
        
        const actualModelName = modelMap[μ2_selectedModel] || modelMap['reasoning'];
        
        // 🔍 DEBUG: Model Selection State
        console.log('🔍 Model Debug:', { 
          μ2_selectedModel, 
          actualModelName, 
          modelMap 
        });
        
        // Generate real AI response via LiteLLM with context
        const responseContent = await μ2_callLiteLLMAPI(contextAwarePrompt, enabledAgents, actualModelName);
        
        // μ2_ Enhanced Response Processing with Title & Content Intelligence
        const contributingAgents = enabledAgents.map(a => a.key);
        
        // μ6_ Enhanced Smart Title Generation with Pattern Recognition
        const μ6_generateWindowTitle = (response: any, agents: string[]): string => {
          if (typeof response === 'string') {
            const text = response.trim();
            
            // Pattern 1: Look for "**Als X**:" multi-agent patterns
            const agentMatch = text.match(/\*\*Als\s+"?([^*"]+)"?\*\*:\s*([^\.!?]+[\.!?])/);
            if (agentMatch) {
              return `${agentMatch[1]}: ${agentMatch[2].trim()}`.substring(0, 50) + (agentMatch[2].length > 47 ? '...' : '');
            }
            
            // Pattern 2: Look for strong opening statements + German/English starters
            const strongOpeners = ['Interessant', 'Perfekt', 'Wichtig', 'Achtung', 'Problem', 'Lösung', 'Analyse', 'Ergebnis', 'Ich kann', 'Ich habe', 'Das ist', 'Hier ist'];
            const firstSentence = text.split(/[\.!?]/)[0]?.trim();
            if (firstSentence && strongOpeners.some(opener => firstSentence.startsWith(opener))) {
              const cleaned = firstSentence.replace(/^(Ich kann leider|Ich habe|Das ist|Hier ist)\s+/i, '');
              const finalSentence = cleaned.length > 0 ? cleaned : firstSentence;
              return finalSentence.length > 50 ? finalSentence.substring(0, 47) + '...' : finalSentence;
            }
            
            // Pattern 3: Extract topic from contextual phrases
            const topicMatch = text.match(/(?:sprechen|diskutieren|analysieren|erklären|zeigen)\s+(?:über|dass|wie)\s+([^,.!?]+)/i);
            if (topicMatch) {
              return `Über ${topicMatch[1].trim()}`.substring(0, 50);
            }
            
            // Pattern 4: Look for questions being answered
            const questionMatch = text.match(/(?:Ihre Frage|Sie fragen|Problem|Thema):\s*([^\.!?]+)/i);
            if (questionMatch) {
              return `Re: ${questionMatch[1].trim()}`.substring(0, 50);
            }
            
            // Pattern 5: Code/technical content detection
            if (text.includes('```') || text.includes('function') || text.includes('const ')) {
              return `Code: ${agents.join('+')} Implementation`;
            }
            
            // Pattern 6: Fallback to enhanced first sentence
            if (firstSentence && firstSentence.length > 10) {
              // Clean up common AI intro phrases
              const cleaned = firstSentence
                .replace(/^(Hier ist|Das ist|Ich kann|Gerne|Natürlich|Selbstverständlich)\s+/i, '')
                .replace(/^(eine|ein|der|die|das)\s+/i, '');
              
              const finalTitle = cleaned.length > 50 ? cleaned.substring(0, 47) + '...' : cleaned;
              return finalTitle || `${agents[0]} Analysis`;
            }
            
            // Pattern 7: Agent-specific fallbacks with more personality
            const agentTitles = {
              'reasoner': 'Reasoning Analysis',
              'coder': 'Code Solution', 
              'refiner': 'Refined Response'
            };
            
            return agentTitles[agents[0] as keyof typeof agentTitles] || `AI ${agents.join('+')} Response`;
          }
          
          if (response.title) return response.title;
          if (response.summary) return response.summary;
          
          return `AI ${agents.length > 1 ? 'Multi-Agent' : agents[0]} Response`;
        };
        
        // μ6_ Smart Content Enhancement based on Type
        const μ6_enhanceContent = (rawContent: any, detectedType: string) => {
          if (typeof rawContent === 'string') {
            // Check for code patterns
            if (detectedType === 'code') {
              return { code: rawContent, language: 'typescript' };
            }
            
            // Check for table patterns
            if (detectedType === 'tabelle' && rawContent.includes('|')) {
              const lines = rawContent.split('\n').filter(l => l.includes('|'));
              if (lines.length >= 2) {
                const headers = lines[0].split('|').map(h => h.trim()).filter(h => h);
                const rows = lines.slice(2).map(row => 
                  row.split('|').map(cell => cell.trim()).filter(cell => cell)
                );
                return { headers, rows, tableType: 'ai-generated' };
              }
            }
            
            // Enhanced text content
            return { text: rawContent, ai_generated: true, response_length: rawContent.length };
          }
          
          return rawContent;
        };
        
        const optimalType = μ1_WindowFactory.detectOptimalType(responseContent, contributingAgents);
        const smartTitle = μ6_generateWindowTitle(responseContent, contributingAgents);
        const enhancedContent = μ6_enhanceContent(responseContent, optimalType);
        
        // Create window position with smart stacking
        const windowPosition = {
          x: 200 + (Math.random() * 100), // Slight randomization to avoid exact overlap
          y: 50 + (Math.random() * 100),
          z: Date.now() % 1000
        };
        
        try {
          // Create UDItem via μ1_WindowFactory with enhanced metadata
          const udItem = μ1_WindowFactory.createUDItem({
            type: optimalType,
            title: smartTitle,
            position: windowPosition,
            content: enhancedContent,
            origin: contributingAgents.length > 1 ? 'ai-multi' : `ai-${contributingAgents[0]}`,
            contributingAgents
          });
          
          onCreateUDItem(udItem);
          
          console.log('🤖 μ2 AI Response Window Created via μ1_WindowFactory:', {
            type: optimalType,
            agents: contributingAgents,
            model: μ2_selectedModel,
            position: windowPosition,
            udItemId: udItem.id
          });
        } catch (error) {
          console.error('❌ μ2 AI Window Creation Failed:', error);
        }
      }

      // Auto-reset nach 2 Sekunden
      setTimeout(() => {
        setμ2_AgentState(prev => ({
          ...prev,
          status: 'idle',
          agents: { 
            reasoner: { active: false, status: 'idle' },
            coder: { active: false, status: 'idle' },
            refiner: { active: false, status: 'idle' }
          }
        }));
      }, 2000);

    } catch (error) {
      setμ2_AgentState(prev => ({ 
        ...prev, 
        status: 'error',
        isActive: false 
      }));
    }
  }, [μ2_getEnabledAgents, μ2_selectedModel]);

  // μ2_ Handle Input Submit
  const μ2_handleSubmit = useCallback(() => {
    μ2_processAIRequest(μ2_inputValue);
    setμ2_InputValue('');
  }, [μ2_inputValue, μ2_processAIRequest]);

  // μ2_ Handle Enter Key
  const μ2_handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      μ2_handleSubmit();
    }
  }, [μ2_handleSubmit]);

  // Raimunds algebraischer Transistor für Panel-Sichtbarkeit
  const μ2_panelTransform = visible ? 'translateX(0)' : 'translateX(100%)';
  const μ2_panelOpacity = UDFormat.transistor(!visible) * 0.05 + 0.95;

  const μ2_panelStyle: React.CSSProperties = {
    position: 'fixed',
    top: '80px', // Unter Header
    right: `${rightOffset}px`, // Panel-Kollisionsvermeidung
    width: `${width}px`,
    height: 'calc(100vh - 80px)',
    backgroundColor: 'rgba(30, 30, 30, 0.95)',
    backdropFilter: 'blur(10px)',
    borderLeft: '2px solid rgba(74, 144, 226, 0.3)',
    transform: μ2_panelTransform,
    opacity: μ2_panelOpacity,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: 200,
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '-4px 0 20px rgba(0,0,0,0.3)'
  };

  // Early return mit algebraischem Transistor
  const μ2_shouldRender = UDFormat.transistor(visible);
  if (μ2_shouldRender === 0) return null;

  return (
    <div className="μ2-ai-panel" style={μ2_panelStyle}>
      {/* Panel Header - V1 Style */}
      <div className="μ2-ai-header" style={{
        padding: '16px',
        borderBottom: '1px solid rgba(74, 144, 226, 0.2)',
        backgroundColor: 'rgba(74, 144, 226, 0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '20px' }}>🤖</span>
          <h3 style={{ 
            margin: 0, 
            color: '#4a90e2',
            fontSize: '16px',
            fontWeight: '600'
          }}>
            KI-Assistent
          </h3>
        </div>
        
        {/* Agent Status Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div 
            className={`μ2-ai-status μ2-status-${μ2_agentState.status}`}
            style={{
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '500',
              backgroundColor: 
                μ2_agentState.status === 'processing' ? 'rgba(245, 215, 110, 0.2)' :
                μ2_agentState.status === 'completed' ? 'rgba(80, 227, 194, 0.2)' :
                μ2_agentState.status === 'error' ? 'rgba(227, 80, 80, 0.2)' :
                'rgba(176, 176, 176, 0.2)',
              color:
                μ2_agentState.status === 'processing' ? '#f5d76e' :
                μ2_agentState.status === 'completed' ? '#50e3c2' :
                μ2_agentState.status === 'error' ? '#e35050' :
                '#b0b0b0'
            }}
          >
            {μ2_agentState.status}
          </div>
          
          <button
            onClick={onToggle}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '4px'
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* FLEXIBLER Agent Configuration - MIT CHECKBOXES! */}
      <div className="μ2-agent-config" style={{
        padding: '16px',
        borderBottom: '1px solid rgba(74, 144, 226, 0.1)'
      }}>
        <h4 style={{
          margin: '0 0 12px 0',
          fontSize: '14px',
          fontWeight: '600',
          color: '#374151'
        }}>
          🎯 Workflow Configuration
        </h4>
        
        {μ2_agentConfigs.map(config => {
          const agentState = μ2_agentState.agents[config.key];
          const isActive = agentState.active;
          const isEnabled = config.enabled;
          
          return (
            <div 
              key={config.key}
              className={`μ2-agent-config-item`}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                marginBottom: '8px',
                borderRadius: '8px',
                backgroundColor: 
                  isActive ? 'rgba(245, 215, 110, 0.1)' :
                  isEnabled ? 'rgba(74, 144, 226, 0.05)' : 
                  'rgba(176, 176, 176, 0.03)',
                border: `1px solid ${
                  isActive ? 'rgba(245, 215, 110, 0.3)' :
                  isEnabled ? 'rgba(74, 144, 226, 0.2)' : 
                  'rgba(176, 176, 176, 0.1)'
                }`,
                transition: 'all 0.2s ease'
              }}
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={() => μ2_toggleAgent(config.key)}
                disabled={μ2_agentState.status === 'processing'}
                style={{
                  marginRight: '12px',
                  transform: 'scale(1.2)',
                  accentColor: '#4a90e2'
                }}
              />
              
              {/* Agent Info */}
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '2px'
                }}>
                  <span style={{ fontSize: '16px' }}>{config.icon}</span>
                  <span style={{ 
                    fontWeight: isActive ? '600' : '500',
                    color: isActive ? '#f5d76e' : isEnabled ? '#4a90e2' : '#9ca3af'
                  }}>
                    {config.name}
                  </span>
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#6b7280',
                  opacity: isEnabled ? 1 : 0.5
                }}>
                  {config.description}
                </div>
              </div>
              
              {/* Status */}
              <div style={{
                fontSize: '12px',
                color: isActive ? '#f5d76e' : '#9ca3af',
                fontWeight: '500',
                minWidth: '60px',
                textAlign: 'right'
              }}>
                {agentState.status}
              </div>
            </div>
          );
        })}
        
        {/* Quick Presets */}
        <div className="μ2-quick-presets" style={{
          marginTop: '12px',
          padding: '8px',
          backgroundColor: 'rgba(74, 144, 226, 0.02)',
          borderRadius: '6px',
          border: '1px solid rgba(74, 144, 226, 0.1)'
        }}>
          <div style={{
            fontSize: '12px',
            fontWeight: '600',
            color: '#6b7280',
            marginBottom: '6px'
          }}>
            Quick Presets:
          </div>
          <div style={{
            display: 'flex',
            gap: '6px',
            flexWrap: 'wrap'
          }}>
            {[
              { name: 'All', agents: ['reasoner', 'coder', 'refiner'] },
              { name: 'Think Only', agents: ['reasoner'] },
              { name: 'Code Only', agents: ['coder'] },
              { name: 'Think + Code', agents: ['reasoner', 'coder'] }
            ].map(preset => (
              <button
                key={preset.name}
                onClick={() => {
                  setμ2_AgentConfigs(prev => prev.map(config => ({
                    ...config,
                    enabled: preset.agents.includes(config.key)
                  })));
                }}
                disabled={μ2_agentState.status === 'processing'}
                style={{
                  padding: '4px 8px',
                  fontSize: '11px',
                  borderRadius: '4px',
                  border: '1px solid rgba(74, 144, 226, 0.2)',
                  backgroundColor: 'white',
                  color: '#4a90e2',
                  cursor: μ2_agentState.status === 'processing' ? 'not-allowed' : 'pointer',
                  opacity: μ2_agentState.status === 'processing' ? 0.5 : 1
                }}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Model Selector */}
      <div className="μ2-model-selector" style={{
        padding: '16px',
        borderBottom: '1px solid rgba(74, 144, 226, 0.1)'
      }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '500',
          color: '#374151',
          marginBottom: '8px'
        }}>
          AI Model:
        </label>
        <select
          value={μ2_selectedModel}
          onChange={(e) => {
            console.log('🔄 Dropdown changed to:', e.target.value);
            setμ2_SelectedModel(e.target.value);
          }}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid rgba(74, 144, 226, 0.2)',
            backgroundColor: 'white',
            fontSize: '14px',
            color: '#374151'
          }}
        >
          <option value="reasoning">🧠 Reasoning Model</option>
          <option value="fast">⚡ Fast Model</option>
          <option value="premium">💎 Premium Model</option>
          <option value="vision">👁️ Vision Model</option>
          <option value="local">🏠 Local Model</option>
        </select>
      </div>

      {/* Input Area - V1 Style */}
      <div className="μ2-ai-input" style={{
        padding: '16px',
        marginTop: 'auto'
      }}>
        <textarea
          value={μ2_inputValue}
          onChange={(e) => setμ2_InputValue(e.target.value)}
          onKeyPress={μ2_handleKeyPress}
          placeholder="Beschreibe was du erstellen möchtest..."
          disabled={μ2_agentState.status === 'processing'}
          style={{
            width: '100%',
            minHeight: '80px',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid rgba(74, 144, 226, 0.2)',
            backgroundColor: 'white',
            fontSize: '14px',
            color: '#374151',
            resize: 'vertical',
            fontFamily: 'inherit',
            marginBottom: '12px'
          }}
        />
        
        <button
          onClick={μ2_handleSubmit}
          disabled={!μ2_inputValue.trim() || μ2_agentState.status === 'processing' || μ2_getEnabledAgents().length === 0}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: 
              μ2_getEnabledAgents().length === 0 ? '#ef4444' :
              μ2_agentState.status === 'processing' ? '#9ca3af' : '#4a90e2',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 
              μ2_getEnabledAgents().length === 0 || μ2_agentState.status === 'processing' ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          {μ2_getEnabledAgents().length === 0 ? (
            <>⚠️ No Agents Selected</>
          ) : μ2_agentState.status === 'processing' ? (
            <>⏳ Processing...</>
          ) : (
            <>🚀 Execute {μ2_getEnabledAgents().length} Agent{μ2_getEnabledAgents().length > 1 ? 's' : ''}</>
          )}
        </button>
      </div>

      {/* Current Task Display */}
      {μ2_agentState.currentTask && (
        <div className="μ2-current-task" style={{
          padding: '12px 16px',
          backgroundColor: 'rgba(74, 144, 226, 0.05)',
          borderTop: '1px solid rgba(74, 144, 226, 0.1)',
          fontSize: '12px',
          color: '#6b7280'
        }}>
          <strong>Current Task:</strong> {μ2_agentState.currentTask}
        </div>
      )}

      {/* Bagua Info Footer */}
      <div className="μ2-bagua-info" style={{
        padding: '12px 16px',
        backgroundColor: 'rgba(74, 144, 226, 0.05)',
        borderTop: '1px solid rgba(74, 144, 226, 0.1)',
        fontSize: '12px',
        color: '#6b7280'
      }}>
        <div style={{ fontWeight: '600', marginBottom: '4px' }}>
          μ2 WIND (☴) - Flexible AI Workflow
        </div>
        <div>
          Enabled: {μ2_getEnabledAgents().map(a => a.name).join(' → ') || 'None'}
        </div>
      </div>
    </div>
  );
};
