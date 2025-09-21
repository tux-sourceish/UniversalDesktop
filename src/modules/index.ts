/**
 * 🏗️ Module Exports - Centralized Module Access
 * 
 * All modules exported for easy importing and tree-shaking optimization
 */

// Authentication & Session
export { AuthModule } from './µ4_AuthModule';

// Data Management  
export { useDataModule } from './µ8_DataModule';
export type { DataModuleReturn } from './µ8_DataModule';

// Canvas & Rendering
export { CanvasModule } from './µ8_CanvasModule';

// Panel System
export { PanelModule } from './µ2_PanelModule';

// Context Menu System
export { ContextModule } from './µ6_ContextModule';

// Module Composition Patterns
export const ModulePatterns = {
  // Minimal setup - basic desktop functionality
  minimal: [
    'µ4_AuthModule',
    'µ8_DataModule', 
    'µ8_CanvasModule'
  ],
  
  // Standard setup - full desktop experience
  standard: [
    'µ4_AuthModule',
    'µ8_DataModule',
    'µ8_CanvasModule', 
    'µ2_PanelModule',
    'µ6_ContextModule'
  ],
  
  // Enterprise setup - all features + security
  enterprise: [
    'µ4_AuthModule',
    'µ8_DataModule',
    'µ8_CanvasModule',
    'µ2_PanelModule', 
    'µ6_ContextModule',
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