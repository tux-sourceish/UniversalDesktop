/**
 * μ7_ Universal Context Menu System Types
 * DONNER (☳) - Events/Interactions
 * 
 * Comprehensive type definitions for the context-aware menu system
 * integrating with μX-Bagua architecture and Tauri-ready abstractions.
 */

import type { DesktopItemData /* , UDPosition */ } from './index'; // TODO: UDPosition unused here

// Core Context Menu Data Structures
export interface μ7_ContextMenuData {
  visible: boolean;
  position: { x: number; y: number };
  contextType: 'canvas' | 'window' | 'content' | 'file' | 'directory';
  targetItem?: DesktopItemData | FileSystemItem;
  parentElement?: HTMLElement;
  metadata?: Record<string, any>;
}

// Menu Item Definition
export interface μ7_MenuItem {
  id: string;
  label: string;
  icon: string;
  action: () => void | Promise<void>;
  visible: number; // Algebraic transistor result (0 or 1)
  enabled: boolean;
  shortcut?: string;
  tooltip?: string;
  separator?: boolean;
  submenu?: μ7_MenuItem[];
  priority?: 'high' | 'medium' | 'low';
  role?: 'create' | 'edit' | 'delete' | 'navigate' | 'ai' | 'transform';
}

// Menu Section Structure
export interface μ7_MenuSection {
  id: string;
  title: string;
  items: μ7_MenuItem[];
  visible: number; // Algebraic transistor for section visibility
  order: number;
  contextTypes: Array<'canvas' | 'window' | 'content' | 'file' | 'directory'>;
}

// Context Menu Configuration
export interface μ7_ContextMenuConfig {
  enableAnimations: boolean;
  maxWidth: number;
  showIcons: boolean;
  showShortcuts: boolean;
  darkMode: boolean;
  customStyles?: React.CSSProperties;
  position: 'cursor' | 'element' | 'smart';
  closeOnAction: boolean;
  preventOverflow: boolean;
}

// Context Menu Provider Interface
export interface μ7_ContextMenuProvider {
  // Core functionality
  show: (data: μ7_ContextMenuData) => void;
  hide: () => void;
  isVisible: () => boolean;
  
  // Menu management
  registerSection: (section: μ7_MenuSection) => void;
  unregisterSection: (sectionId: string) => void;
  updateSection: (sectionId: string, updates: Partial<μ7_MenuSection>) => void;
  
  // Dynamic menu building
  buildMenu: (contextType: string, targetItem?: any) => μ7_MenuSection[];
  addDynamicItem: (contextType: string, item: μ7_MenuItem) => void;
  removeDynamicItem: (contextType: string, itemId: string) => void;
  
  // State management
  getMenuState: () => any;
  setMenuState: (state: any) => void;
}

// File System Integration Types
export interface FileSystemItem {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'directory' | 'symlink' | 'mount';
  size: number;
  modified: Date;
  created: Date;
  accessed: Date;
  permissions: string;
  owner: string;
  group: string;
  isHidden: boolean;
  extension?: string;
  mimeType?: string;
  thumbnail?: string;
  metadata?: {
    description?: string;
    tags?: string[];
    rating?: number;
    isFavorite?: boolean;
    color?: string;
    icon?: string;
    bagua_descriptor?: number;
  };
}

// Context-Aware Action System
export interface μ7_ContextAction {
  id: string;
  type: 'command' | 'workflow' | 'ai-task' | 'transformation';
  handler: (context: any) => Promise<void>;
  conditions: Array<(context: any) => boolean>;
  metadata: {
    category: string;
    description: string;
    icon: string;
    shortcut?: string;
  };
}

// Integration with AI System
export interface μ7_AIContextIntegration {
  addToContext: (item: DesktopItemData | FileSystemItem) => void;
  removeFromContext: (itemId: string) => void;
  isInContext: (itemId: string) => boolean;
  getContextItems: () => Array<DesktopItemData | FileSystemItem>;
  optimizeContext: (tokenLimit: number) => void;
}

// Event System
export interface μ7_ContextMenuEvents {
  'menu-show': { position: { x: number; y: number }; contextType: string };
  'menu-hide': { reason: 'click-outside' | 'action' | 'escape' };
  'item-select': { item: μ7_MenuItem; context: any };
  'section-register': { section: μ7_MenuSection };
  'context-change': { oldContext: string; newContext: string };
}

// Tauri-Ready Abstractions
export interface μ7_PlatformContextMenu {
  // Browser implementation uses DOM events and positioning
  // Tauri implementation uses native context menu APIs
  showNativeMenu?: (items: μ7_MenuItem[], x: number, y: number) => Promise<string | null>;
  supportsNativeMenus: boolean;
  platform: 'browser' | 'tauri' | 'electron';
}

export default {};