/**
 * 📋 ContextModule - Context Menu System
 * Unified context menu management with multiple menu types
 */

import React from 'react';
import { μ7_UnifiedContextMenu } from '../components/contextMenu/μ7_UnifiedContextMenu';
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
  clipboard?: ReturnType<typeof import('../hooks/μ7_useClipboardManager').μ7_useClipboardManager>; // μ7_ Clipboard manager
}

export const ContextModule: React.FC<ContextModuleProps> = ({
  contextMenu,
  advancedContextMenu,
  unifiedContextMenu,
  onContextMenuClose,
  onAdvancedContextMenuClose,
  onUnifiedContextMenuClose,
  onItemCreate,
  onItemAction,
  clipboard
}) => {
  // Debug: Check selection state when context menu opens
  const hasGlobalSelection = !!window.getSelection()?.toString();
  const hasTextareaSelection = React.useMemo(() => {
    // Check for textarea/input selection
    const activeElement = document.activeElement;
    if (activeElement && (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT')) {
      const element = activeElement as HTMLTextAreaElement | HTMLInputElement;
      return element.selectionStart !== element.selectionEnd;
    }
    return false;
  }, [unifiedContextMenu.visible]);
  
  const hasTextSelection = hasGlobalSelection || hasTextareaSelection;
  
  // Check for system clipboard content (not just our internal history)
  const [clipboardHasContent, setClipboardHasContent] = React.useState(false);
  
  React.useEffect(() => {
    if (unifiedContextMenu.visible) {
      // Check system clipboard when context menu opens
      navigator.clipboard?.readText().then(text => {
        setClipboardHasContent(!!text.trim());
      }).catch(() => {
        // Fallback: check our internal clipboard
        setClipboardHasContent(clipboard?.hasContent() || false);
      });
    }
  }, [unifiedContextMenu.visible, clipboard]);
  
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

      {/* ✅ V2 μX-Unified Context Menu - RESTORED with Bagua Architecture! */}
      {unifiedContextMenu.visible && (
        <μ7_UnifiedContextMenu
          visible={unifiedContextMenu.visible}
          x={unifiedContextMenu.x}
          y={unifiedContextMenu.y}
          contextType={unifiedContextMenu.contextType}
          targetItem={unifiedContextMenu.targetItem}
          onClose={onUnifiedContextMenuClose}
          onCreateItem={onItemCreate}
          onItemAction={onItemAction}
          onAddToContext={onItemAction ? (item) => onItemAction('add-to-context', item) : undefined}
          clipboardHasContent={clipboardHasContent}
          hasSelection={hasTextSelection}
        />
      )}

      {/* Context Menu Actions - Handled by context menus themselves */}
    </>
  );
};