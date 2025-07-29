/**
 * 🏗️ UniversalDesktop Core Types
 * Centralized type definitions for modular architecture
 */

export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface Territory {
  id: string;
  name: string;
  bounds: { x: number; y: number; width: number; height: number };
  color: string;
  project: string;
  items: DesktopItemData[];
  createdAt: Date;
  lastAccessed: Date;
}

export interface SpatialBookmark {
  id: string;
  name: string;
  position: Position;
  zoomLevel: number;
  context: string;
  timestamp: Date;
  territory?: string;
}

export interface DesktopItemData {
  id: string;
  type: 'notizzettel' | 'tabelle' | 'code' | 'browser' | 'terminal' | 'tui' | 'media' | 'chart' | 'calendar' | 'filemanager';
  title: string;
  position: Position;
  content: any;
  created_at: string;
  updated_at: string;
  user_id: string;
  metadata?: Record<string, any>;
  width?: number;
  height?: number;
  dimensions?: { width: number; height: number; };
  bagua_descriptor?: number;
  is_contextual?: boolean;
}

export interface ContextMenuData {
  visible: boolean;
  x: number;
  y: number;
  itemId?: string;
}

export interface CanvasState {
  position: Position;
  scale: number;
  velocity: Position;
  isDragging: boolean;
  momentum: { x: number; y: number };
}

export interface AgentState {
  isActive: boolean;
  currentTask: string;
  status: 'idle' | 'processing' | 'completed' | 'error';
  agents: {
    reasoner: { active: boolean; status: string };
    coder: { active: boolean; status: string };
    refiner: { active: boolean; status: string };
  };
}

export interface PanelState {
  tools: boolean;
  ai: boolean;
  territory: boolean;
  minimap: boolean;
}

export interface UniversalDesktopSession {
  session: any;
  user: any;
  logout?: () => Promise<void>;
}

// µ3_ Navigation types - Following Bagua system
export interface UDPosition {
  x: number;
  y: number; 
  z: number;
}

// Context types for AI system
export interface ContextItem {
  type: 'file' | 'window' | 'selection';
  id: string;
  content: any;
}

// Zoom levels for canvas navigation
export const ZoomLevels = {
  SURFACE: 'surface',
  GALAXY: 'galaxy', 
  SYSTEM: 'system',
  PLANET: 'planet',
  MICROSCOPE: 'microscope'
} as const;