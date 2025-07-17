/**
 * 🎛️ PanelModule - Unified Panel Management
 * Complete panel system with hook integration
 */

import React from 'react';
import { PanelSidebar } from '../components/bridges/PanelSidebar';
import { MinimapWidget } from '../components/bridges/MinimapWidget';
import ContextManager from '../components/ContextManager';
import type { DesktopItemData, CanvasState, PanelState } from '../types';

interface PanelModuleProps {
  panelState: PanelState;
  items: DesktopItemData[];
  canvasState: CanvasState;
  onPanelToggle?: (panel: keyof PanelState) => void;
  onNavigationChange?: (position: { x: number; y: number; z: number }) => void;
  onZoomChange?: (scale: number) => void;
  onItemCreate?: (type: string, position: { x: number; y: number; z: number }) => void;
  position?: 'left' | 'right' | 'top' | 'bottom';
  className?: string;
}

export const PanelModule: React.FC<PanelModuleProps> = ({
  panelState,
  items,
  canvasState,
  onPanelToggle,
  onNavigationChange,
  onZoomChange,
  onItemCreate,
  position = 'left',
  className = ''
}) => {
  // Get visible items for minimap
  const visibleItems = items.filter(item => {
    // Basic visibility check - could be enhanced with viewport culling
    return true;
  });

  return (
    <>
      {/* Main Panel Sidebar */}
      <PanelSidebar
        position={position}
        allowResize={true}
        showToggleButtons={true}
        className={className}
      >
        {/* Context Manager Panel */}
        {panelState.territory && (
          <div className="context-manager-panel">
            <ContextManager
              items={items}
              onItemUpdate={(item) => {
                // Handle context item updates
                console.log('Context item updated:', item);
              }}
            />
          </div>
        )}
      </PanelSidebar>

      {/* Minimap Widget */}
      {panelState.minimap && (
        <MinimapWidget
          items={visibleItems}
          canvasState={canvasState}
          onNavigationChange={onNavigationChange}
          onZoomChange={onZoomChange}
          showControls={true}
          showStats={false}
          size={{ width: 300, height: 200 }}
        />
      )}
    </>
  );
};