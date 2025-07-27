/**
 * 🎛️ PanelModule - V2 Multi-Panel System
 * NEW: Separate floating panels mit μ-Präfix Architektur
 * INCLUDES: V1 Genius-Feature ContextManager! 🎯
 */

import React from 'react';
import { μ2_ToolPanel } from '../components/panels/µ2_ToolPanel';
import { μ2_AIPanel } from '../components/panels/µ2_AIPanel';
import { μ5_TerritoryPanel } from '../components/panels/µ5_TerritoryPanel';
import { μ6_ContextPanel } from '../components/panels/µ6_ContextPanel';
import { µ2_Minimap } from './µ2_Minimap';
import { μ8_usePanelLayout, μ8_PanelState } from '../hooks/µ8_usePanelLayout';
import { μ6_useContextManager } from '../hooks/µ6_useContextManager';
import type { DesktopItemData, CanvasState, PanelState } from '../types';

// μ6_ Type compatibility interface (from context manager)
interface μ6_DesktopItemData {
  id: string;
  type: string;
  title: string;
  position: { x: number; y: number; z: number };
  content: any;
  is_contextual?: boolean;
  metadata?: Record<string, any>;
  bagua_descriptor?: number;
}

interface PanelModuleProps {
  panelState: PanelState;
  items: DesktopItemData[];
  canvasState: CanvasState;
  onPanelToggle?: (panel: keyof PanelState) => void;
  onNavigationChange?: (position: { x: number; y: number; z: number }) => void;  
  onZoomChange?: (scale: number) => void;
  onItemCreate?: (type: string, position: { x: number; y: number; z: number }, content?: any) => void;
  onCreateUDItem?: (udItem: any) => void;  // NEW: μ1_WindowFactory Unity Bridge API
  onItemUpdate?: (id: string, updates: Partial<DesktopItemData>) => void;
  position?: 'left' | 'right' | 'top' | 'bottom';
  className?: string;
  // NEW V2: Panel State als Props statt separater Hook
  μ8_panelState?: any;
  μ8_panelConfigs?: any;
  // NEW: Context Manager von Parent durchreichen
  contextManager?: any;
}

export const PanelModule: React.FC<PanelModuleProps> = ({
  items,
  canvasState,
  onNavigationChange,
  onZoomChange,
  onItemCreate,
  onCreateUDItem,
  onItemUpdate,
  className = '',
  μ8_panelState,
  μ8_panelConfigs,
  contextManager
}) => {
  
  // μ8_ Panel Layout Management (NEW V2 SYSTEM!)
  // FIXED: Verwende Props statt separater Hook!
  const fallbackPanelLayout = μ8_usePanelLayout();
  const panelLayout = {
    panelState: μ8_panelState || fallbackPanelLayout.panelState,
    panelConfigs: μ8_panelConfigs || fallbackPanelLayout.panelConfigs,
    isPanelVisible: (id: keyof μ8_PanelState) => μ8_panelState ? μ8_panelState[id] : fallbackPanelLayout.isPanelVisible(id),
    togglePanel: fallbackPanelLayout.togglePanel,
    // MISSING FUNCTIONS: Add all needed functions from original hook
    getRightPanelOffset: fallbackPanelLayout.getRightPanelOffset,
    getCanvasOffset: fallbackPanelLayout.getCanvasOffset,
    getPanelTransform: fallbackPanelLayout.getPanelTransform,
    getPanelOpacity: fallbackPanelLayout.getPanelOpacity,
    getPanelsByPosition: fallbackPanelLayout.getPanelsByPosition,
    getActivePanelCount: fallbackPanelLayout.getActivePanelCount,
    // NEW: Smart Panel Sizing
    getSmartPanelDimensions: fallbackPanelLayout.getSmartPanelDimensions
  };
  
  // μ6_ Context Manager (V1 GENIUS-FEATURE!)
  // Type adapter for DesktopItemData → μ6_DesktopItemData compatibility  
  const μ6_onItemUpdate = onItemUpdate ? (id: string, updates: Partial<μ6_DesktopItemData>) => {
    // Convert μ6_DesktopItemData to DesktopItemData for compatibility
    const compatibleUpdates = updates as Partial<DesktopItemData>;
    onItemUpdate(id, compatibleUpdates);
  } : undefined;
  
  // Use passed contextManager or create local one as fallback
  const localContextManager = μ6_useContextManager(100000, μ6_onItemUpdate);
  const activeContextManager = contextManager || localContextManager;

  // μ8_ Dynamic Panel Offset Calculation
  const calculateRightOffset = (panelId: 'ai' | 'territory' | 'context'): number => {
    const panelWidths = { ai: 320, territory: 300, context: 350 };
    const panelOrder = ['ai', 'territory', 'context'];
    
    let offset = 0;
    const panelIndex = panelOrder.indexOf(panelId);
    
    // Zähle die Breite aller sichtbaren Panels VOR diesem Panel
    for (let i = 0; i < panelIndex; i++) {
      const prevPanelId = panelOrder[i] as 'ai' | 'territory' | 'context';
      if (panelLayout.isPanelVisible(prevPanelId)) {
        offset += panelWidths[prevPanelId];
      }
    }
    
    return offset;
  };

  return (
    <>
      {/* μ2_ Tool Panel - Werkzeugkasten (Links) */}
      <μ2_ToolPanel
        visible={panelLayout.isPanelVisible('tools')}
        onToggle={() => panelLayout.togglePanel('tools')}
        onCreateUDItem={onCreateUDItem || (() => {})}
        position="left"
        width={280}
      />

      {/* μ2_ AI Panel - KI-Assistent mit flexiblen Agents (Rechts) */}
      <μ2_AIPanel
        visible={panelLayout.isPanelVisible('ai')}
        onToggle={() => panelLayout.togglePanel('ai')}
        position="right" 
        width={320}
        rightOffset={calculateRightOffset('ai')}
        onCreateUDItem={onCreateUDItem}
        contextManager={contextManager}
      />

      {/* μ5_ Territory Panel - Territory Management (Rechts) */}
      <μ5_TerritoryPanel
        visible={panelLayout.isPanelVisible('territory')}
        onToggle={() => panelLayout.togglePanel('territory')}
        position="right"
        width={300}
        rightOffset={calculateRightOffset('territory')}
      />

      {/* μ6_ Context Panel - AI Context Manager (V1 GENIUS-FEATURE!) */}
      <μ6_ContextPanel
        visible={panelLayout.isPanelVisible('context')}
        onToggle={() => panelLayout.togglePanel('context')}
        position="right"
        width={350}
        rightOffset={calculateRightOffset('context')}
        activeContextItems={activeContextManager.activeContextItems}
        tokenUsage={activeContextManager.tokenUsage}
        onRemoveItem={activeContextManager.removeFromContext}
        onClearAll={activeContextManager.clearAllContext}
        onOptimize={activeContextManager.optimizeContext}
        onUndo={activeContextManager.undoLastContextChange}
      />

      {/* µ2_Minimap - StarCraft Minimap mit Bagua-Power (Unten Rechts) */}
      {panelLayout.isPanelVisible('minimap') && (() => {
        // Dynamic minimap positioning - avoid right panel overlap
        const rightPanelWidth = calculateRightOffset('context') + (panelLayout.isPanelVisible('context') ? 350 : 0);
        const minimapRightOffset = rightPanelWidth > 0 ? rightPanelWidth + 20 : 20;
        
        return (
          <div style={{
            position: 'fixed',
            bottom: '20px',
            right: `${minimapRightOffset}px`,
          zIndex: 200,
          transform: panelLayout.getPanelTransform('minimap', 'bottom-right'),
          opacity: panelLayout.getPanelOpacity('minimap'),
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            <µ2_Minimap
              items={items}
              canvasState={canvasState}
              onNavigate={onNavigationChange || (() => {})}
              onZoomChange={onZoomChange}
              className={className}
            />
          </div>
        );
      })()}
    </>
  );
};