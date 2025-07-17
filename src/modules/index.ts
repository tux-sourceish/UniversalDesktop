/**
 * 🏗️ Module Exports - Centralized Module Access
 * 
 * All modules exported for easy importing and tree-shaking optimization
 */

// Authentication & Session
export { AuthModule } from './AuthModule';

// Data Management  
export { useDataModule } from './DataModule';
export type { DataModuleReturn } from './DataModule';

// Canvas & Rendering
export { CanvasModule } from './CanvasModule';

// Panel System
export { PanelModule } from './PanelModule';

// Context Menu System
export { ContextModule } from './ContextModule';

// Module Composition Patterns
export const ModulePatterns = {
  // Minimal setup - basic desktop functionality
  minimal: [
    'AuthModule',
    'DataModule', 
    'CanvasModule'
  ],
  
  // Standard setup - full desktop experience
  standard: [
    'AuthModule',
    'DataModule',
    'CanvasModule', 
    'PanelModule',
    'ContextModule'
  ],
  
  // Enterprise setup - all features + security
  enterprise: [
    'AuthModule',
    'DataModule',
    'CanvasModule',
    'PanelModule', 
    'ContextModule',
    'SecurityModule', // Future
    'AuditModule'     // Future
  ]
} as const;

// Module metadata for documentation and tooling
export const ModuleMetadata = {
  AuthModule: {
    description: 'Authentication and session management',
    dependencies: ['supabaseClient'],
    size: 'small',
    critical: true
  },
  DataModule: {
    description: 'Data loading and persistence',
    dependencies: ['supabaseClient'],
    size: 'medium', 
    critical: true
  },
  CanvasModule: {
    description: 'Canvas rendering and item management',
    dependencies: ['hooks/useCanvasNavigation', 'components/bridges'],
    size: 'large',
    critical: true
  },
  PanelModule: {
    description: 'Panel system management',
    dependencies: ['hooks/usePanelManager', 'components/bridges'],
    size: 'medium',
    critical: false
  },
  ContextModule: {
    description: 'Context menu system',
    dependencies: ['components/context'],
    size: 'small',
    critical: false
  }
} as const;