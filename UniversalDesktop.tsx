import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import './UniversalDesktop.css';

// Types based on our analysis
interface Position {
  x: number;
  y: number;
  z: number;
}

interface DesktopItem {
  id: string;
  type: 'notizzettel' | 'tabelle' | 'code' | 'browser' | 'terminal' | 'media' | 'chart' | 'calendar';
  title: string;
  position: Position;
  content: any;
  created_at: string;
  updated_at: string;
  user_id: string;
  metadata?: Record<string, any>;
}

interface CanvasState {
  position: Position;
  scale: number;
  velocity: Position;
  isDragging: boolean;
  momentum: { x: number; y: number };
}

interface AgentState {
  isActive: boolean;
  currentTask: string;
  status: 'idle' | 'processing' | 'completed' | 'error';
  agents: {
    reasoner: { active: boolean; status: string };
    coder: { active: boolean; status: string };
    refiner: { active: boolean; status: string };
  };
}

// Supabase client (fallback to mock)
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL || 'mock-url',
  process.env.REACT_APP_SUPABASE_ANON_KEY || 'mock-key'
);

const UniversalDesktop: React.FC = () => {
  // State management
  const [items, setItems] = useState<DesktopItem[]>([]);
  const [canvasState, setCanvasState] = useState<CanvasState>({
    position: { x: 0, y: 0, z: 0 },
    scale: 1,
    velocity: { x: 0, y: 0, z: 0 },
    isDragging: false,
    momentum: { x: 0, y: 0 }
  });
  const [agentState, setAgentState] = useState<AgentState>({
    isActive: false,
    currentTask: '',
    status: 'idle',
    agents: {
      reasoner: { active: false, status: 'idle' },
      coder: { active: false, status: 'idle' },
      refiner: { active: false, status: 'idle' }
    }
  });
  const [aiPanelVisible, setAiPanelVisible] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string>('notizzettel');
  const [user, setUser] = useState<any>(null);

  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number>();

  // Debounced save system from App.tsx analysis
  const debouncedSave = useCallback((updatedItems: DesktopItem[]) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        for (const item of updatedItems) {
          await supabase
            .from('desktop_items')
            .upsert({
              ...item,
              updated_at: new Date().toISOString()
            });
        }
        console.log('Items saved successfully');
      } catch (error) {
        console.error('Error saving items:', error);
        // Fallback to localStorage
        localStorage.setItem('desktop_items', JSON.stringify(updatedItems));
      }
    }, 500);
  }, []);

  // Infinite canvas physics system (from infinitechess.org analysis)
  const updateCanvasPhysics = useCallback(() => {
    setCanvasState(prev => {
      const damping = 0.92;
      const newVelocity = {
        x: prev.velocity.x * damping,
        y: prev.velocity.y * damping,
        z: 0
      };
      
      const newPosition = {
        x: prev.position.x + newVelocity.x,
        y: prev.position.y + newVelocity.y,
        z: prev.position.z
      };

      // Stop animation if velocity is very small
      if (Math.abs(newVelocity.x) < 0.1 && Math.abs(newVelocity.y) < 0.1) {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = undefined;
        }
        return { ...prev, velocity: { x: 0, y: 0, z: 0 }, position: newPosition };
      }

      return { ...prev, velocity: newVelocity, position: newPosition };
    });

    animationRef.current = requestAnimationFrame(updateCanvasPhysics);
  }, []);

  // Canvas interaction handlers
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setCanvasState(prev => ({ ...prev, isDragging: true }));
    }
  }, []);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (canvasState.isDragging) {
      const deltaX = e.movementX;
      const deltaY = e.movementY;
      
      setCanvasState(prev => ({
        ...prev,
        position: {
          x: prev.position.x + deltaX,
          y: prev.position.y + deltaY,
          z: prev.position.z
        },
        momentum: { x: deltaX, y: deltaY }
      }));
    }
  }, [canvasState.isDragging]);

  const handleCanvasMouseUp = useCallback(() => {
    setCanvasState(prev => {
      if (prev.isDragging) {
        const newVelocity = {
          x: prev.momentum.x * 0.5,
          y: prev.momentum.y * 0.5,
          z: 0
        };
        
        // Start momentum animation
        if (!animationRef.current) {
          animationRef.current = requestAnimationFrame(updateCanvasPhysics);
        }
        
        return { ...prev, isDragging: false, velocity: newVelocity };
      }
      return prev;
    });
  }, [updateCanvasPhysics]);

  // Zoom handling
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setCanvasState(prev => ({
      ...prev,
      scale: Math.max(0.1, Math.min(3, prev.scale * scaleFactor))
    }));
  }, []);

  // Item creation
  const createItem = useCallback((type: string, position: Position) => {
    const newItem: DesktopItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: type as any,
      title: `New ${type}`,
      position,
      content: type === 'tabelle' ? [['ID', 'Name'], ['1', 'Platzhalter']] : '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: user?.id || 'anonymous'
    };

    setItems(prev => {
      const updated = [...prev, newItem];
      debouncedSave(updated);
      return updated;
    });
  }, [user, debouncedSave]);

  // Item update
  const updateItem = useCallback((id: string, updates: Partial<DesktopItem>) => {
    setItems(prev => {
      const updated = prev.map(item => 
        item.id === id ? { ...item, ...updates, updated_at: new Date().toISOString() } : item
      );
      debouncedSave(updated);
      return updated;
    });
  }, [debouncedSave]);

  // AI Agent Integration (based on archon analysis)
  const processAIRequest = useCallback(async (prompt: string) => {
    setAgentState(prev => ({ ...prev, status: 'processing', currentTask: prompt }));

    try {
      // Simulate multi-agent workflow
      setAgentState(prev => ({
        ...prev,
        agents: { ...prev.agents, reasoner: { active: true, status: 'analyzing' } }
      }));

      await new Promise(resolve => setTimeout(resolve, 1000));

      setAgentState(prev => ({
        ...prev,
        agents: { 
          ...prev.agents, 
          reasoner: { active: false, status: 'completed' },
          coder: { active: true, status: 'generating' }
        }
      }));

      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate content based on prompt
      const contentType = prompt.toLowerCase().includes('table') ? 'tabelle' : 
                         prompt.toLowerCase().includes('code') ? 'code' : 'notizzettel';
      
      createItem(contentType, {
        x: Math.random() * 400,
        y: Math.random() * 300,
        z: items.length + 1
      });

      setAgentState(prev => ({
        ...prev,
        status: 'completed',
        agents: { 
          ...prev.agents, 
          coder: { active: false, status: 'completed' },
          refiner: { active: true, status: 'finalizing' }
        }
      }));

      await new Promise(resolve => setTimeout(resolve, 500));

      setAgentState(prev => ({
        ...prev,
        agents: { 
          ...prev.agents, 
          refiner: { active: false, status: 'completed' }
        }
      }));

    } catch (error) {
      setAgentState(prev => ({ ...prev, status: 'error' }));
    }
  }, [items.length, createItem]);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          const { data: items } = await supabase
            .from('desktop_items')
            .select('*')
            .eq('user_id', user.id);
          
          if (items) {
            setItems(items);
          }
        } else {
          // Fallback to localStorage
          const saved = localStorage.getItem('desktop_items');
          if (saved) {
            setItems(JSON.parse(saved));
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="universal-desktop">
      {/* Header */}
      <div className="desktop-header">
        <div className="header-left">
          <div className="logo">🌌 SingularUniverse</div>
          <div className="user-info">
            {user ? `Welcome, ${user.email}` : 'Demo Mode'}
          </div>
        </div>
        
        <div className="header-center">
          <div className="canvas-controls">
            <button onClick={() => setCanvasState(prev => ({ ...prev, position: { x: 0, y: 0, z: 0 }, scale: 1 }))}>
              🎯 Reset
            </button>
            <span className="zoom-level">{Math.round(canvasState.scale * 100)}%</span>
          </div>
        </div>
        
        <div className="header-right">
          <button 
            className={`ai-toggle ${aiPanelVisible ? 'active' : ''}`}
            onClick={() => setAiPanelVisible(!aiPanelVisible)}
          >
            🤖 AI
          </button>
          <div className="settings">⚙️</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="desktop-content">
        {/* Infinite Canvas */}
        <div 
          className="infinite-canvas"
          ref={canvasRef}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onWheel={handleWheel}
          style={{
            transform: `translate(${canvasState.position.x}px, ${canvasState.position.y}px) scale(${canvasState.scale})`,
            cursor: canvasState.isDragging ? 'grabbing' : 'grab'
          }}
        >
          {items.map(item => (
            <div
              key={item.id}
              className={`desktop-item ${item.type}`}
              style={{
                left: item.position.x,
                top: item.position.y,
                zIndex: item.position.z
              }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="item-header">
                <span className="item-title">{item.title}</span>
                <div className="item-controls">
                  <button>📝</button>
                  <button>❌</button>
                </div>
              </div>
              <div className="item-content">
                {item.type === 'tabelle' && Array.isArray(item.content) ? (
                  <table>
                    <tbody>
                      {item.content.map((row, i) => (
                        <tr key={i}>
                          {row.map((cell, j) => (
                            <td key={j}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div>{item.content}</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* AI Panel */}
        {aiPanelVisible && (
          <div className="ai-panel">
            <div className="ai-header">
              <h3>🤖 KI-Assistant</h3>
              <div className={`ai-status ${agentState.status}`}>
                {agentState.status}
              </div>
            </div>
            
            <div className="agent-status">
              <div className={`agent reasoner ${agentState.agents.reasoner.active ? 'active' : ''}`}>
                <span>🧠 Reasoner</span>
                <span>{agentState.agents.reasoner.status}</span>
              </div>
              <div className={`agent coder ${agentState.agents.coder.active ? 'active' : ''}`}>
                <span>💻 Coder</span>
                <span>{agentState.agents.coder.status}</span>
              </div>
              <div className={`agent refiner ${agentState.agents.refiner.active ? 'active' : ''}`}>
                <span>✨ Refiner</span>
                <span>{agentState.agents.refiner.status}</span>
              </div>
            </div>

            <div className="ai-input">
              <input
                type="text"
                placeholder="Beschreibe was du erstellen möchtest..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    processAIRequest(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
              <button onClick={() => processAIRequest("Create a new note")}>
                🚀 Execute
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="desktop-sidebar">
        <div className="toolbox">
          <h3>🧰 Werkzeugkasten</h3>
          <div className="tools">
            {['notizzettel', 'tabelle', 'code', 'browser', 'terminal', 'calendar', 'media', 'chart'].map(tool => (
              <button
                key={tool}
                className={`tool ${selectedTool === tool ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedTool(tool);
                  createItem(tool, {
                    x: Math.random() * 400,
                    y: Math.random() * 300,
                    z: items.length + 1
                  });
                }}
              >
                {tool === 'notizzettel' && '📝'}
                {tool === 'tabelle' && '📊'}
                {tool === 'code' && '💻'}
                {tool === 'browser' && '🌐'}
                {tool === 'terminal' && '⚫'}
                {tool === 'calendar' && '📅'}
                {tool === 'media' && '🎬'}
                {tool === 'chart' && '📈'}
                <span>{tool}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversalDesktop;