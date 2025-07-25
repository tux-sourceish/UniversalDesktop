/**
 * 🎛️ PanelModule - Unified Panel Management
 * Complete panel system with hook integration
 */

import React from 'react';
import { PanelSidebar } from '../components/bridges/PanelSidebar';
import { µ2_Minimap } from './µ2_Minimap';
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
        onCreateItem={onItemCreate}
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

      {/* µ2_Minimap - StarCraft Minimap mit Bagua-Power */}
      {panelState.minimap && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000
        }}>
          <µ2_Minimap
            items={visibleItems}
            canvasState={canvasState}
            onNavigate={(position) => {
              // Verbesserte UX: Smooth navigation mit korrektem Canvas-State
              onNavigationChange?.({
                ...canvasState,
                position,
                velocity: { x: 0, y: 0, z: 0 },
                isDragging: false
              });
            }}
            onZoomChange={(zoomLevel) => {
              console.log('🔍 µ2_Minimap Zoom Change:', zoomLevel);
              onZoomChange?.(zoomLevel);
            }}
            onItemSelect={(itemId) => {
              console.log('🎯 Item selected:', itemId);
              // TODO: Add item selection logic
            }}
          />
        </div>
      )}
    </>
  );
};