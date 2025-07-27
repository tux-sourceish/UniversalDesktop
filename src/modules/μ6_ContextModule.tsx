/**
 * 📋 ContextModule - Context Menu System
 * Unified context menu management with multiple menu types
 */

import React from 'react';
import ContextMenu from '../components/ContextMenu';
import ImHexContextMenu from '../components/ImHexContextMenu';
import UnifiedContextMenu from '../components/UnifiedContextMenu';
// TODO V2: Restore when context menus are re-integrated
// import ContextMenuActions from '../components/ContextMenuActions';
import type { DesktopItemData, ContextMenuData } from '../types';

interface ContextModuleProps {
  contextMenu: ContextMenuData;
  advancedContextMenu: {
    visible: boolean;
    x: number;
    y: number;
    targetItem?: DesktopItemData;
  };
  unifiedContextMenu: {
    visible: boolean;
    x: number;
    y: number;
    targetItem?: DesktopItemData;
    contextType: 'canvas' | 'window' | 'content';
  };
  onContextMenuClose: () => void;
  onAdvancedContextMenuClose: () => void;
  onUnifiedContextMenuClose: () => void;
  onItemCreate?: (type: string, position: { x: number; y: number; z: number }) => void;
  onItemAction?: (action: string, item?: DesktopItemData) => void;
}

export const ContextModule: React.FC<ContextModuleProps> = ({
  contextMenu,
  advancedContextMenu,
  unifiedContextMenu,
  onContextMenuClose,
  onAdvancedContextMenuClose,
  onUnifiedContextMenuClose,
  onItemCreate,
  onItemAction
}) => {
  const handleItemCreate = (type: string) => {
    if (onItemCreate) {
      // Create item at context menu position
      const position = {
        x: contextMenu.x || advancedContextMenu.x || unifiedContextMenu.x,
        y: contextMenu.y || advancedContextMenu.y || unifiedContextMenu.y,
        z: 1
      };
      onItemCreate(type, position);
    }
    
    // Close all context menus
    onContextMenuClose();
    onAdvancedContextMenuClose();
    onUnifiedContextMenuClose();
  };

  const handleItemAction = (action: string, item?: DesktopItemData) => {
    onItemAction?.(action, item);
    
    // Close context menus after action
    onContextMenuClose();
    onAdvancedContextMenuClose();
    onUnifiedContextMenuClose();
  };

  return (
    <>
      {/* TODO V2: Restore V1 Basic Context Menu - Important for UniversalDesktop! */}
      {/* {contextMenu.visible && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={onContextMenuClose}
          onItemCreate={handleItemCreate}
        />
      )} */}

      {/* TODO V2: Restore V1 ImHex Context Menu - Important for UniversalDesktop! */}
      {/* {advancedContextMenu.visible && (
        <ImHexContextMenu
          x={advancedContextMenu.x}
          y={advancedContextMenu.y}
          targetItem={advancedContextMenu.targetItem}
          onClose={onAdvancedContextMenuClose}
          onAction={handleItemAction}
        />
      )} */}

      {/* TODO V2: Restore V1 Unified Context Menu - Important for UniversalDesktop! */}
      {/* {unifiedContextMenu.visible && (
        <UnifiedContextMenu
          x={unifiedContextMenu.x}
          y={unifiedContextMenu.y}
          targetItem={unifiedContextMenu.targetItem}
          contextType={unifiedContextMenu.contextType}
          onClose={onUnifiedContextMenuClose}
          onAction={handleItemAction}
        />
      )} */}

      {/* Context Menu Actions - Handled by context menus themselves */}
    </>
  );
};