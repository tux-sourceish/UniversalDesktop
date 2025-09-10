/**
 * 🎮 CanvasModule - Canvas Rendering & Item Management
 * Pure rendering module with hook integration
 */

import React from 'react';
import { CanvasController } from '../components/bridges/CanvasController';
import DesktopItem from '../components/μ8_DesktopItem';
import type { DesktopItemData, CanvasState } from '../types';

interface CanvasModuleProps {
  items: DesktopItemData[];
  canvasState: CanvasState;
  onNavigationChange?: (state: CanvasState) => void;
  onKeyboardNavigation?: (e: KeyboardEvent) => void;
  onItemUpdate?: (id: string, updates: Partial<DesktopItemData>) => void;
  onItemDelete?: (id: string) => void;
  onItemRename?: (id: string, newTitle: string) => void;
  onContextMenu?: (e: React.MouseEvent, itemId?: string) => void;
  onTitleBarClick?: (e: React.MouseEvent, itemId: string) => void;
  onToggleContext?: (item: DesktopItemData) => void;
  isInContext?: (itemId: string) => boolean;
  className?: string;
}

export const CanvasModule: React.FC<CanvasModuleProps> = ({
  items,
  canvasState,
  onNavigationChange,
  onKeyboardNavigation,
  onItemUpdate,
  onItemDelete,
  onItemRename,
  onContextMenu,
  onTitleBarClick,
  onToggleContext,
  isInContext,
  className = ''
}) => {


  const visibleItems = React.useMemo(() => {
    const viewport = {
      left: -canvasState.position.x / canvasState.scale,
      top: -canvasState.position.y / canvasState.scale,
      right: (-canvasState.position.x + window.innerWidth) / canvasState.scale,
      bottom: (-canvasState.position.y + window.innerHeight) / canvasState.scale
    };

    return items.filter(item => {
      const itemBounds = {
        left: item.position.x,
        top: item.position.y,
        right: item.position.x + (item.width || 0),
        bottom: item.position.y + (item.height || 0)
      };

      return (
        itemBounds.left < viewport.right &&
        itemBounds.right > viewport.left &&
        itemBounds.top < viewport.bottom &&
        itemBounds.bottom > viewport.top
      );
    });
  }, [items, canvasState]);

  const handleCanvasContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu?.(e);
  };

  return (
    <CanvasController
      canvasState={canvasState}
      onNavigationChange={onNavigationChange}
      onKeyboardNavigation={onKeyboardNavigation}
      className={className}
    >
      <div 
        className="canvas-workspace"
        onContextMenu={handleCanvasContextMenu}
        style={{
          width: '100%',
          height: '100%',
          minWidth: '100vw',
          minHeight: '100vh',
          position: 'relative'
        }}
      >
        {visibleItems.map(item => (
          <DesktopItem
            key={item.id}
            item={item}
            onUpdate={onItemUpdate || (() => {})}
            onDelete={onItemDelete || (() => {})}
            onRename={onItemRename || (() => {})}
            onContextMenu={(e, itemId) => onContextMenu?.(e, itemId)}
            onTitleBarClick={onTitleBarClick || (() => {})}
            onToggleContext={onToggleContext || (() => {})}
            isInContext={isInContext?.(item.id) || false}
            canvasState={canvasState}
          />
        ))}
      </div>
    </CanvasController>
  );
};