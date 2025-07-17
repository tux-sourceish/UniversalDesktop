// 🚀 UniversalDesktop Custom Hooks - Unified Export
// Phase 2 Hook-System Revolution - Complete Architecture

// Phase 1: Foundation Hooks
export { useCanvasNavigation } from './useCanvasNavigation';
export { usePanelManager } from './usePanelManager';
export { useMinimap } from './useMinimap';

// Phase 2: Core Features
export { useContextManager } from './useContextManager';
export { useWindowManager } from './useWindowManager';
export { useKeyboardShortcuts } from './useKeyboardShortcuts';

// Phase 3: Advanced Features
export { useAIAgent } from './useAIAgent';
export { useTerritoryManager } from './useTerritoryManager';
export { useClipboardManager } from './useClipboardManager';
export { useFileManager } from './useFileManager';

// Hook Categories for organized imports
export const NavigationHooks = {
  useCanvasNavigation,
  useMinimap,
  useKeyboardShortcuts
} as const;

export const UIManagementHooks = {
  usePanelManager,
  useWindowManager,
  useContextManager
} as const;

export const AdvancedFeatureHooks = {
  useAIAgent,
  useTerritoryManager,
  useClipboardManager
} as const;

// Complete Hook Suite for full UniversalDesktop functionality
export const UniversalDesktopHooks = {
  ...NavigationHooks,
  ...UIManagementHooks,
  ...AdvancedFeatureHooks
} as const;

// Hook Metadata for documentation and tooling
export const HookMetadata = {
  useCanvasNavigation: {
    category: 'navigation',
    phase: 1,
    description: 'Canvas physics, zoom levels, and exponential keyboard navigation',
    dependencies: [],
    features: ['momentum-physics', 'multi-scale-zoom', 'keyboard-navigation']
  },
  usePanelManager: {
    category: 'ui-management',
    phase: 1,
    description: 'Centralized panel state management with unified architecture',
    dependencies: [],
    features: ['panel-toggle', 'workspace-modes', 'panel-focus']
  },
  useMinimap: {
    category: 'navigation',
    phase: 1,
    description: 'StarCraft-style minimap with precision controls and context zones',
    dependencies: ['useCanvasNavigation'],
    features: ['viewport-sync', 'context-zones', 'intelligent-damping']
  },
  useContextManager: {
    category: 'ui-management',
    phase: 2,
    description: 'AI context management with token optimization and auto-cleanup',
    dependencies: [],
    features: ['token-tracking', 'auto-optimization', 'context-history']
  },
  useWindowManager: {
    category: 'ui-management',
    phase: 2,
    description: 'Intelligent window creation, sizing, and collision detection',
    dependencies: [],
    features: ['smart-sizing', 'collision-detection', 'bulk-operations']
  },
  useKeyboardShortcuts: {
    category: 'navigation',
    phase: 2,
    description: 'Comprehensive keyboard shortcut system with context awareness',
    dependencies: [],
    features: ['context-aware', 'customizable', 'multi-context']
  },
  useAIAgent: {
    category: 'advanced-features',
    phase: 3,
    description: 'Three-phase AI workflow with model management and token tracking',
    dependencies: ['useContextManager'],
    features: ['multi-phase-ai', 'model-selection', 'cost-estimation']
  },
  useTerritoryManager: {
    category: 'advanced-features',
    phase: 3,
    description: 'DBSCAN clustering for spatial territory management and bookmarks',
    dependencies: [],
    features: ['dbscan-clustering', 'spatial-bookmarks', 'territory-analytics']
  },
  useClipboardManager: {
    category: 'advanced-features',
    phase: 3,
    description: 'Type-aware clipboard operations with export functionality',
    dependencies: [],
    features: ['type-specific-paste', 'clipboard-history', 'export-operations']
  }
} as const;

// Usage patterns for documentation
export const UsagePatterns = {
  // Minimal setup for basic functionality
  minimal: ['useCanvasNavigation', 'usePanelManager', 'useWindowManager'],
  
  // Standard setup for full desktop experience
  standard: ['useCanvasNavigation', 'usePanelManager', 'useMinimap', 'useContextManager', 'useWindowManager', 'useKeyboardShortcuts'],
  
  // Advanced setup with all features
  advanced: ['useCanvasNavigation', 'usePanelManager', 'useMinimap', 'useContextManager', 'useWindowManager', 'useKeyboardShortcuts', 'useAIAgent', 'useTerritoryManager', 'useClipboardManager'],
  
  // AI-focused setup
  aiWorkflow: ['useContextManager', 'useAIAgent', 'useClipboardManager'],
  
  // Spatial computing setup
  spatialComputing: ['useCanvasNavigation', 'useMinimap', 'useTerritoryManager']
} as const;

// Type definitions for better TypeScript support
export type HookName = keyof typeof UniversalDesktopHooks;
export type HookCategory = 'navigation' | 'ui-management' | 'advanced-features';
export type HookPhase = 1 | 2 | 3;
export type UsagePattern = keyof typeof UsagePatterns;

// Utility functions for hook management
export const getHooksByCategory = (category: HookCategory): string[] => {
  return Object.entries(HookMetadata)
    .filter(([, meta]) => meta.category === category)
    .map(([name]) => name);
};

export const getHooksByPhase = (phase: HookPhase): string[] => {
  return Object.entries(HookMetadata)
    .filter(([, meta]) => meta.phase === phase)
    .map(([name]) => name);
};

export const getHookDependencies = (hookName: HookName): string[] => {
  return HookMetadata[hookName]?.dependencies || [];
};

// Re-export existing hooks for compatibility
export { useDraggable } from './useDraggable';
export { useResizable } from './useResizable';

// ============================================================================
// 🌌 UNIVERSALFILE (.UD) FORMAT INTEGRATION
// ============================================================================

// UniversalFile Core Components
export * from './UDFormat';
export * from './UDDocument';
export * from './UDMinimapIntegration';

// Default exports for convenience
export { default as UDDocument } from './UDDocument';
export { default as UDMinimapAdapter } from './UDMinimapIntegration';

// Import for unified API
import { 
  BaguaUtils, 
  BaguaPresets, 
  UDItemType, 
  UD_CONSTANTS 
} from './UDFormat';

import UDDocument from './UDDocument';
import UDMinimapAdapter from './UDMinimapIntegration';

// UniversalFile Unified API
export const UniversalFile = {
  // Core classes
  Document: UDDocument,
  MinimapAdapter: UDMinimapAdapter,
  
  // Utilities
  Bagua: BaguaUtils,
  Presets: BaguaPresets,
  
  // Types and constants
  ItemType: UDItemType,
  Constants: UD_CONSTANTS,
  
  // Factory functions
  createDocument: () => new UDDocument(),
  createMinimapAdapter: (doc: UDDocument) => new UDMinimapAdapter(doc),
  
  // Quick start functions
  quickNote: (content: string, position?: [number, number, number]) => {
    const doc = new UDDocument();
    doc.addItem({
      position: position || [0, 0, 0],
      dimensions: [300, 200],
      type: UDItemType.NOTIZZETTEL,
      content
    });
    return doc;
  },
  
  quickDatabase: (data: any, position?: [number, number, number]) => {
    const doc = new UDDocument();
    doc.addItem({
      position: position || [0, 0, 0],
      dimensions: [400, 300],
      type: UDItemType.DATABASE,
      content: JSON.stringify(data, null, 2)
    });
    return doc;
  }
};

// UniversalFile Metadata
export const UDMetadata = {
  version: '1.0.0',
  author: 'tux-sourceish',
  description: 'Revolutionary spatial document format with Bagua-based metadata',
  homepage: 'https://github.com/tux-sourceish/UniversalFile',
  features: [
    'bagua-metadata',
    'hyperdimensional-vectors',
    'spatial-computing',
    'minimap-integration',
    'ai-enhanced',
    'real-time-sync'
  ]
};