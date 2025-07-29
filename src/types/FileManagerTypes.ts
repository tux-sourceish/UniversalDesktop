/**
 * μ3_ File Manager System Types
 * WASSER (☵) - Procedures/Workflows  
 * 
 * Comprehensive type definitions for the dual-mode File Manager
 * with Tauri-ready abstractions and Norton Commander inspired features.
 */

import type { UDPosition } from './index';

// Core File System Types
export interface FileSystemItem {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'directory' | 'symlink' | 'mount' | 'drive';
  size: number;
  modified: Date;
  created: Date;
  accessed: Date;
  permissions: string;
  owner: string;
  group: string;
  isHidden: boolean;
  isSystem: boolean;
  isReadOnly: boolean;
  extension?: string;
  mimeType?: string;
  thumbnail?: string;
  
  // Enhanced metadata for UniversalDesktop integration
  metadata?: {
    description?: string;
    tags?: string[];
    rating?: number;
    isFavorite?: boolean;
    color?: string;
    icon?: string;
    bagua_descriptor?: number;
    ud_compatible?: boolean; // Can be opened as UD document
    preview_available?: boolean;
  };
  
  // Platform-specific data
  platform_data?: {
    windows?: { attributes: string; shortName?: string };
    linux?: { inode: number; device: string };
    macos?: { spotlight_metadata?: Record<string, any> };
  };
}

// File Manager State
export interface μ3_FileManagerState {
  // Navigation
  currentPath: string;
  history: NavigationHistoryEntry[];
  historyIndex: number;
  bookmarks: FileSystemItem[];
  recentFiles: FileSystemItem[];
  
  // Content
  items: FileSystemItem[];
  selectedItems: Set<string>;
  clipboard: ClipboardData | null;
  
  // View Configuration
  viewMode: 'list' | 'grid' | 'tree' | 'columns' | 'compact';
  sortBy: 'name' | 'size' | 'modified' | 'created' | 'type' | 'extension';
  sortOrder: 'asc' | 'desc';
  showHidden: boolean;
  showSystem: boolean;
  groupBy?: 'none' | 'type' | 'date' | 'size';
  
  // Search and Filter  
  searchQuery: string;
  searchScope: 'current' | 'recursive' | 'indexed';
  filter: FileFilter;
  
  // Operations
  operations: FileOperation[];
  dragDropState: DragDropState;
  
  // UI State
  loading: boolean;
  error: string | null;
  previewItem: FileSystemItem | null;
  
  // Dual Mode Support
  mode: 'gui' | 'tui';
  tuiConfig: TUIConfiguration;
}

// Navigation History
export interface NavigationHistoryEntry {
  path: string;
  timestamp: Date;
  scrollPosition: { x: number; y: number };
  selectedItems: string[];
  viewMode: string;
}

// File Operations
export interface FileOperation {
  id: string;
  type: 'copy' | 'move' | 'delete' | 'rename' | 'create' | 'extract' | 'compress';
  source: string[];
  destination?: string;
  newName?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  speed?: number; // bytes per second
  timeRemaining?: number; // seconds
  error?: string;
  metadata?: {
    totalSize: number;
    processedSize: number;
    itemCount: number;
    processedItems: number;
  };
}

// Clipboard Support
export interface ClipboardData {
  operation: 'copy' | 'cut';
  items: FileSystemItem[];
  timestamp: Date;
  source_path: string;
}

// Drag and Drop
export interface DragDropState {
  isDragging: boolean;
  draggedItems: string[];
  dropTarget: string | null;
  dropEffect: 'copy' | 'move' | 'link' | 'none';
  ghostOffset: { x: number; y: number };
  showDropIndicator: boolean;
}

// Search and Filter
export interface FileFilter {
  type?: Array<'file' | 'directory'>;
  extensions?: string[];
  sizeRange?: { min: number; max: number };
  dateRange?: { from: Date; to: Date };
  attributes?: Array<'hidden' | 'system' | 'readonly' | 'archive'>;
  mimeTypes?: string[];
  customPredicate?: (item: FileSystemItem) => boolean;
}

// TUI Mode Configuration
export interface TUIConfiguration {
  enabled: boolean;
  theme: 'dark' | 'light' | 'retro' | 'matrix';
  keymap: 'default' | 'vim' | 'emacs' | 'norton';
  showLineNumbers: boolean;
  showStatusBar: boolean;
  splitMode: 'single' | 'dual' | 'quad';
  panels: TUIPanel[];
}

export interface TUIPanel {
  id: string;
  path: string;
  active: boolean;
  position: { x: number; y: number; width: number; height: number };
}

// File System API Abstraction (Tauri-Ready)
export interface μ3_FileSystemAPI {
  // Core Operations
  listDirectory: (path: string, showHidden?: boolean) => Promise<FileSystemItem[]>;
  createDirectory: (path: string) => Promise<boolean>;
  deleteItem: (path: string, permanent?: boolean) => Promise<boolean>;
  moveItem: (sourcePath: string, destinationPath: string) => Promise<boolean>;
  copyItem: (sourcePath: string, destinationPath: string) => Promise<boolean>;
  renameItem: (oldPath: string, newPath: string) => Promise<boolean>;
  
  // File Content
  readFile: (path: string) => Promise<ArrayBuffer>;
  writeFile: (path: string, data: ArrayBuffer) => Promise<boolean>;
  readTextFile: (path: string, encoding?: string) => Promise<string>;
  writeTextFile: (path: string, content: string, encoding?: string) => Promise<boolean>;
  
  // Metadata and Info
  getItemInfo: (path: string) => Promise<FileSystemItem>;
  getItemPermissions: (path: string) => Promise<{ read: boolean; write: boolean; execute: boolean }>;
  setItemPermissions: (path: string, permissions: string) => Promise<boolean>;
  getThumbnail: (path: string, size?: { width: number; height: number }) => Promise<string | null>;
  
  // System Integration
  openWithDefaultApp: (path: string) => Promise<boolean>;
  showInSystemExplorer: (path: string) => Promise<boolean>;
  getSystemDrives: () => Promise<FileSystemItem[]>;
  getSystemInfo: () => Promise<{ platform: string; arch: string; version: string }>;
  
  // Search
  searchFiles: (query: string, path: string, options?: SearchOptions) => Promise<FileSystemItem[]>;
  indexDirectory: (path: string) => Promise<boolean>;
  
  // Watchers (for real-time updates)
  watchDirectory: (path: string, callback: (changes: FileSystemEvent[]) => void) => Promise<() => void>;
  
  // Dialogs (Tauri-specific)
  showOpenDialog: (options?: OpenDialogOptions) => Promise<string[] | null>;
  showSaveDialog: (options?: SaveDialogOptions) => Promise<string | null>;
  showMessageDialog: (message: string, type?: 'info' | 'warning' | 'error') => Promise<boolean>;
}

// Search Configuration
export interface SearchOptions {
  recursive: boolean;
  includeHidden: boolean;
  includeSystem: boolean;
  fileTypes: string[];
  maxResults: number;
  sortBy: 'relevance' | 'name' | 'date';
}

// File System Events
export interface FileSystemEvent {
  type: 'created' | 'modified' | 'deleted' | 'renamed';
  path: string;
  oldPath?: string; // for rename events
  item?: FileSystemItem;
  timestamp: Date;
}

// Dialog Options (Tauri Integration)
export interface OpenDialogOptions {
  title?: string;
  defaultPath?: string;
  multiple?: boolean;
  directory?: boolean;
  filters?: Array<{ name: string; extensions: string[] }>;
}

export interface SaveDialogOptions {
  title?: string;
  defaultPath?: string;
  filters?: Array<{ name: string; extensions: string[] }>;
}

// File Manager Component Props
export interface μ3_FileManagerProps {
  initialPath?: string;
  mode?: 'gui' | 'tui' | 'dual';
  readOnly?: boolean;
  showToolbar?: boolean;
  showStatusBar?: boolean;
  showPreview?: boolean;
  allowMultiSelect?: boolean;
  enableSearch?: boolean;
  enableBookmarks?: boolean;
  customActions?: FileManagerAction[];
  
  // Event Handlers
  onFileSelect?: (items: FileSystemItem[]) => void;
  onFileOpen?: (item: FileSystemItem) => void;
  onPathChange?: (path: string) => void;
  onError?: (error: string) => void;
  
  // Integration
  contextMenuProvider?: any; // μ7_ContextMenuProvider
  aiContextManager?: any; // μ6_useContextManager
  
  // Styling
  theme?: 'light' | 'dark' | 'auto';
  compact?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// File Manager Actions (Extensibility)
export interface FileManagerAction {
  id: string;
  label: string;
  icon: string;
  shortcut?: string;
  contexts: Array<'file' | 'directory' | 'selection' | 'empty'>;
  handler: (items: FileSystemItem[], manager: any) => Promise<void>;
  condition?: (items: FileSystemItem[]) => boolean;
}

// Norton Commander Layout Support
export interface PanelData {
  path: string;
  active: boolean;
  items: FileSystemItem[];
  selectedItems: Set<string>;
}

export interface NortonCommanderLayout {
  leftPanel: PanelData;
  rightPanel: PanelData;
  activePanel: 'left' | 'right';
  commandLine: {
    visible: boolean;
    content: string;
    history: string[];
  };
  
  // Add string index signature for dynamic access
  [K: string]: any;
}

// Performance Optimization
export interface VirtualizationConfig {
  enabled: boolean;
  itemHeight: number;
  overscan: number;
  threshold: number; // Minimum items before virtualization kicks in
}

export default {};