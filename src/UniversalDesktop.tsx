import React, { useState, useEffect, useCallback, useRef } from 'react';
import { enhancedSupabase } from './services/supabaseClient';
import { useLiteLLM, AIResponseMetadata, liteLLMClient } from './services/litellmClient';
import LoginPage from './components/LoginPage';
import DesktopItem from './components/DesktopItem';
import ContextMenu from './components/ContextMenu';
import ImHexContextMenu from './components/ImHexContextMenu';
import ContextMenuActions from './components/ContextMenuActions';
import UnifiedContextMenu from './components/UnifiedContextMenu';
import ClipboardService from './services/ClipboardService';
import WindowSizingService from './services/WindowSizingService';
import ContextManager, { ContextItem } from './components/ContextManager';
import StarCraftMinimap from './components/StarCraftMinimap';
import './UniversalDesktop.css';
import './components/AIPanelScrollable.css';

// Types based on our analysis
interface Position {
  x: number;
  y: number;
  z: number;
}

interface Territory {
  id: string;
  name: string;
  bounds: { x: number; y: number; width: number; height: number };
  color: string;
  project: string;
  items: DesktopItemData[];
  createdAt: Date;
  lastAccessed: Date;
}

interface SpatialBookmark {
  id: string;
  name: string;
  position: Position;
  zoomLevel: number;
  context: string;
  timestamp: Date;
  territory?: string;
}

interface DesktopItemData {
  id: string;
  type: 'notizzettel' | 'tabelle' | 'code' | 'browser' | 'terminal' | 'tui' | 'media' | 'chart' | 'calendar';
  title: string;
  position: Position;
  content: any;
  created_at: string;
  updated_at: string;
  user_id: string;
  metadata?: Record<string, any>;
  width?: number;
  height?: number;
  is_contextual?: boolean;
}

interface ContextMenuData {
  visible: boolean;
  x: number;
  y: number;
  itemId?: string;
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

// Use enhanced Supabase client with fallback
const supabase = enhancedSupabase;

// Desktop Component (after login)
const DesktopPage: React.FC<{ session: any }> = ({ session }) => {
  // State management
  const [items, setItems] = useState<DesktopItemData[]>([]);
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
  const [aiMode, setAiMode] = useState<'chat' | 'tui' | 'code'>('chat');
  const [aiInput, setAiInput] = useState('');
  const [selectedModel, setSelectedModel] = useState<string>('reasoning');
  const [tokenUsage, setTokenUsage] = useState<{
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  } | null>(null);
  const [activeContextItems, setActiveContextItems] = useState<ContextItem[]>([]);
  const [minimapVisible, setMinimapVisible] = useState(true);
  const [minimapContextZones, setMinimapContextZones] = useState<{ [key: string]: boolean }>({});
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [spatialBookmarks, setSpatialBookmarks] = useState<SpatialBookmark[]>([]);
  const [showTerritoryBoundaries, setShowTerritoryBoundaries] = useState(true);
  const [autoGroupingEnabled, setAutoGroupingEnabled] = useState(true);
  const [currentZoomLevel, setCurrentZoomLevel] = useState<string>('SURFACE');
  
  // Suppress unused variable warnings for planned features
  void minimapContextZones;
  void setMinimapContextZones;
  
  // LiteLLM Hook
  const { 
    chat, 
    chatWithMetadata, 
    generateTUI, 
    generateTUIWithMetadata, 
    generateCode, 
    generateCodeWithMetadata,
    isLoading, 
    error, 
    clearError 
  } = useLiteLLM();
  
  // Suppress unused variable warnings for now
  void chat;
  void generateTUI;
  void generateCode;
  // Centralized Panel State Management System
  interface PanelState {
    tools: boolean;      // Werkzeugkasten/Tools Panel
    ai: boolean;         // KI-Assistent Panel  
    territory: boolean;  // Territory Management Panel
    minimap: boolean;    // StarCraft Minimap Panel
  }

  const [panelState, setPanelState] = useState<PanelState>({
    tools: true,      // Werkzeugkasten starts visible
    ai: false,        // KI-Assistent starts hidden
    territory: false, // Territory Management starts hidden  
    minimap: true     // StarCraft Minimap starts visible
  });

  // Panel toggle functions with legacy state sync
  const togglePanel = useCallback((panel: keyof PanelState) => {
    setPanelState(prev => {
      const newState = {
        ...prev,
        [panel]: !prev[panel]
      };
      
      // Sync with legacy state to preserve all functionality
      if (panel === 'tools') {
        setSidebarVisible(newState.tools);
      } else if (panel === 'ai') {
        setAiPanelVisible(newState.ai);
      } else if (panel === 'minimap') {
        setMinimapVisible(newState.minimap);
      }
      
      return newState;
    });
  }, []);

  // Legacy state (will be replaced)
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [selectedTool, setSelectedTool] = useState<string>('notizzettel');
  const [contextMenu, setContextMenu] = useState<ContextMenuData>({ visible: false, x: 0, y: 0 });
  const [advancedContextMenu, setAdvancedContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    targetItem?: DesktopItemData;
  }>({ visible: false, x: 0, y: 0 });
  const [unifiedContextMenu, setUnifiedContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    targetItem?: DesktopItemData;
    contextType: 'canvas' | 'window' | 'content';
  }>({ visible: false, x: 0, y: 0, contextType: 'canvas' });
  const [clipboardService] = useState(() => ClipboardService.getInstance());
  const [windowSizingService] = useState(() => WindowSizingService.getInstance());
  const [canPaste, setCanPaste] = useState(false);
  const [hasSelection] = useState(false);
  const user = session?.user;

  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number>();

  // Context Menu Actions instance
  const contextMenuActions = new ContextMenuActions({
    onReasonerAction: (item, action) => {
      console.log('Reasoner action:', action, 'on item:', item.id);
      // TODO: Implement reasoner actions
    },
    onCoderAction: (item, action) => {
      console.log('Coder action:', action, 'on item:', item.id);
      // TODO: Implement coder actions
    },
    onRefinerAction: (item, action) => {
      console.log('Refiner action:', action, 'on item:', item.id);
      // TODO: Implement refiner actions
    },
    onAddToContext: (item) => {
      toggleItemContext(item);
    },
    onRemoveFromContext: (item) => {
      toggleItemContext(item);
    },
    onExportItem: (item, format) => {
      console.log('Export item:', item.id, 'as:', format);
      // TODO: Implement export functionality
    },
    onTransformItem: (item, transformation) => {
      console.log('Transform item:', item.id, 'with:', transformation);
      // TODO: Implement transformation functionality
    },
    onVisualizeItem: (item, visualizationType) => {
      console.log('Visualize item:', item.id, 'as:', visualizationType);
      // TODO: Implement visualization functionality
    }
  });

  // Debounced save system from App.tsx analysis
  const debouncedSave = useCallback((updatedItems: DesktopItemData[]) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        for (const item of updatedItems) {
          // Prepare item for DB - all fields now supported
          const dbItem = {
            id: item.id,
            type: item.type,
            title: item.title,
            position: item.position,
            content: item.content,
            created_at: item.created_at,
            updated_at: new Date().toISOString(),
            user_id: user?.id || 'anonymous',
            metadata: item.metadata || {},
            width: item.width || 250,
            height: item.height || 200,
            is_contextual: item.is_contextual || false
          };
          
          if (import.meta.env.DEV) {
            console.log('🐛 DEBUG: Saving item to DB:', {
              id: dbItem.id,
              type: dbItem.type,
              title: dbItem.title,
              hasContent: !!dbItem.content,
              metadata: dbItem.metadata
            });
          }
          
          const { error } = await supabase
            .from('desktop_items')
            .upsert(dbItem);
            
          if (error) {
            console.error('🚨 DB Save Error:', error); // Immer loggen bei Fehlern
            throw error;
          }
        }
        if (import.meta.env.DEV) {
          console.log('✅ Items saved successfully to DB');
        }
      } catch (error) {
        console.error('❌ Error saving items to DB:', error);
        // Fallback to localStorage
        localStorage.setItem(`desktop_items_${user?.id || 'anonymous'}`, JSON.stringify(updatedItems));
        if (import.meta.env.DEV) {
          console.log('📦 Fallback: Items saved to localStorage');
        }
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

  // Canvas interaction handlers - PAN disabled, only minimap controls movement
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    // Disable canvas dragging - PAN is now minimap-exclusive
    void e; // Suppress unused parameter warning
    // if (e.target === canvasRef.current) {
    //   setCanvasState(prev => ({ ...prev, isDragging: true }));
    // }
  }, []);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    // Disable canvas dragging - PAN is now minimap-exclusive
    void e; // Suppress unused parameter warning
    // if (canvasState.isDragging) {
    //   const deltaX = e.movementX;
    //   const deltaY = e.movementY;
    //   
    //   setCanvasState(prev => ({
    //     ...prev,
    //     position: {
    //       x: prev.position.x + deltaX,
    //       y: prev.position.y + deltaY,
    //       z: prev.position.z
    //     },
    //     momentum: { x: deltaX, y: deltaY }
    //   }));
    // }
  }, []);

  const handleCanvasMouseUp = useCallback(() => {
    // Disable canvas dragging - PAN is now minimap-exclusive
    // setCanvasState(prev => {
    //   if (prev.isDragging) {
    //     const newVelocity = {
    //       x: prev.momentum.x * 0.5,
    //       y: prev.momentum.y * 0.5,
    //       z: 0
    //     };
    //     
    //     // Start momentum animation
    //     if (!animationRef.current) {
    //       animationRef.current = requestAnimationFrame(updateCanvasPhysics);
    //     }
    //     
    //     return { ...prev, isDragging: false, velocity: newVelocity };
    //   }
    //   return prev;
    // });
  }, []);

  // Minimap-Only Navigation: NO canvas zoom, all navigation via Minimap
  const handleWheel = useCallback((e: React.WheelEvent) => {
    const target = e.target as HTMLElement;
    
    // Allow normal scrolling in desktop items (TUI, Code, etc.)
    const desktopItem = target.closest('.desktop-item');
    const scrollableElement = target.closest('.tui-textarea, .code-editor, .ai-panel, .ai-panel-scrollable, .desktop-table-container, .desktop-code-container, .desktop-text-container, .item-content');
    
    if (desktopItem || scrollableElement) {
      // Allow default scrolling behavior for content inside desktop items
      return;
    }
    
    // NO canvas zoom - all zoom/pan via Minimap only
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // Minimap-exclusive zoom handler - FIXED onZoom chain
  const handleMinimapZoom = useCallback((zoomDelta: number) => {
    const scaleFactor = zoomDelta > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.1, Math.min(3, canvasState.scale * scaleFactor));
    
    // Debug minimap zoom handler
    if (import.meta.env.DEV) {
      console.log('🔍 HandleMinimapZoom Debug:', {
        zoomDelta,
        scaleFactor,
        currentScale: canvasState.scale,
        newScale,
        fixed: 'onZoom chain restored'
      });
    }
    
    setCanvasState(prev => ({
      ...prev,
      scale: newScale
    }));
  }, [canvasState.scale]);

  // Item creation with intelligent sizing
  const createItem = useCallback((type: string, position: Position, content?: any) => {
    // Default content for different types
    const defaultContent = content || (type === 'tabelle' ? [['ID', 'Name'], ['1', 'Platzhalter']] : '');
    
    // Calculate optimal dimensions using WindowSizingService
    const viewportInfo = {
      width: window.innerWidth,
      height: window.innerHeight - 80, // Subtract header height
      canvasPosition: canvasState.position,
      canvasScale: canvasState.scale
    };
    
    const existingWindows = items.map(item => ({
      position: item.position,
      width: item.width || 250,
      height: item.height || 200,
      id: item.id
    }));
    
    const optimalDimensions = windowSizingService.calculateOptimalSize(
      type,
      defaultContent,
      position,
      viewportInfo,
      existingWindows
    );
    
    if (import.meta.env.DEV) {
      console.log('🎯 Intelligent Window Sizing:', {
        type,
        originalPos: position,
        optimalDimensions,
        reason: optimalDimensions.reason
      });
    }

    const newItem: DesktopItemData = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: type as any,
      title: `New ${type}`,
      position: optimalDimensions.position,
      content: defaultContent,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: user?.id || 'anonymous',
      width: optimalDimensions.width,
      height: optimalDimensions.height
    };

    setItems(prev => {
      const updated = [...prev, newItem];
      debouncedSave(updated);
      return updated;
    });
  }, [user, debouncedSave, canvasState, items, windowSizingService]);

  // Item update
  const updateItem = useCallback((id: string, updates: Partial<DesktopItemData>) => {
    setItems(prev => {
      const updated = prev.map(item => 
        item.id === id ? { ...item, ...updates, updated_at: new Date().toISOString() } : item
      );
      debouncedSave(updated);
      return updated;
    });
  }, [debouncedSave]);

  // Context management functions
  const addToContext = useCallback((item: DesktopItemData) => {
    const contextItem: ContextItem = {
      id: item.id,
      title: item.title,
      type: 'window',
      content: typeof item.content === 'string' ? item.content : JSON.stringify(item.content)
    };
    
    setActiveContextItems(prev => {
      const exists = prev.find(ci => ci.id === item.id);
      if (exists) return prev;
      return [...prev, contextItem];
    });
    
    // Update is_contextual in database
    updateItem(item.id, { is_contextual: true });
  }, [updateItem]);

  const removeFromContext = useCallback((itemId: string) => {
    setActiveContextItems(prev => prev.filter(ci => ci.id !== itemId));
    
    // Update is_contextual in database
    updateItem(itemId, { is_contextual: false });
  }, [updateItem]);

  const clearAllContext = useCallback(() => {
    // Update all items to not be contextual
    activeContextItems.forEach(item => {
      updateItem(item.id, { is_contextual: false });
    });
    
    setActiveContextItems([]);
  }, [activeContextItems, updateItem]);

  const toggleItemContext = useCallback((item: DesktopItemData) => {
    const isInContext = activeContextItems.some(ci => ci.id === item.id);
    
    if (isInContext) {
      removeFromContext(item.id);
    } else {
      addToContext(item);
    }
  }, [activeContextItems, addToContext, removeFromContext]);

  // Minimap callback functions
  const handleMinimapViewportChange = useCallback((position: Position) => {
    setCanvasState(prev => ({
      ...prev,
      position: position
    }));
  }, []);

  const handleMinimapContextZoneClick = useCallback((zoneItems: DesktopItemData[]) => {
    // Smart context zone management - toggle all items in zone
    const zoneItemsInContext = zoneItems.filter(item => 
      activeContextItems.some(ci => ci.id === item.id)
    );
    
    if (zoneItemsInContext.length === zoneItems.length) {
      // All items in context -> remove all
      zoneItems.forEach(item => removeFromContext(item.id));
    } else {
      // Some or no items in context -> add all
      zoneItems.forEach(item => {
        const isInContext = activeContextItems.some(ci => ci.id === item.id);
        if (!isInContext) {
          addToContext(item);
        }
      });
    }
  }, [activeContextItems, addToContext, removeFromContext]);

  const toggleMinimapVisibility = useCallback(() => {
    setMinimapVisible(!minimapVisible);
  }, [minimapVisible]);

  // Territory Management Functions
  const calculateDBSCAN = useCallback((items: DesktopItemData[], epsilon: number = 500, minPoints: number = 2) => {
    const visited = new Set<string>();
    const clusters: DesktopItemData[][] = [];
    const noise: DesktopItemData[] = [];

    const getNeighbors = (item: DesktopItemData) => {
      return items.filter(other => {
        if (other.id === item.id) return false;
        const dx = item.position.x - other.position.x;
        const dy = item.position.y - other.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= epsilon;
      });
    };

    items.forEach(item => {
      if (visited.has(item.id)) return;
      
      const neighbors = getNeighbors(item);
      
      if (neighbors.length < minPoints) {
        noise.push(item);
        return;
      }
      
      const cluster: DesktopItemData[] = [item];
      visited.add(item.id);
      
      let i = 0;
      while (i < neighbors.length) {
        const neighbor = neighbors[i];
        
        if (!visited.has(neighbor.id)) {
          visited.add(neighbor.id);
          cluster.push(neighbor);
          
          const neighborNeighbors = getNeighbors(neighbor);
          if (neighborNeighbors.length >= minPoints) {
            neighbors.push(...neighborNeighbors.filter(n => !visited.has(n.id)));
          }
        }
        i++;
      }
      
      clusters.push(cluster);
    });

    return { clusters, noise };
  }, []);

  const generateTerritoryFromCluster = useCallback((cluster: DesktopItemData[], index: number): Territory => {
    const xs = cluster.map(item => item.position.x);
    const ys = cluster.map(item => item.position.y);
    
    const minX = Math.min(...xs) - 100;
    const maxX = Math.max(...xs) + 350; // Account for item width
    const minY = Math.min(...ys) - 100;
    const maxY = Math.max(...ys) + 300; // Account for item height
    
    const colors = [
      '#1a7f56', // Ullrich Green
      '#4a90e2', // Sky Blue  
      '#00bfff', // Protoss Blue
      '#6c7b7f', // Concrete Gray
      '#00ffcc', // Energy Cyan
      '#ff8c00', // Warning Orange
      '#ffcc00', // Premium Gold
      '#9932cc'  // Deep Purple
    ];
    
    return {
      id: `territory_${Date.now()}_${index}`,
      name: `Territory ${index + 1}`,
      bounds: {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
      },
      color: colors[index % colors.length],
      project: `Project ${index + 1}`,
      items: cluster,
      createdAt: new Date(),
      lastAccessed: new Date()
    };
  }, []);

  const updateTerritories = useCallback(() => {
    if (!autoGroupingEnabled || items.length === 0) return;
    
    const { clusters } = calculateDBSCAN(items, 500, 2);
    const newTerritories = clusters.map((cluster, index) => 
      generateTerritoryFromCluster(cluster, index)
    );
    
    setTerritories(newTerritories);
  }, [items, autoGroupingEnabled, calculateDBSCAN, generateTerritoryFromCluster]);

  const createSpatialBookmark = useCallback((name: string, territory?: Territory) => {
    const bookmark: SpatialBookmark = {
      id: `bookmark_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      position: canvasState.position,
      zoomLevel: canvasState.scale,
      context: `${items.length} items, ${activeContextItems.length} in context`,
      timestamp: new Date(),
      territory: territory?.id
    };
    
    setSpatialBookmarks(prev => [...prev, bookmark]);
    return bookmark;
  }, [canvasState, items, activeContextItems]);

  const navigateToBookmark = useCallback((bookmark: SpatialBookmark) => {
    setCanvasState(prev => ({
      ...prev,
      position: bookmark.position,
      scale: bookmark.zoomLevel
    }));
  }, []);

  const navigateToTerritory = useCallback((territory: Territory) => {
    const centerX = territory.bounds.x + territory.bounds.width / 2;
    const centerY = territory.bounds.y + territory.bounds.height / 2;
    
    setCanvasState(prev => ({
      ...prev,
      position: { x: -centerX + window.innerWidth / 2, y: -centerY + window.innerHeight / 2, z: 0 },
      scale: 0.8
    }));
    
    // Update last accessed and zoom level
    setTerritories(prev => prev.map(t => 
      t.id === territory.id 
        ? { ...t, lastAccessed: new Date() }
        : t
    ));
    setCurrentZoomLevel('SYSTEM');
  }, []);

  // Multi-Scale Navigation System
  const ZoomLevels = {
    GALAXY: { scale: 0.1, name: '🌌 Galaxy', description: 'Gesamtübersicht aller Projekte' },
    SYSTEM: { scale: 0.3, name: '🪐 System', description: 'Projekt-Übersicht' },
    PLANET: { scale: 0.7, name: '🌍 Planet', description: 'Arbeitsbereich-Ebene' },
    SURFACE: { scale: 1.0, name: '🏠 Surface', description: 'Detail-Ebene' },
    MICROSCOPE: { scale: 2.0, name: '🔬 Microscope', description: 'Ultra-Detail' }
  };

  const navigateToZoomLevel = useCallback((level: keyof typeof ZoomLevels, target?: Position) => {
    const zoomConfig = ZoomLevels[level];
    
    setCanvasState(prev => ({
      ...prev,
      scale: zoomConfig.scale,
      position: target || calculateOptimalPosition(zoomConfig.scale)
    }));
    
    setCurrentZoomLevel(level);
  }, []);

  const calculateOptimalPosition = useCallback((scale: number) => {
    if (territories.length === 0) return { x: 0, y: 0, z: 0 };
    
    // Calculate center of all territories
    const allBounds = territories.reduce((acc, territory) => {
      const centerX = territory.bounds.x + territory.bounds.width / 2;
      const centerY = territory.bounds.y + territory.bounds.height / 2;
      
      acc.minX = Math.min(acc.minX, centerX);
      acc.maxX = Math.max(acc.maxX, centerX);
      acc.minY = Math.min(acc.minY, centerY);
      acc.maxY = Math.max(acc.maxY, centerY);
      
      return acc;
    }, { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity });
    
    const centerX = (allBounds.minX + allBounds.maxX) / 2;
    const centerY = (allBounds.minY + allBounds.maxY) / 2;
    
    return {
      x: -centerX * scale + window.innerWidth / 2,
      y: -centerY * scale + window.innerHeight / 2,
      z: 0
    };
  }, [territories]);

  const getZoomLevelFromScale = useCallback((scale: number): string => {
    const levels = Object.entries(ZoomLevels);
    let closest = levels[0];
    let minDiff = Math.abs(scale - closest[1].scale);
    
    for (const [key, config] of levels) {
      const diff = Math.abs(scale - config.scale);
      if (diff < minDiff) {
        minDiff = diff;
        closest = [key, config];
      }
    }
    
    return closest[0];
  }, []);

  // Update zoom level when scale changes
  useEffect(() => {
    const detectedLevel = getZoomLevelFromScale(canvasState.scale);
    if (detectedLevel !== currentZoomLevel) {
      setCurrentZoomLevel(detectedLevel);
    }
  }, [canvasState.scale, currentZoomLevel, getZoomLevelFromScale]);

  // Strg+Pfeiltasten-Navigation System - Exponentiell-logarithmische Skalierung
  const handleKeyboardNavigation = useCallback((e: KeyboardEvent) => {
    // Only handle Ctrl+Arrow keys
    if (!e.ctrlKey) return;
    
    const isArrowKey = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key);
    if (!isArrowKey) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Exponentiell-logarithmische Bewegungsgeschwindigkeit für unendliche Desktops
    const baseSpeed = 80;
    
    // Je weniger Zoom (Galaxy-View), desto SCHNELLER die Bewegung
    // Je mehr Zoom (Detail-View), desto LANGSAMER die Bewegung
    const zoomFactor = canvasState.scale;
    
    // Exponentiell-logarithmische Formel: log(1/zoom) * multiplier
    // Bei 0.1 scale (Galaxy) → schnell (log(10) ≈ 2.3)
    // Bei 1.0 scale (Surface) → normal (log(1) = 0, aber minimum)
    // Bei 2.0 scale (Microscope) → langsam (log(0.5) ≈ -0.7)
    const logMultiplier = Math.log(1 / zoomFactor) + 1; // +1 für minimum speed
    const exponentialSpeed = baseSpeed * Math.max(0.3, Math.min(5.0, logMultiplier));
    
    // Calculate movement delta
    let deltaX = 0;
    let deltaY = 0;
    
    switch (e.key) {
      case 'ArrowUp':
        deltaY = exponentialSpeed;
        break;
      case 'ArrowDown':
        deltaY = -exponentialSpeed;
        break;
      case 'ArrowLeft':
        deltaX = exponentialSpeed;
        break;
      case 'ArrowRight':
        deltaX = -exponentialSpeed;
        break;
    }
    
    // Apply movement through minimap-style navigation
    setCanvasState(prev => ({
      ...prev,
      position: {
        x: prev.position.x + deltaX,
        y: prev.position.y + deltaY,
        z: prev.position.z
      }
    }));
    
    // Visual feedback
    if (import.meta.env.DEV) {
      console.log(`🎮 Keyboard Navigation: ${e.key} (${Math.round(deltaX)}, ${Math.round(deltaY)}) at zoom ${Math.round(canvasState.scale * 100)}% | Speed: ${Math.round(exponentialSpeed)}`);
    }
  }, [canvasState.scale]);

  // Enhanced keyboard shortcuts
  const handleKeyboardShortcuts = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey) {
      switch (e.key) {
        case 'h': // Ctrl+H - Home position
          e.preventDefault();
          setCanvasState(prev => ({ ...prev, position: { x: 0, y: 0, z: 0 } }));
          break;
        case 'r': // Ctrl+R - Reset zoom
          e.preventDefault();
          setCanvasState(prev => ({ ...prev, scale: 1.0 }));
          navigateToZoomLevel('SURFACE');
          break;
        case '1': // Ctrl+1 - Galaxy view
          e.preventDefault();
          navigateToZoomLevel('GALAXY');
          break;
        case '2': // Ctrl+2 - System view
          e.preventDefault();
          navigateToZoomLevel('SYSTEM');
          break;
        case '3': // Ctrl+3 - Planet view
          e.preventDefault();
          navigateToZoomLevel('PLANET');
          break;
        case '4': // Ctrl+4 - Surface view
          e.preventDefault();
          navigateToZoomLevel('SURFACE');
          break;
        case '5': // Ctrl+5 - Microscope view
          e.preventDefault();
          navigateToZoomLevel('MICROSCOPE');
          break;
        case 'b': // Ctrl+B - Create bookmark
          e.preventDefault();
          const name = prompt('Bookmark Name:', `View ${spatialBookmarks.length + 1}`);
          if (name) createSpatialBookmark(name);
          break;
        case 't': // Ctrl+T - Toggle territories
          e.preventDefault();
          setShowTerritoryBoundaries(!showTerritoryBoundaries);
          break;
        case 'm': // Ctrl+M - Toggle minimap
          e.preventDefault();
          setMinimapVisible(!minimapVisible);
          break;
      }
    }
  }, [navigateToZoomLevel, spatialBookmarks, createSpatialBookmark, showTerritoryBoundaries, minimapVisible]);

  // Keyboard event listeners
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      handleKeyboardNavigation(e);
      handleKeyboardShortcuts(e);
    };
    
    window.addEventListener('keydown', handleGlobalKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [handleKeyboardNavigation, handleKeyboardShortcuts]);

  // Item deletion
  const deleteItem = useCallback(async (id: string) => {
    try {
      // Sofortiges Entfernen aus der UI
      setItems(prev => prev.filter(item => item.id !== id));
      
      // Aus Datenbank löschen
      await supabase
        .from('desktop_items')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id || 'anonymous');
      
      console.log(`Item ${id} deleted successfully`);
    } catch (error) {
      console.error('Error deleting item:', error);
      // Bei Fehler: Item aus localStorage entfernen
      const saved = localStorage.getItem(`desktop_items_${user?.id || 'anonymous'}`);
      if (saved) {
        const items = JSON.parse(saved);
        const filtered = items.filter((item: any) => item.id !== id);
        localStorage.setItem(`desktop_items_${user?.id || 'anonymous'}`, JSON.stringify(filtered));
      }
    }
  }, [user, supabase]);

  // Item rename
  const renameItem = useCallback((id: string, newTitle: string) => {
    updateItem(id, { title: newTitle });
  }, [updateItem]);

  // Smart clipboard detection - only when context menu opens
  const checkClipboardStatus = useCallback(async () => {
    try {
      const canPasteResult = await clipboardService.canPaste();
      setCanPaste(canPasteResult);
      return canPasteResult;
    } catch (error) {
      // Silently handle clipboard access errors - no console warnings
      setCanPaste(false);
      return false;
    }
  }, [clipboardService]);

  // Context menu handlers
  const handleContextMenu = useCallback(async (e: React.MouseEvent, itemId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check clipboard status only when context menu opens (user activation)
    await checkClipboardStatus();
    
    // Use UnifiedContextMenu instead of old ContextMenu
    const targetItem = itemId ? items.find(item => item.id === itemId) : undefined;
    
    setUnifiedContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      targetItem,
      contextType: targetItem ? 'window' : 'canvas'
    });
  }, [items, checkClipboardStatus]);

  const closeContextMenu = useCallback(() => {
    setContextMenu(prev => ({ ...prev, visible: false }));
    setAdvancedContextMenu(prev => ({ ...prev, visible: false }));
    setUnifiedContextMenu(prev => ({ ...prev, visible: false }));
  }, []);

  const handleCanvasContextMenu = useCallback((e: React.MouseEvent) => {
    // Nur bei Klick auf Canvas selbst, nicht auf Items
    if (e.target === canvasRef.current) {
      handleContextMenu(e);
    }
  }, [handleContextMenu]);

  // Advanced context menu handler for titlebar clicks
  const handleTitleBarClick = useCallback(async (e: React.MouseEvent, itemId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check clipboard status only when context menu opens (user activation)
    await checkClipboardStatus();
    
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    
    // Use UnifiedContextMenu for titlebar clicks too
    setUnifiedContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      targetItem: item,
      contextType: 'window'
    });
  }, [items, checkClipboardStatus]);

  // Unified Context Menu Handlers
  const handleUnifiedContextAction = useCallback((actionId: string, item?: DesktopItemData) => {
    switch (actionId) {
      case 'new-note':
        const notePosition = windowSizingService.getSmartPosition(
          unifiedContextMenu.x,
          unifiedContextMenu.y,
          canvasState.position,
          canvasState.scale,
          'right'
        );
        createItem('notizzettel', notePosition);
        break;
      case 'new-table':
        const tablePosition = windowSizingService.getSmartPosition(
          unifiedContextMenu.x,
          unifiedContextMenu.y,
          canvasState.position,
          canvasState.scale,
          'right'
        );
        createItem('tabelle', tablePosition);
        break;
      case 'ai-help':
        setAiPanelVisible(true);
        break;
      case 'rename':
        if (item) {
          const newTitle = prompt('Neuer Titel:', item.title);
          if (newTitle) renameItem(item.id, newTitle);
        }
        break;
      case 'delete':
        if (item) {
          deleteItem(item.id);
        }
        break;
      case 'export-json':
        if (item) {
          clipboardService.exportAsJSON(item);
        }
        break;
      case 'export-csv':
        if (item) {
          clipboardService.exportAsCSV(item);
        }
        break;
      case 'export-clipboard':
        if (item) {
          clipboardService.copy(item);
        }
        break;
      case 'format':
      case 'clean':
      case 'refactor':
      case 'sort':
      case 'filter':
      case 'ascii-convert':
      case 'theme-switch':
      case 'create-chart':
      case 'create-flowchart':
      case 'view-structure':
        // TODO: Implement transformation actions
        console.log('Action:', actionId, 'on item:', item?.id);
        break;
      case 'priority-high':
      case 'priority-medium':
      case 'priority-low':
        // TODO: Implement priority system
        console.log('Priority action:', actionId, 'on item:', item?.id);
        break;
      default:
        console.log('Unknown action:', actionId);
    }
  }, [unifiedContextMenu, canvasState, items, createItem, renameItem, deleteItem, clipboardService]);

  const handleClipboardAction = useCallback(async (action: 'cut' | 'copy' | 'paste', item?: DesktopItemData) => {
    if (!item) return;
    
    switch (action) {
      case 'copy':
        await clipboardService.copy(item);
        break;
      case 'cut':
        const cutResult = await clipboardService.cut(item);
        if (cutResult.success && cutResult.newContent !== undefined) {
          updateItem(item.id, { content: cutResult.newContent });
        }
        break;
      case 'paste':
        const pasteResult = await clipboardService.paste(item);
        if (pasteResult.success && pasteResult.newContent !== undefined) {
          updateItem(item.id, { content: pasteResult.newContent });
        }
        break;
    }
  }, [clipboardService, updateItem]);

  const handleAIAction = useCallback((action: string, item?: DesktopItemData) => {
    if (!item) return;
    
    switch (action) {
      case 'reasoner':
        // Add item to context and trigger reasoner
        addToContext(item);
        setAiPanelVisible(true);
        setAiMode('chat');
        setAiInput(`Analyze this ${item.type}: ${item.title}`);
        break;
      case 'coder':
        // Add item to context and trigger coder
        addToContext(item);
        setAiPanelVisible(true);
        setAiMode('code');
        setAiInput(`Generate code for: ${item.title}`);
        break;
      case 'refiner':
        // Add item to context and trigger refiner
        addToContext(item);
        setAiPanelVisible(true);
        setAiMode('chat');
        setAiInput(`Refine and improve: ${item.title}`);
        break;
      case 'full-chain':
        // Add item to context and trigger full chain
        addToContext(item);
        setAiPanelVisible(true);
        setAiMode('chat');
        setAiInput(`Full analysis and improvement for: ${item.title}`);
        break;
    }
  }, [addToContext, setAiPanelVisible, setAiMode, setAiInput]);

  // AI Agent Integration with LiteLLM
  const processAIRequest = useCallback(async (prompt: string) => {
    if (!prompt.trim()) return;
    
    setAgentState(prev => ({ ...prev, status: 'processing', currentTask: prompt }));
    clearError();

    try {
      // Reasoner phase
      setAgentState(prev => ({
        ...prev,
        agents: { ...prev.agents, reasoner: { active: true, status: 'analyzing' } }
      }));

      await new Promise(resolve => setTimeout(resolve, 500));

      // Coder phase
      setAgentState(prev => ({
        ...prev,
        agents: { 
          ...prev.agents, 
          reasoner: { active: false, status: 'completed' },
          coder: { active: true, status: 'generating' }
        }
      }));

      let aiResponse: AIResponseMetadata;

      // Build context prompt from active context items
      let contextPrompt = '';
      if (activeContextItems.length > 0) {
        contextPrompt = '=== CONTEXT ===\n';
        activeContextItems.forEach(item => {
          contextPrompt += `[${item.type}: ${item.title}]\n${item.content}\n\n`;
        });
        contextPrompt += '=== USER REQUEST ===\n';
      }
      
      const fullPrompt = contextPrompt + prompt;

      // Generate content based on AI mode using metadata system
      switch (aiMode) {
        case 'tui':
          aiResponse = await generateTUIWithMetadata(fullPrompt, {
            width: 80,
            height: 25,
            theme: 'green',
            model: liteLLMClient.getRecommendedModels()[selectedModel]
          });
          break;
          
        case 'code':
          aiResponse = await generateCodeWithMetadata(fullPrompt, {
            language: 'typescript',
            model: liteLLMClient.getRecommendedModels()[selectedModel]
          });
          break;
          
        default: // chat
          aiResponse = await chatWithMetadata(fullPrompt, {
            context: `Desktop with ${items.length} items, ${activeContextItems.length} in context`,
            model: liteLLMClient.getRecommendedModels()[selectedModel]
          });
          break;
      }

      // Update token usage
      if (aiResponse.tokenUsage) {
        setTokenUsage(aiResponse.tokenUsage);
      }

      // Refiner phase
      setAgentState(prev => ({
        ...prev,
        agents: { 
          ...prev.agents, 
          coder: { active: false, status: 'completed' },
          refiner: { active: true, status: 'finalizing' }
        }
      }));

      await new Promise(resolve => setTimeout(resolve, 300));

      // Use intelligent sizing for AI-generated content
      const basePosition = {
        x: Math.random() * 400,
        y: Math.random() * 300,
        z: items.length + 1
      };
      
      const viewportInfo = {
        width: window.innerWidth,
        height: window.innerHeight - 80,
        canvasPosition: canvasState.position,
        canvasScale: canvasState.scale
      };
      
      const existingWindows = items.map(item => ({
        position: item.position,
        width: item.width || 250,
        height: item.height || 200,
        id: item.id
      }));
      
      const optimalDimensions = windowSizingService.calculateOptimalSize(
        aiResponse.windowType,
        aiResponse.content,
        basePosition,
        viewportInfo,
        existingWindows
      );
      
      if (import.meta.env.DEV) {
        console.log('🤖 AI Window Sizing:', {
          type: aiResponse.windowType,
          aiMode,
          optimalDimensions,
          reason: optimalDimensions.reason
        });
      }

      // Create new desktop item with AI-generated content and metadata
      const newItem: DesktopItemData = {
        id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: aiResponse.windowType,
        title: aiResponse.caption,
        position: optimalDimensions.position,
        content: aiResponse.content,
        metadata: {
          ...aiResponse.metadata,
          aiGenerated: true,
          aiMode: aiMode,
          aiPrompt: prompt,
          aiInstruction: aiResponse.instruction,
          aiTransformation: aiResponse.transformation,
          aiDataType: aiResponse.dataType,
          generatedAt: new Date().toISOString()
        },
        width: optimalDimensions.width,
        height: optimalDimensions.height,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: user?.id || 'anonymous'
      };

      if (import.meta.env.DEV) {
        console.log('🐛 DEBUG: Creating new item:', {
          type: aiResponse.windowType,
          title: aiResponse.caption,
          content: aiResponse.content,
          metadata: newItem.metadata
        });
      }

      setItems(prev => [...prev, newItem]);
      debouncedSave([...items, newItem]);

      setAgentState(prev => ({
        ...prev,
        status: 'completed',
        agents: { 
          ...prev.agents, 
          refiner: { active: false, status: 'completed' }
        }
      }));

      setTimeout(() => {
        setAgentState(prev => ({ ...prev, status: 'idle' }));
      }, 1000);

    } catch (error) {
      console.error('AI request failed:', error);
      setAgentState(prev => ({ ...prev, status: 'error' }));
    }
  }, [aiMode, generateTUIWithMetadata, generateCodeWithMetadata, chatWithMetadata, clearError, items, user, debouncedSave, activeContextItems]);

  // Auto-update territories when items change
  useEffect(() => {
    updateTerritories();
  }, [items, updateTerritories]);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;

      try {
        // Try to load from Supabase
        const { data: items } = await supabase
          .from('desktop_items')
          .select('*')
          .eq('user_id', user.id);
        
        if (items && items.length > 0) {
          if (import.meta.env.DEV) {
            console.log('🐛 DEBUG: Loading items from DB:', items.map((item: any) => ({ 
              id: item.id, 
              type: item.type, 
              title: item.title, 
              hasContent: !!item.content,
              metadata: item.metadata 
            })));
          }
          setItems(items);
          
          // Load contextual items into active context
          const contextualItems = items.filter((item: DesktopItemData) => item.is_contextual);
          const contextItems: ContextItem[] = contextualItems.map((item: DesktopItemData) => ({
            id: item.id,
            title: item.title,
            type: 'window',
            content: typeof item.content === 'string' ? item.content : JSON.stringify(item.content)
          }));
          setActiveContextItems(contextItems);
        } else {
          // Fallback to localStorage
          const saved = localStorage.getItem(`desktop_items_${user.id}`);
          if (saved) {
            const parsedItems = JSON.parse(saved);
            setItems(parsedItems);
            
            // Load contextual items from localStorage
            const contextualItems = parsedItems.filter((item: DesktopItemData) => item.is_contextual);
            const contextItems: ContextItem[] = contextualItems.map((item: DesktopItemData) => ({
              id: item.id,
              title: item.title,
              type: 'window',
              content: typeof item.content === 'string' ? item.content : JSON.stringify(item.content)
            }));
            setActiveContextItems(contextItems);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to localStorage
        const saved = localStorage.getItem(`desktop_items_${user.id}`);
        if (saved) {
          const parsedItems = JSON.parse(saved);
          setItems(parsedItems);
          
          // Load contextual items from localStorage
          const contextualItems = parsedItems.filter((item: DesktopItemData) => item.is_contextual);
          const contextItems: ContextItem[] = contextualItems.map((item: DesktopItemData) => ({
            id: item.id,
            title: item.title,
            type: 'window',
            content: typeof item.content === 'string' ? item.content : JSON.stringify(item.content)
          }));
          setActiveContextItems(contextItems);
        }
      }
    };

    loadData();
  }, [user?.id]);

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
          
          {/* Multi-Scale Navigation */}
          <div className="multi-scale-navigation">
            <div className="scale-level-indicator">
              <span className="current-level">{ZoomLevels[currentZoomLevel as keyof typeof ZoomLevels]?.name}</span>
              <span className="level-description">{ZoomLevels[currentZoomLevel as keyof typeof ZoomLevels]?.description}</span>
            </div>
            <div className="zoom-level-buttons">
              {Object.entries(ZoomLevels).map(([key, config]) => (
                <button
                  key={key}
                  className={`zoom-level-btn ${currentZoomLevel === key ? 'active' : ''}`}
                  onClick={() => navigateToZoomLevel(key as keyof typeof ZoomLevels)}
                  title={`${config.name} - ${config.description}`}
                >
                  {config.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
          
          {/* Keyboard Navigation Hints */}
          <div className="keyboard-navigation-hints">
            <div className="nav-hint">
              <span className="hint-label">🎮 Navigation:</span>
              <span className="hint-key">Ctrl+↑↓←→</span>
              <span className="hint-separator">|</span>
              <span className="hint-key">Ctrl+1-5</span>
            </div>
          </div>
        </div>
        
        <div className="header-right">
          <button 
            className={`ai-toggle ${panelState.tools ? 'active' : ''}`}
            onClick={() => togglePanel('tools')}
            title="Werkzeugkasten Panel ein/ausblenden"
          >
            🧰 Tools
          </button>
          <button 
            className={`ai-toggle ${panelState.ai ? 'active' : ''}`}
            onClick={() => togglePanel('ai')}
            title="KI-Assistent Panel ein/ausblenden"
          >
            🤖 AI
          </button>
          <button 
            className={`ai-toggle ${panelState.territory ? 'active' : ''}`}
            onClick={() => togglePanel('territory')}
            title="Territory Management Panel ein/ausblenden"
          >
            🏛️ Territories
          </button>
          <button 
            className={`ai-toggle ${panelState.minimap ? 'active' : ''}`}
            onClick={() => togglePanel('minimap')}
            title="StarCraft Minimap Panel ein/ausblenden"
          >
            🗺️ Map
          </button>
          
          {/* Territory Boundaries Toggle - separate from Territory Panel */}
          <button 
            className={`ai-toggle ${showTerritoryBoundaries ? 'active' : ''}`}
            onClick={() => setShowTerritoryBoundaries(!showTerritoryBoundaries)}
            title="Territory Boundaries ein/ausblenden"
          >
            🌍 Boundaries
          </button>
          <button 
            className="logout-button"
            onClick={() => supabase.auth.signOut()}
            title="Logout"
          >
            🚪 Logout
          </button>
          <div className="settings">⚙️</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="desktop-content">
        {/* Tools Panel (Werkzeugkasten) - Enhanced Architecture */}
        {(panelState.tools || sidebarVisible) && (
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
            
            {/* Territory Management moved to standalone panel */}
            
            <div className="sidebar-section">
              <div className="spatial-bookmarks">
                <h4>📍 Spatial Bookmarks</h4>
                <button
                  className="create-bookmark-btn"
                  onClick={() => {
                    const name = prompt('Bookmark Name:', `View ${spatialBookmarks.length + 1}`);
                    if (name) createSpatialBookmark(name);
                  }}
                >
                  ➕ Create Bookmark
                </button>
                
                <div className="bookmarks-list">
                  {spatialBookmarks.map(bookmark => (
                    <div
                      key={bookmark.id}
                      className="bookmark-item"
                      style={{
                        padding: '6px',
                        margin: '2px 0',
                        background: '#e3f2fd',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                      onClick={() => navigateToBookmark(bookmark)}
                    >
                      <div>{bookmark.name}</div>
                      <div style={{ opacity: 0.7 }}>
                        {Math.round(bookmark.zoomLevel * 100)}% • {bookmark.context}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Multi-Scale Quick Navigation */}
              <div className="multi-scale-panel">
                <h4>🌌 Multi-Scale Navigation</h4>
                <div className="scale-buttons">
                  {Object.entries(ZoomLevels).map(([key, config]) => (
                    <button
                      key={key}
                      className={`scale-btn ${currentZoomLevel === key ? 'active' : ''}`}
                      onClick={() => navigateToZoomLevel(key as keyof typeof ZoomLevels)}
                      title={config.description}
                    >
                      <span className="scale-icon">{config.name.split(' ')[0]}</span>
                      <span className="scale-label">{config.name.split(' ')[1]}</span>
                      <span className="scale-percent">{Math.round(config.scale * 100)}%</span>
                    </button>
                  ))}
                </div>
                
                <div className="current-scale-info">
                  <div className="scale-indicator">
                    <span>Current: {ZoomLevels[currentZoomLevel as keyof typeof ZoomLevels]?.name}</span>
                    <span className="scale-desc">{ZoomLevels[currentZoomLevel as keyof typeof ZoomLevels]?.description}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Infinite Canvas */}
        <div 
          className="infinite-canvas"
          ref={canvasRef}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onWheel={handleWheel}
          onContextMenu={handleCanvasContextMenu}
          onClick={closeContextMenu}
          style={{
            transform: `translate(${canvasState.position.x}px, ${canvasState.position.y}px) scale(${canvasState.scale})`,
            cursor: 'default' // No more grab cursor - PAN is minimap-exclusive
          }}
        >
          {/* Territory Boundaries */}
          {showTerritoryBoundaries && territories.map(territory => (
            <div
              key={territory.id}
              className="territory-boundary"
              style={{
                position: 'absolute',
                left: territory.bounds.x,
                top: territory.bounds.y,
                width: territory.bounds.width,
                height: territory.bounds.height,
                border: `2px dashed ${territory.color}`,
                borderRadius: '8px',
                backgroundColor: `${territory.color}15`,
                pointerEvents: 'none',
                zIndex: 0
              }}
            >
              <div
                className="territory-label"
                style={{
                  position: 'absolute',
                  top: -30,
                  left: 10,
                  background: territory.color,
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              >
                {territory.name} ({territory.items.length} items)
              </div>
            </div>
          ))}
          
          {/* Desktop Items */}
          {items.map(item => (
            <DesktopItem
              key={item.id}
              item={item}
              onUpdate={updateItem}
              onDelete={deleteItem}
              onRename={renameItem}
              onContextMenu={handleContextMenu}
              onTitleBarClick={handleTitleBarClick}
              onToggleContext={toggleItemContext}
              isInContext={activeContextItems.some(ci => ci.id === item.id)}
            />
          ))}
        </div>

        {/* AI Panel - Enhanced Architecture */}
        {(panelState.ai || aiPanelVisible) && (
          <div className="ai-panel">
            <div className="ai-header">
              <h3>🤖 KI-Assistant</h3>
              <div className={`ai-status ${agentState.status}`}>
                {isLoading ? 'processing' : agentState.status}
              </div>
            </div>
            
            {/* Mode Selector */}
            <div className="ai-mode-selector">
              <button 
                className={`mode-btn ${aiMode === 'chat' ? 'active' : ''}`}
                onClick={() => setAiMode('chat')}
              >
                💬 Chat
              </button>
              <button 
                className={`mode-btn ${aiMode === 'tui' ? 'active' : ''}`}
                onClick={() => setAiMode('tui')}
              >
                🖥️ TUI
              </button>
              <button 
                className={`mode-btn ${aiMode === 'code' ? 'active' : ''}`}
                onClick={() => setAiMode('code')}
              >
                💻 Code
              </button>
            </div>

            {/* Model Selection */}
            <div className="ai-model-selector">
              <label>🤖 Model:</label>
              <select 
                value={selectedModel} 
                onChange={(e) => setSelectedModel(e.target.value)}
              >
                {Object.entries(liteLLMClient.getModelCategories()).map(([key, info]) => (
                  <option key={key} value={key}>
                    {info.icon} {info.model} - {info.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Scrollable Content Area */}
            <div className="ai-panel-scrollable">
              {/* Token Usage Display */}
              {tokenUsage && (
                <div className="token-usage">
                  <div className="token-stat">
                    <span>📥 Prompt: {tokenUsage.prompt_tokens}</span>
                  </div>
                  <div className="token-stat">
                    <span>📤 Response: {tokenUsage.completion_tokens}</span>
                  </div>
                  <div className="token-stat total">
                    <span>🔢 Total: {tokenUsage.total_tokens}</span>
                  </div>
                </div>
              )}

              {/* Context Manager */}
              <ContextManager
                items={activeContextItems}
                onRemoveItem={removeFromContext}
                onClearAll={clearAllContext}
                maxTokens={100000}
              />

              {/* Error Display */}
              {error && (
                <div className="ai-error">
                  <span>❌ {error}</span>
                  <button onClick={clearError}>×</button>
                </div>
              )}
              
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
            </div>

            <div className="ai-input">
              <textarea
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder={`${aiMode === 'chat' ? 'Chat-Nachricht...' : 
                              aiMode === 'tui' ? 'Beschreibe die Terminal-UI...' : 
                              'Beschreibe den Code...'}`}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    processAIRequest(aiInput);
                    setAiInput('');
                  }
                }}
                disabled={isLoading}
                rows={3}
              />
              <button 
                onClick={() => {
                  processAIRequest(aiInput);
                  setAiInput('');
                }}
                disabled={isLoading || !aiInput.trim()}
              >
                {isLoading ? '⏳' : '🚀'} {aiMode === 'chat' ? 'Send' : 'Generate'}
              </button>
            </div>
          </div>
        )}

        {/* Territory Management Panel - NEW STANDALONE PANEL */}
        {panelState.territory && (
          <div className="territory-management-panel">
            <div className="panel-header">
              <h3>🏛️ Territory Management</h3>
              <button 
                className="panel-close-btn"
                onClick={() => togglePanel('territory')}
                title="Territory Panel schließen"
              >
                ✕
              </button>
            </div>
            
            <div className="panel-content">
              <div className="territory-controls">
                <label>
                  <input
                    type="checkbox"
                    checked={autoGroupingEnabled}
                    onChange={(e) => setAutoGroupingEnabled(e.target.checked)}
                  />
                  Auto-Grouping
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={showTerritoryBoundaries}
                    onChange={(e) => setShowTerritoryBoundaries(e.target.checked)}
                  />
                  Show Boundaries
                </label>
              </div>
              
              <div className="territories-list">
                <h4>🏛️ Active Territories</h4>
                {territories.map(territory => (
                  <div
                    key={territory.id}
                    className="territory-item"
                    style={{
                      borderLeft: `4px solid ${territory.color}`,
                      padding: '8px',
                      margin: '4px 0',
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                    onClick={() => navigateToTerritory(territory)}
                  >
                    <div className="territory-name">{territory.name}</div>
                    <div className="territory-info">
                      {territory.items.length} items • {territory.project}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="spatial-bookmarks">
                <h4>📍 Spatial Bookmarks</h4>
                <button
                  className="create-bookmark-btn"
                  onClick={() => {
                    const name = prompt('Bookmark Name:', `View ${spatialBookmarks.length + 1}`);
                    if (name) createSpatialBookmark(name);
                  }}
                >
                  ➕ Create Bookmark
                </button>
                
                <div className="bookmarks-list">
                  {spatialBookmarks.map(bookmark => (
                    <div
                      key={bookmark.id}
                      className="bookmark-item"
                      style={{
                        padding: '6px',
                        margin: '2px 0',
                        background: 'rgba(227, 242, 253, 0.1)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                      onClick={() => navigateToBookmark(bookmark)}
                    >
                      <div>{bookmark.name}</div>
                      <div style={{ opacity: 0.7 }}>
                        {Math.round(bookmark.zoomLevel * 100)}% • {bookmark.context}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* StarCraft Minimap */}
      {/* StarCraft Minimap - Enhanced Panel Architecture (PRESERVE ALL FUNCTIONALITY) */}
      <StarCraftMinimap
        items={items}
        viewport={{
          position: canvasState.position,
          scale: canvasState.scale,
          width: window.innerWidth,
          height: window.innerHeight - 80 // Subtract header height
        }}
        onViewportChange={handleMinimapViewportChange}
        onContextZoneClick={handleMinimapContextZoneClick}
        onZoom={handleMinimapZoom}
        canvasSize={{ width: 4000, height: 4000 }} // Large canvas for infinite feel
        visible={panelState.minimap && minimapVisible} // Enhanced visibility logic
        onToggleVisibility={() => {
          // Sync both state systems to preserve functionality
          togglePanel('minimap');
          toggleMinimapVisibility();
        }}
      />

      {/* Context Menu */}
      <ContextMenu
        visible={contextMenu.visible}
        x={contextMenu.x}
        y={contextMenu.y}
        onClose={closeContextMenu}
        onToggleAI={() => setAiPanelVisible(!aiPanelVisible)}
        onRename={contextMenu.itemId ? (itemId: string) => {
          const newTitle = prompt('Neuer Titel:', 'Neuer Name');
          if (newTitle) renameItem(itemId, newTitle);
        } : undefined}
        onDelete={contextMenu.itemId ? deleteItem : undefined}
        itemId={contextMenu.itemId}
      />

      {/* Advanced Context Menu for Titlebar Clicks */}
      <ImHexContextMenu
        visible={advancedContextMenu.visible}
        position={{ x: advancedContextMenu.x, y: advancedContextMenu.y }}
        onClose={closeContextMenu}
        targetItem={advancedContextMenu.targetItem}
        items={advancedContextMenu.targetItem ? contextMenuActions.getContextMenuItems(advancedContextMenu.targetItem) : []}
      />

      {/* Unified Context Menu - The New Universal Solution */}
      <UnifiedContextMenu
        visible={unifiedContextMenu.visible}
        position={{ x: unifiedContextMenu.x, y: unifiedContextMenu.y, z: 0 }}
        targetItem={unifiedContextMenu.targetItem}
        contextType={unifiedContextMenu.contextType}
        onClose={closeContextMenu}
        onAction={handleUnifiedContextAction}
        onClipboardAction={handleClipboardAction}
        onAIAction={handleAIAction}
        onContextToggle={toggleItemContext}
        canPaste={canPaste}
        hasSelection={hasSelection}
      />
    </div>
  );
};

// Main App Component with Authentication
const UniversalDesktop: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleLogin = (session: any) => {
    setSession(session);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
          <div className="loading-text">🌌 UniversalDesktop</div>
          <div className="loading-subtitle">Lade Session...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {!session ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <DesktopPage session={session} />
      )}
    </div>
  );
};

export default UniversalDesktop;