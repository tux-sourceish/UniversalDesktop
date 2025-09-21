// 🚀 UniversalDesktop Custom Hooks - Campus-Modell v2.1 
// µX_ Prefix System - Raimunds Bagua-Architektur

// µ1_ HIMMEL (☰) - Templates/Classes - Strukturelle Grundlagen
import { µ1_useUniversalDocument } from './µ1_useUniversalDocument';
import { µ1_useWorkspace } from './µ1_useWorkspace';

// µ2_ WIND (☴) - UI/View Hooks
import { µ2_useMinimap } from './µ2_useMinimap';
import { µ2_useBaguaColors } from './µ2_useBaguaColors';

// µ3_ WASSER (☵) - Flow/Navigation Hooks  
import { µ3_useNavigation } from './µ3_useNavigation';

// µ3_ WASSER File System Hook
import { µ3_useFileSystem } from './µ3_useFileSystem';

// µ8_ ERDE (☷) - Global/Base System Hooks
import { µ8_usePanelLayout } from './µ8_usePanelLayout';

// µX-prefixed Hooks (Bagua System)
import { µ3_useCanvasNavigation } from './µ3_useCanvasNavigation';
import { µ1_useWindowManager } from './µ1_useWindowManager';
import { µ7_useKeyboardShortcuts } from './µ7_useKeyboardShortcuts';
import { µ6_useAIAgent } from './µ6_useAIAgent';
import { µ5_useTerritoryManager } from './µ5_useTerritoryManager';
import { µ7_useDraggable } from './µ7_useDraggable';
import { µ7_useResizable } from './µ7_useResizable';

// Legacy Hooks (still exist as files)
import { usePanelManager } from './µ8_usePanelManager';
import { useMinimap } from './µ2_useMinimap_legacy';
import { useContextManager } from './useContextManager';
import { µ7_useClipboardManager } from './µ7_useClipboardManager';
import { useFileManager } from './useFileManager';

// µ6_ FEUER (☲) - Functions/Context Management
import { µ6_useContextManager } from './µ6_useContextManager';

// µX_ Campus-Modell Exports - PRIMARY (Bagua-powered)
export { 
  µ1_useUniversalDocument, 
  µ1_useWorkspace,
  µ2_useMinimap, 
  µ2_useBaguaColors, 
  µ3_useNavigation,
  µ3_useFileSystem,
  µ8_usePanelLayout,
  µ3_useCanvasNavigation,
  µ1_useWindowManager,
  µ7_useKeyboardShortcuts,
  µ6_useAIAgent,
  µ5_useTerritoryManager,
  µ7_useDraggable,
  µ7_useResizable
};

// Legacy exports - DEPRECATED (for backward compatibility)  
export { usePanelManager, useMinimap, useContextManager, µ7_useClipboardManager, useFileManager };

// µ6_ Context Management exports
export { µ6_useContextManager };

// Backward compatibility aliases (old names → new µX names)
export { µ3_useCanvasNavigation as useCanvasNavigation };
export { µ3_useFileSystem as useFileSystem };
export { µ1_useWindowManager as useWindowManager };
export { µ7_useKeyboardShortcuts as useKeyboardShortcuts };
export { µ6_useAIAgent as useAIAgent };
export { µ5_useTerritoryManager as useTerritoryManager };
export { µ7_useClipboardManager as useClipboardManager };

// Hook Categories for organized imports  
export const NavigationHooks = {
  useCanvasNavigation: µ3_useCanvasNavigation,
  useFileSystem: µ3_useFileSystem,
  useMinimap,
  useKeyboardShortcuts: µ7_useKeyboardShortcuts
} as const;

export const UIManagementHooks = {
  usePanelManager,
  useWindowManager: µ1_useWindowManager,
  useContextManager
} as const;

export const AdvancedFeatureHooks = {
  useAIAgent: µ6_useAIAgent,
  useTerritoryManager: µ5_useTerritoryManager,
  useClipboardManager: µ7_useClipboardManager
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
  },
  useFileSystem: {
    category: 'ui-management',
    phase: 2,
    description: 'File system operations with dual-mode support (GUI/TUI)',
    dependencies: [],
    features: ['dual-mode', 'file-operations', 'virtual-file-system']
  },
} as const;

// Usage patterns for documentation
export const UsagePatterns = {
  // Minimal setup for basic functionality
  minimal: ['useCanvasNavigation', 'usePanelManager', 'useWindowManager'],
  
  // Standard setup for full desktop experience
  standard: ['useCanvasNavigation', 'usePanelManager', 'useMinimap', 'useContextManager', 'useWindowManager', 'useKeyboardShortcuts'],
  
  // Advanced setup with all features
  advanced: ['useCanvasNavigation', 'usePanelManager', 'useMinimap', 'useContextManager', 'useWindowManager', 'useKeyboardShortcuts', 'useAIAgent', 'useTerritoryManager', 'µ7_useClipboardManager'],
  
  // AI-focused setup
  aiWorkflow: ['useContextManager', 'useAIAgent', 'µ7_useClipboardManager'],
  
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
  return [...(HookMetadata[hookName]?.dependencies || [])];
};

// Re-export µX-prefixed hooks for compatibility  
export { µ7_useDraggable as useDraggable } from './µ7_useDraggable';
export { µ7_useResizable as useResizable } from './µ7_useResizable';

// ============================================================================
// 🌌 UNIVERSALFILE (.UD) FORMAT INTEGRATION
// ============================================================================

// UniversalFile Core Components
export * from './UDFormat';
export * from './UDDocument';
export * from './µ2_UDMinimapIntegration';

// Default exports for convenience
export { default as UDDocument } from './UDDocument';
export { default as UDMinimapAdapter } from './µ2_UDMinimapIntegration';

// Import for unified API
import { 
  BaguaUtils, 
  BaguaPresets, 
  UDItemType, 
  UD_CONSTANTS 
} from './UDFormat';

import UDDocument from './UDDocument';
import UDMinimapAdapter from './µ2_UDMinimapIntegration';

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