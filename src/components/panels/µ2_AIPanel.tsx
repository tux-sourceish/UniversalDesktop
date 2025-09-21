import React, { useState, useCallback, useEffect } from 'react';
import { UDFormat } from '../../core/UDFormat';
import { µ1_WindowFactory } from '../factories/µ1_WindowFactory';
// µ1_ Agent Personas Integration - HIMMEL (☰) Templates/Configuration
import {
  AGENT_PERSONAS,
  µ1_generateAgentPrompt,
  µ1_validateAgentResponse
} from '../../config/µ1_AgentPersonas';

/**
 * µ2_AIPanel - WIND (☴) Views/UI - KI-Assistent Panel
 * 
 * V1-Style AI Panel mit flexiblem Three-Phase Agent System.
 * Jetzt mit Checkboxen für individuelle Agent-Auswahl!
 */

interface µ2_AIPanelProps {
  position?: 'right' | 'left' | 'floating';
  width?: number;
  visible: boolean;
  onToggle: () => void;
  rightOffset?: number; // Für Panel-Kollisionsvermeidung
  /** Callback für µ1_WindowFactory UDItem Creation */
  onCreateUDItem?: (udItem: any) => void;
  /** Smart positioning calculator for viewport-centered windows */
  positionCalculator?: (requestedPosition: { x: number; y: number; z: number }) => { x: number; y: number; z: number };
  /** Context Manager for AI-aware prompts */
  contextManager?: {
    getContextSummary: () => string;
    activeContextItems: any[];
    getVisionContext?: () => { textContent: string; images: any[] };
  };
}

interface µ2_AgentState {
  isActive: boolean;
  currentTask: string;
  status: 'idle' | 'processing' | 'completed' | 'error';
  validationWarnings: string[]; // Track philosophy compliance issues
  agents: {
    reasoner: { active: boolean; status: string; validationPassed?: boolean };
    coder: { active: boolean; status: string; validationPassed?: boolean };
    refiner: { active: boolean; status: string; validationPassed?: boolean };
    guardian: { active: boolean; status: string; validationPassed?: boolean }; // NEU: Guardian
  };
}

interface µ2_AgentConfig {
  key: keyof µ2_AgentState['agents'];
  icon: string;
  name: string;
  description: string;
  bagua: number;
  enabled: boolean;
  model: string; // Added: Individual model selection per agent
}

// Available models for agent selection
const µ2_AVAILABLE_MODELS = [
  'kira-online/gemini-2.5-flash',
  'nexus-online/claude-sonnet-4', 
  'kira-online/gemini-2.5-pro',
  'nexus-online/claude-opus-4',
  'kira-local/llava-vision',
  'kira-local/llama3.1-8b'
];

export const µ2_AIPanel: React.FC<µ2_AIPanelProps> = ({
  position: _position = 'right',
  width = 320,
  visible,
  onToggle,
  rightOffset = 0,
  onCreateUDItem,
  positionCalculator,
  contextManager
}) => {
  
  // µ2_ Agent State Management with Philosophy Tracking (WIND-Pattern: UI-State-Management) 
  const [µ2_agentState, setµ2_AgentState] = useState<µ2_AgentState>({
    isActive: false,
    currentTask: '',
    status: 'idle',
    validationWarnings: [],
    agents: {
      reasoner: { active: false, status: 'idle', validationPassed: true },
      coder: { active: false, status: 'idle', validationPassed: true },
      refiner: { active: false, status: 'idle', validationPassed: true },
      guardian: { active: false, status: 'idle', validationPassed: true } // NEU
    }
  });

  // µ2_ Agent Configuration with Philosophy-Aware Personas (MODULAR SYSTEM!)  
  const [µ2_agentConfigs, setµ2_AgentConfigs] = useState<µ2_AgentConfig[]>([
    {
      key: 'reasoner',
      icon: '🏗️',
      name: 'Reasoner',
      description: 'Der Architekt. Plant gemäß der Vision.',
      bagua: AGENT_PERSONAS.reasoner?.baguaAlignment || UDFormat.BAGUA.HIMMEL,
      enabled: true,
      model: 'nexus-online/claude-sonnet-4'
    },
    {
      key: 'coder', 
      icon: '🔥',
      name: 'Coder',
      description: 'Der Handwerker. Schreibt reinen Code.',
      bagua: AGENT_PERSONAS.coder?.baguaAlignment || UDFormat.BAGUA.FEUER,
      enabled: false,
      model: 'kira-local/llama3.1-8b'
    },
    {
      key: 'refiner',
      icon: '🌊', 
      name: 'Refiner',
      description: 'Der Alchemist. Veredelt und optimiert.',
      bagua: AGENT_PERSONAS.refiner?.baguaAlignment || UDFormat.BAGUA.SEE,
      enabled: false,
      model: 'kira-online/gemini-2.5-pro'
    },
    {
      key: 'guardian', 
      icon: '🛡️',
      name: 'Guardian',
      description: 'Der Wächter. Prüft auf philosophische Reinheit.',
      bagua: AGENT_PERSONAS.guardian?.baguaAlignment || UDFormat.BAGUA.ERDE,
      enabled: true, // Guardian ist standardmäßig aktiv
      model: 'kira-online/gemini-2.5-pro' // Benötigt ein starkes Modell für die Analyse
    }
  ]);

  const [µ2_inputValue, setµ2_InputValue] = useState('');
  
  // µ2_ Output Type Selection (for Window Creation)
  type OutputType = 'notizzettel' | 'code' | 'tui';
  const [µ2_outputType, setµ2_OutputType] = useState<OutputType>('notizzettel');

  // µ7_ Debug Mode State (DONNER - Events/Debug/Interactions)
  const [µ7_debugMode, setµ7_DebugMode] = useState(() => 
    localStorage.getItem('ud-debug-mode') === 'true'
  );
  const [µ7_debugSessionId, setµ7_DebugSessionId] = useState(() => 
    `debug-${Date.now()}`
  );

  // µ4_ Configuration Persistence (BERG - Setup/Init)
  useEffect(() => {
    // Load saved configuration on mount
    const savedConfig = localStorage.getItem('ud-agent-config');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setµ2_AgentConfigs(parsedConfig);
      } catch (error) {
        console.warn('Failed to load agent config:', error);
      }
    }

    const savedOutputType = localStorage.getItem('ud-output-type');
    if (savedOutputType && ['notizzettel', 'code', 'tui'].includes(savedOutputType)) {
      setµ2_OutputType(savedOutputType as OutputType);
    }

    // Debug mode is already loaded in useState initializer
  }, []);

  // µ4_ Save Configuration Changes
  useEffect(() => {
    localStorage.setItem('ud-agent-config', JSON.stringify(µ2_agentConfigs));
  }, [µ2_agentConfigs]);

  useEffect(() => {
    localStorage.setItem('ud-output-type', µ2_outputType);
  }, [µ2_outputType]);

  // µ7_ Debug Mode Persistence
  useEffect(() => {
    localStorage.setItem('ud-debug-mode', String(µ7_debugMode));
  }, [µ7_debugMode]);


  // µ2_ Toggle Agent Checkbox
  const µ2_toggleAgent = useCallback((agentKey: keyof µ2_AgentState['agents']) => {
    setµ2_AgentConfigs(prev => prev.map(config => 
      config.key === agentKey 
        ? { ...config, enabled: !config.enabled }
        : config
    ));
  }, []);

  // µ2_ Change Agent Model
  const µ2_changeAgentModel = useCallback((agentKey: keyof µ2_AgentState['agents'], model: string) => {
    setµ2_AgentConfigs(prev => prev.map(config => 
      config.key === agentKey 
        ? { ...config, model }
        : config
    ));
  }, []);

  // µ2_ Get Enabled Agents (für flexiblen Workflow)
  const µ2_getEnabledAgents = useCallback((): µ2_AgentConfig[] => {
    return µ2_agentConfigs.filter(config => config.enabled);
  }, [µ2_agentConfigs]);

  // µ2_ Real LiteLLM API Integration
  const µ2_callLiteLLMAPI = useCallback(async (
    prompt: string, 
    enabledAgents: µ2_AgentConfig[], 
    model: string,
    contextInfo?: { activeItems?: any[], hasContextInPrompt?: boolean }
  ): Promise<any> => {
    const baseUrl = import.meta.env.VITE_LITELLM_BASE_URL || 'http://localhost:4001';
    const apiKey = import.meta.env.VITE_LITELLM_API_KEY || 'test123';
    
    // Use the already-mapped model name passed from parent
    const selectedModel = model
    const agentContext = enabledAgents.length > 1 
      ? `\nUsing specialized agents: ${enabledAgents.map(a => `${a.name} (${a.description})`).join(', ')}\n`
      : '';

    try {
      // Better context detection using both prompt content and contextInfo parameter
      const promptHasContext = prompt.includes('Pinned Items:') || 
                               prompt.includes('MCP-CONTEXT:') || 
                               prompt.includes('**INSTRUCTIONS:** Use the pinned context items');
      const hasActiveItems = contextInfo?.activeItems && contextInfo.activeItems.length > 0;
      const hasContext = promptHasContext || hasActiveItems || (contextInfo?.hasContextInPrompt === true);
      
      console.log('🚀 µ2 LiteLLM API Call:', { 
        model: selectedModel, 
        agents: enabledAgents.length,
        hasContext: hasContext,
        contextItems: contextInfo?.activeItems?.length || 0,
        promptContainsContext: promptHasContext,
        contextInfo: contextInfo ? 'provided' : 'missing',
        promptLength: prompt.length,
        promptPreview: prompt.substring(0, 100) + (prompt.length > 100 ? '...' : '')
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
          max_tokens: 8000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`LiteLLM API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content || 'No response from AI';

      console.log(`✅ µ2 Response received: ${aiResponse.length} chars`);

      // Format response based on agents and model
      if (enabledAgents.some(a => a.key === 'coder') && (aiResponse.includes('```') || aiResponse.includes('function'))) {
        return { code: aiResponse };
      } else {
        return { text: aiResponse };
      }

    } catch (error) {
      console.error('❌ µ2 LiteLLM API Error:', error);
      
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

  // µ6_ Sequential Agent Processing Chain with Modular Personas (FEUER - Functions)
  const µ6_processWithAgents = useCallback(async (
    initialPrompt: string,
    context: any[],
    enabledAgents: µ2_AgentConfig[],
    outputType: string = 'notizzettel'
  ): Promise<string> => {
    let result = initialPrompt;
    
    const contextString = context.length > 0 
      ? `Pinned Items:\n${context.map(item => `[${item.title}] ${item.content?.substring(0, 200)}...`).join('\n')}`
      : '';

    const processingAgents = enabledAgents.filter(a => a.key !== 'guardian');
    const guardianAgent = enabledAgents.find(a => a.key === 'guardian');

    for (let i = 0; i < processingAgents.length; i++) {
      const agent = processingAgents[i];
      const isLastAgent = i === processingAgents.length - 1;
      
      try {
        const mcpContext = contextManager?.getContextSummary?.() || '';
        const finalAgentPrompt = µ1_generateAgentPrompt(agent.key, result, contextString, mcpContext, outputType);

        const response = await µ2_callLiteLLMAPI(finalAgentPrompt, [agent], agent.model, {
            activeItems: contextManager?.activeContextItems || [],
            hasContextInPrompt: finalAgentPrompt.includes('Pinned Items:')
        });

        if (µ7_debugMode && !isLastAgent && onCreateUDItem) {
          // Debug window logic can be inserted here if needed
        }

        const validation = µ1_validateAgentResponse(response.text || '', agent.key);
        if (!validation.valid) {
          setµ2_AgentState(prev => ({
            ...prev,
            validationWarnings: [...prev.validationWarnings, ...validation.issues.map(issue => `${agent.name}: ${issue}`)]
          }));
        }

        result = response.text || response.code || result;
        console.log(`✅ ${agent.name} completed.`);
      } catch (error) {
        console.error(`❌ Agent ${agent.name} processing failed:`, error);
      }
    }

    if (guardianAgent) {
        console.log('🛡️ Guardian is now validating the final result...');
        const finalValidation = µ1_validateAgentResponse(result, 'coder'); // Validate as coder output for now
        if (!finalValidation.valid) {
            console.warn('🛡️ Guardian VETO! The result is not philosophically pure.', finalValidation.issues);
            result = `**🛡️ GUARDIAN VETO 🛡️**\n\n*Die Vision bleibt gewahrt.*\n\n**Grund der Ablehnung:**\n${finalValidation.issues.join('\n')}\n\n--- URSPRÜNGLICHES ERGEBNIS ---\n\n${result}`;
            setµ2_AgentState(prev => ({
                ...prev,
                validationWarnings: [...prev.validationWarnings, ...finalValidation.issues.map(issue => `Guardian: ${issue}`)]
            }));
        } else {
            console.log('✅ Guardian approved. The result is pure.');
        }
    }

    return result;
  }, [contextManager, µ7_debugMode, µ7_debugSessionId, onCreateUDItem]); // Include debugMode and onCreateUDItem for debug functionality

  // µ7_ Debug Mode Toggle (DONNER - Events/Interactions)
  const µ7_toggleDebugMode = useCallback(() => {
    setµ7_DebugMode(prev => !prev);
    // Generate new session ID when toggling debug mode
    setµ7_DebugSessionId(`debug-${Date.now()}`);
  }, []);

  // µ2_ AI Request Processing (FLEXIBLER Three-Phase Workflow)
  const µ2_processAIRequest = useCallback(async (prompt: string) => {
    if (!prompt.trim()) return;

    const enabledAgents = µ2_getEnabledAgents();
    if (enabledAgents.length === 0) return;

    // Generate new debug session ID for each request
    setµ7_DebugSessionId(`debug-${Date.now()}`);

    setµ2_AgentState(prev => ({ 
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
        setµ2_AgentState(prev => ({
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
        setµ2_AgentState(prev => ({
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

      // Agent-Simulation completed, jetzt beginnt echte AI-Verarbeitung
      setµ2_AgentState(prev => ({
        ...prev,
        status: 'processing', // Weiter processing für echte AI
        isActive: true
      }));

      // ✨ CREATE AI RESPONSE WINDOW via µ1_WindowFactory with NEW AGENT SYSTEM! ✨
      if (onCreateUDItem) {
        // µ6_ Generate Context-Aware Prompt using contextManager prop (WORKING VERSION!)
        const µ6_buildContextAwarePrompt = (userPrompt: string): string => {
          try {
            // Use contextManager prop directly - clean integration!
            if (!contextManager || !contextManager.getContextSummary) {
              return userPrompt;
            }
            
            // Use appropriate context method
            const contextSummary = contextManager.getContextSummary();
            
            if (!contextSummary || contextSummary.trim() === '') {
              return userPrompt;
            }
            
            const enhancedPrompt = `${contextSummary}

**USER PROMPT:**
${userPrompt}

**INSTRUCTIONS:** Use the pinned context items above for more relevant and context-aware responses.`;

            
            return enhancedPrompt;
          } catch (error) {
            console.warn('µ6_buildContextAwarePrompt error:', error);
            return userPrompt;
          }
        };
        
        const contextAwarePrompt = µ6_buildContextAwarePrompt(prompt);
        
        // µ6_ Build Context Array for Agent Processing (for backward compatibility)
        const contextItems = contextManager?.activeContextItems || [];
        
        // Status auf "processing" für echte AI-Calls setzen
        setµ2_AgentState(prev => ({
          ...prev,
          status: 'processing', // Echte AI-Verarbeitung beginnt jetzt
          isActive: true
        }));
        
        // µ6_ Process with Sequential Agent Chain using context-aware prompt
        const finalResult = await µ6_processWithAgents(contextAwarePrompt, contextItems, enabledAgents, µ2_outputType);
        
        console.log(`🤖 Multi-Agent Complete: ${enabledAgents.map(a => a.name).join(' → ')} (${µ2_outputType})`);
        
        // µ1_ Create Window using µ1_WindowFactory with Agent Results - viewport-centered positioning
        const position = { x: 0, y: 0, z: 0 }; // Default triggers viewport centering
        
        // µ6_ Generate Window Title from Agent Results
        const generateTitle = (result: string, agents: µ2_AgentConfig[]): string => {
          const agentNames = agents.map(a => a.name).join('+');
          const firstLine = result.split('\n')[0]?.substring(0, 30) || 'AI Response';
          return `${agentNames}: ${firstLine}${firstLine.length > 27 ? '...' : ''}`;
        };
        
        try {
          const newWindow = µ1_WindowFactory.createUDItem({
            type: µ2_outputType, // Use the selected output type directly
            position,
            title: generateTitle(finalResult, enabledAgents),
            content: {
              text: finalResult,
              code: µ2_outputType === 'code' ? finalResult : undefined,
              tui_content: µ2_outputType === 'tui' ? finalResult : undefined
            },
            origin: 'ai-multi',
            metadata: {
              agents: enabledAgents.map(a => ({ name: a.name, model: a.model })),
              processingType: 'multi-agent-chain',
              originalPrompt: prompt,
              outputType: µ2_outputType,
              contextItems: contextItems.length
            }
          }, positionCalculator); // Use positionCalculator for viewport-centered AI response windows
          
          if (newWindow && onCreateUDItem) {
            onCreateUDItem(newWindow);
            console.log(`🌟 AI Window Created: ${newWindow.title}`);
          } else {
            console.warn('❌ AI Window creation failed: newWindow or onCreateUDItem missing', { newWindow: !!newWindow, onCreateUDItem: !!onCreateUDItem });
          }
        } catch (windowError) {
          console.error('❌ AI Window creation error:', windowError);
          throw windowError; // Re-throw to trigger error state
        }
      }

      // AI-Request erfolgreich abgeschlossen - Status auf "completed" dann "idle"
      setµ2_AgentState(prev => ({
        ...prev,
        status: 'completed',
        isActive: false
      }));

      // Nach kurzer Zeit auf "idle" wechseln für bessere UX
      setTimeout(() => {
        setµ2_AgentState(prev => ({
          ...prev,
          status: 'idle',
          validationWarnings: [], // Clear warnings after timeout
          agents: { 
            reasoner: { active: false, status: 'idle', validationPassed: true },
            coder: { active: false, status: 'idle', validationPassed: true },
            refiner: { active: false, status: 'idle', validationPassed: true },
            guardian: { active: false, status: 'idle', validationPassed: true }
          }
        }));
      }, 1500); // Verkürzt von 2000ms auf 1500ms

    } catch (error) {
      setµ2_AgentState(prev => ({ 
        ...prev, 
        status: 'error',
        isActive: false 
      }));
    }
  }, [µ2_getEnabledAgents]);

  // µ2_ Handle Input Submit
  const µ2_handleSubmit = useCallback(() => {
    µ2_processAIRequest(µ2_inputValue);
    setµ2_InputValue('');
  }, [µ2_inputValue, µ2_processAIRequest]);

  // µ2_ Handle Enter Key
  const µ2_handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      µ2_handleSubmit();
    }
  }, [µ2_handleSubmit]);

  // Raimunds algebraischer Transistor für Panel-Sichtbarkeit
  const µ2_panelTransform = visible ? 'translateX(0)' : 'translateX(100%)';
  const µ2_panelOpacity = UDFormat.transistor(!visible) * 0.05 + 0.95;

  const µ2_panelStyle: React.CSSProperties = {
    position: 'fixed',
    top: '80px', // Unter Header
    right: `${rightOffset}px`, // Panel-Kollisionsvermeidung
    width: `${width}px`,
    height: 'calc(100vh - 80px)',
    backgroundColor: 'rgba(30, 30, 30, 0.95)',
    backdropFilter: 'blur(10px)',
    borderLeft: '2px solid rgba(74, 144, 226, 0.3)',
    transform: µ2_panelTransform,
    opacity: µ2_panelOpacity,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: 200,
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '-4px 0 20px rgba(0,0,0,0.3)'
  };

  // Early return mit algebraischem Transistor
  const µ2_shouldRender = UDFormat.transistor(visible);
  if (µ2_shouldRender === 0) return null;

  return (
    <div className="µ2-ai-panel" style={µ2_panelStyle}>
      {/* Panel Header - V1 Style */}
      <div className="µ2-ai-header" style={{
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
            className={`µ2-ai-status µ2-status-${µ2_agentState.status}`}
            style={{
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '500',
              backgroundColor: 
                µ2_agentState.status === 'processing' ? 'rgba(239, 68, 68, 0.15)' :
                µ2_agentState.status === 'completed' ? 'rgba(80, 227, 194, 0.2)' :
                µ2_agentState.status === 'error' ? 'rgba(227, 80, 80, 0.2)' :
                'rgba(176, 176, 176, 0.2)',
              color:
                µ2_agentState.status === 'processing' ? '#ef4444' :
                µ2_agentState.status === 'completed' ? '#50e3c2' :
                µ2_agentState.status === 'error' ? '#e35050' :
                '#b0b0b0'
            }}
          >
            {µ2_agentState.status === 'processing' ? '🤖 KI denkt...' : 
             µ2_agentState.status === 'completed' ? '✅ Fertig' :
             µ2_agentState.status === 'error' ? '❌ Fehler' :
             '💤 Bereit'}
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
      <div className="µ2-agent-config" style={{
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
        
        {µ2_agentConfigs.map(config => {
          const agentState = µ2_agentState.agents[config.key];
          if (!agentState) return null; // Defensive check to prevent crash
          const isActive = agentState.active;
          const isEnabled = config.enabled;
          
          return (
            <div 
              key={config.key}
              className={`µ2-agent-config-item`}
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
                onChange={() => µ2_toggleAgent(config.key)}
                disabled={µ2_agentState.status === 'processing'}
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
                  opacity: isEnabled ? 1 : 0.5,
                  marginBottom: '4px'
                }}>
                  {config.description}
                </div>
                
                {/* Model Selection Dropdown */}
                <select
                  value={config.model}
                  onChange={(e) => µ2_changeAgentModel(config.key, e.target.value)}
                  disabled={!isEnabled || µ2_agentState.status === 'processing'}
                  style={{
                    fontSize: '10px',
                    padding: '2px 4px',
                    borderRadius: '4px',
                    border: '1px solid rgba(74, 144, 226, 0.2)',
                    backgroundColor: isEnabled ? 'rgba(255, 255, 255, 0.1)' : 'rgba(176, 176, 176, 0.05)',
                    color: isEnabled ? '#4a90e2' : '#9ca3af',
                    maxWidth: '160px',
                    opacity: isEnabled ? 1 : 0.5
                  }}
                >
                  {µ2_AVAILABLE_MODELS.map(model => (
                    <option key={model} value={model} style={{ backgroundColor: '#1a1a1a' }}>
                      {model.split('/')[1] || model}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Status with Validation Indicator */}
              <div style={{
                fontSize: '12px',
                color: isActive ? '#f5d76e' : '#9ca3af',
                fontWeight: '500',
                minWidth: '60px',
                textAlign: 'right',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                {agentState.status}
                {agentState.validationPassed === false && (
                  <span title="Philosophy compliance issues detected" style={{ color: '#ef4444', fontSize: '10px' }}>
                    ⚠️
                  </span>
                )}
                {agentState.validationPassed === true && agentState.status === 'completed' && (
                  <span title="Philosophy compliant" style={{ color: '#10b981', fontSize: '10px' }}>
                    ✓
                  </span>
                )}
              </div>
            </div>
          );
        })}
        
        {/* µ7_ Debug Mode Controls (DONNER - Events/Debug) */}
        <div className="µ7-debug-controls" style={{
          marginTop: '12px',
          padding: '8px 12px',
          backgroundColor: µ7_debugMode 
            ? 'rgba(245, 215, 110, 0.1)' 
            : 'rgba(74, 144, 226, 0.02)',
          borderRadius: '6px',
          border: `1px solid ${µ7_debugMode 
            ? 'rgba(245, 215, 110, 0.3)' 
            : 'rgba(74, 144, 226, 0.1)'}`
        }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '500',
            color: µ7_debugMode ? '#f5d76e' : '#6b7280'
          }}>
            <input
              type="checkbox"
              checked={µ7_debugMode}
              onChange={µ7_toggleDebugMode}
              disabled={µ2_agentState.status === 'processing'}
              style={{
                transform: 'scale(1.1)',
                accentColor: '#f5d76e'
              }}
            />
            <span style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px' 
            }}>
              🔍 Debug Agent Prompts
              {µ7_debugMode && (
                <span style={{
                  fontSize: '10px',
                  padding: '2px 6px',
                  backgroundColor: 'rgba(245, 215, 110, 0.2)',
                  borderRadius: '4px',
                  color: '#f5d76e',
                  fontWeight: '600'
                }}>
                  ACTIVE
                </span>
              )}
            </span>
          </label>
          <div style={{
            fontSize: '10px',
            color: µ7_debugMode ? 'rgba(245, 215, 110, 0.8)' : '#9ca3af',
            marginTop: '4px',
            marginLeft: '28px',
            lineHeight: '1.3'
          }}>
            {µ7_debugMode 
              ? `✨ Debug-Windows zeigen Prompts zwischen Agenten (Session: ${µ7_debugSessionId.split('-')[1]})` 
              : 'Zeigt Zwischenergebnisse und Prompts für jeden Agent-Übergang'}
          </div>
        </div>

        {/* Quick Presets */}
        <div className="µ2-quick-presets" style={{
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
                  setµ2_AgentConfigs(prev => prev.map(config => ({
                    ...config,
                    enabled: preset.agents.includes(config.key)
                  })));
                }}
                disabled={µ2_agentState.status === 'processing'}
                style={{
                  padding: '4px 8px',
                  fontSize: '11px',
                  borderRadius: '4px',
                  border: '1px solid rgba(74, 144, 226, 0.2)',
                  backgroundColor: 'white',
                  color: '#4a90e2',
                  cursor: µ2_agentState.status === 'processing' ? 'not-allowed' : 'pointer',
                  opacity: µ2_agentState.status === 'processing' ? 0.5 : 1
                }}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      </div>


      {/* Input Area - V1 Style */}
      <div className="µ2-ai-input" style={{
        padding: '16px',
        marginTop: 'auto'
      }}>
        {/* Output Type Selection */}
        <div className="µ2-output-type-selector" style={{
          marginBottom: '12px',
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
            Output Type:
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', fontSize: '11px', color: '#4a90e2', cursor: 'pointer' }}>
              <input
                type="radio"
                value="notizzettel"
                checked={µ2_outputType === 'notizzettel'}
                onChange={(e) => setµ2_OutputType(e.target.value as OutputType)}
                disabled={µ2_agentState.status === 'processing'}
                style={{ marginRight: '4px', accentColor: '#4a90e2' }}
              />
              📝 Note
            </label>
            <label style={{ display: 'flex', alignItems: 'center', fontSize: '11px', color: '#4a90e2', cursor: 'pointer' }}>
              <input
                type="radio"
                value="code"
                checked={µ2_outputType === 'code'}
                onChange={(e) => setµ2_OutputType(e.target.value as OutputType)}
                disabled={µ2_agentState.status === 'processing'}
                style={{ marginRight: '4px', accentColor: '#4a90e2' }}
              />
              💻 Code
            </label>
            <label style={{ display: 'flex', alignItems: 'center', fontSize: '11px', color: '#4a90e2', cursor: 'pointer' }}>
              <input
                type="radio"
                value="tui"
                checked={µ2_outputType === 'tui'}
                onChange={(e) => setµ2_OutputType(e.target.value as OutputType)}
                disabled={µ2_agentState.status === 'processing'}
                style={{ marginRight: '4px', accentColor: '#4a90e2' }}
              />
              🖥️ TUI
            </label>
          </div>
        </div>

        <textarea
          value={µ2_inputValue}
          onChange={(e) => setµ2_InputValue(e.target.value)}
          onKeyPress={µ2_handleKeyPress}
          placeholder="Beschreibe was du erstellen möchtest..."
          disabled={µ2_agentState.status === 'processing'}
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
          onClick={µ2_handleSubmit}
          disabled={!µ2_inputValue.trim() || µ2_agentState.status === 'processing' || µ2_getEnabledAgents().length === 0}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: 
              µ2_getEnabledAgents().length === 0 ? '#ef4444' :
              µ2_agentState.status === 'processing' ? '#9ca3af' : '#4a90e2',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 
              µ2_getEnabledAgents().length === 0 || µ2_agentState.status === 'processing' ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          {µ2_getEnabledAgents().length === 0 ? (
            <>⚠️ No Agents Selected</>
          ) : µ2_agentState.status === 'processing' ? (
            <>⏳ Processing...</>
          ) : (
            <>🚀 Execute {µ2_getEnabledAgents().length} Agent{µ2_getEnabledAgents().length > 1 ? 's' : ''}</>
          )}
        </button>
      </div>

      {/* Current Task Display */}
      {µ2_agentState.currentTask && (
        <div className="µ2-current-task" style={{
          padding: '12px 16px',
          backgroundColor: 'rgba(74, 144, 226, 0.05)',
          borderTop: '1px solid rgba(74, 144, 226, 0.1)',
          fontSize: '12px',
          color: '#6b7280'
        }}>
          <strong>Current Task:</strong> {µ2_agentState.currentTask}
        </div>
      )}

      {/* Validation Warnings Display */}
      {µ2_agentState.validationWarnings.length > 0 && (
        <div className="µ2-validation-warnings" style={{
          padding: '12px 16px',
          backgroundColor: 'rgba(239, 68, 68, 0.05)',
          borderTop: '1px solid rgba(239, 68, 68, 0.2)',
          fontSize: '11px',
          color: '#ef4444'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            ⚠️ Philosophy Compliance Issues:
          </div>
          {µ2_agentState.validationWarnings.slice(-3).map((warning, index) => (
            <div key={index} style={{ marginBottom: '2px', opacity: 0.8 }}>
              • {warning}
            </div>
          ))}
          {µ2_agentState.validationWarnings.length > 3 && (
            <div style={{ opacity: 0.6, fontStyle: 'italic' }}>
              ...and {µ2_agentState.validationWarnings.length - 3} more issues
            </div>
          )}
        </div>
      )}

      {/* Bagua Info Footer */}
      <div className="µ2-bagua-info" style={{
        padding: '12px 16px',
        backgroundColor: 'rgba(74, 144, 226, 0.05)',
        borderTop: '1px solid rgba(74, 144, 226, 0.1)',
        fontSize: '12px',
        color: '#6b7280'
      }}>
        <div style={{ fontWeight: '600', marginBottom: '4px' }}>
          µ2 WIND (☴) - Philosophy-Aware AI Workflow v2.0
        </div>
        <div>
          Enabled: {µ2_getEnabledAgents().map(a => a.name).join(' → ') || 'None'}
          {µ7_debugMode && (
            <span style={{ 
              color: '#f5d76e', 
              marginLeft: '8px',
              fontSize: '10px',
              fontWeight: '600'
            }}>
              | 🔍 DEBUG
            </span>
          )}
        </div>
        <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '2px' }}>
          Modular Personas | MCP Integration | TypeScript-Only Enforcement
          {µ7_debugMode && (
            <span style={{ color: '#f5d76e', marginLeft: '4px' }}>
              | Debug: Agent-zu-Agent Prompt Flow
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
