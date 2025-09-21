/**
 * 🎛️ PanelModule - V2 Multi-Panel System
 * NEW: Separate floating panels mit µ-Präfix Architektur
 * INCLUDES: V1 Genius-Feature ContextManager! 🎯
 */

import React from 'react';
import { µ2_ToolPanel } from '../components/panels/µ2_ToolPanel';
import { µ2_AIPanel } from '../components/panels/µ2_AIPanel';
import { µ5_TerritoryPanel } from '../components/panels/µ5_TerritoryPanel';
import { µ6_ContextPanel } from '../components/panels/µ6_ContextPanel';
import { µ2_Minimap } from './µ2_Minimap';
import { µ8_usePanelLayout, µ8_PanelState } from '../hooks/µ8_usePanelLayout';
import { µ6_useContextManager } from '../hooks/µ6_useContextManager';
import type { DesktopItemData, CanvasState, PanelState } from '../types';

// µ6_ Type compatibility interface (from context manager)
interface µ6_DesktopItemData {
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
  onCreateUDItem?: (udItem: any) => void;  // NEW: µ1_WindowFactory Unity Bridge API
  onItemUpdate?: (id: string, updates: Partial<DesktopItemData>) => void;
  positionCalculator?: (requestedPosition: { x: number; y: number; z: number }) => { x: number; y: number; z: number };
  position?: 'left' | 'right' | 'top' | 'bottom';
  className?: string;
  // NEW V2: Panel State als Props statt separater Hook
  µ8_panelState?: any;
  µ8_panelConfigs?: any;
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
  positionCalculator,
  className = '',
  µ8_panelState,
  µ8_panelConfigs,
  contextManager
}) => {
  
  // µ8_ Panel Layout Management (NEW V2 SYSTEM!)
  // FIXED: Verwende Props statt separater Hook!
  const fallbackPanelLayout = µ8_usePanelLayout();
  const panelLayout = {
    panelState: µ8_panelState || fallbackPanelLayout.panelState,
    panelConfigs: µ8_panelConfigs || fallbackPanelLayout.panelConfigs,
    isPanelVisible: (id: keyof µ8_PanelState) => µ8_panelState ? µ8_panelState[id] : fallbackPanelLayout.isPanelVisible(id),
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
  
  // µ6_ Context Manager (V1 GENIUS-FEATURE!)
  // Type adapter for DesktopItemData → µ6_DesktopItemData compatibility  
  const µ6_onItemUpdate = onItemUpdate ? (id: string, updates: Partial<µ6_DesktopItemData>) => {
    // Convert µ6_DesktopItemData to DesktopItemData for compatibility
    const compatibleUpdates = updates as Partial<DesktopItemData>;
    onItemUpdate(id, compatibleUpdates);
  } : undefined;
  
  // Use passed contextManager or create local one as fallback
  const localContextManager = µ6_useContextManager(100000, µ6_onItemUpdate);
  const activeContextManager = contextManager || localContextManager;
  

  // µ8_ Dynamic Panel Offset Calculation
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
      {/* µ2_ Tool Panel - Werkzeugkasten (Links) */}
      <µ2_ToolPanel
        visible={panelLayout.isPanelVisible('tools')}
        onToggle={() => panelLayout.togglePanel('tools')}
        onCreateUDItem={onCreateUDItem || (() => {})}
        positionCalculator={positionCalculator}
        position="left"
        width={280}
      />

      {/* µ2_ AI Panel - KI-Assistent mit flexiblen Agents (Rechts) */}
      <µ2_AIPanel
        visible={panelLayout.isPanelVisible('ai')}
        onToggle={() => panelLayout.togglePanel('ai')}
        position="right" 
        width={320}
        rightOffset={calculateRightOffset('ai')}
        onCreateUDItem={onCreateUDItem}
        positionCalculator={positionCalculator}
        contextManager={activeContextManager}
      />

      {/* µ5_ Territory Panel - Territory Management (Rechts) */}
      <µ5_TerritoryPanel
        visible={panelLayout.isPanelVisible('territory')}
        onToggle={() => panelLayout.togglePanel('territory')}
        position="right"
        width={300}
        rightOffset={calculateRightOffset('territory')}
      />

      {/* µ6_ Context Panel - AI Context Manager (V1 GENIUS-FEATURE!) */}
      <µ6_ContextPanel
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