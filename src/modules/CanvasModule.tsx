/**
 * 🎮 CanvasModule - Canvas Rendering & Item Management
 * Pure rendering module with hook integration
 */

import React from 'react';
import { CanvasController } from '../components/bridges/CanvasController';
import DesktopItem from '../components/DesktopItem';
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

  const handleCanvasContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
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
          position: 'relative'
        }}
      >
        {items.map(item => (
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
          />
        ))}
      </div>
    </CanvasController>
  );
};