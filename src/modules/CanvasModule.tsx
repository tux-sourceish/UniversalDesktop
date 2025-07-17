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
  onItemUpdate?: (item: DesktopItemData) => void;
  onItemDelete?: (id: string) => void;
  onContextMenu?: (e: React.MouseEvent, itemId?: string) => void;
  className?: string;
}

export const CanvasModule: React.FC<CanvasModuleProps> = ({
  items,
  canvasState,
  onNavigationChange,
  onItemUpdate,
  onItemDelete,
  onContextMenu,
  className = ''
}) => {
  const handleItemPositionChange = (id: string, position: { x: number; y: number; z: number }) => {
    const item = items.find(i => i.id === id);
    if (item && onItemUpdate) {
      onItemUpdate({ ...item, position });
    }
  };

  const handleItemContentChange = (id: string, content: any) => {
    const item = items.find(i => i.id === id);
    if (item && onItemUpdate) {
      onItemUpdate({ ...item, content });
    }
  };

  const handleItemSizeChange = (id: string, width: number, height: number) => {
    const item = items.find(i => i.id === id);
    if (item && onItemUpdate) {
      onItemUpdate({ ...item, width, height });
    }
  };

  const handleCanvasContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onContextMenu?.(e);
  };

  return (
    <CanvasController
      onNavigationChange={onNavigationChange}
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
            onPositionChange={(position) => handleItemPositionChange(item.id, position)}
            onContentChange={(content) => handleItemContentChange(item.id, content)}
            onSizeChange={(width, height) => handleItemSizeChange(item.id, width, height)}
            onDelete={() => onItemDelete?.(item.id)}
            onContextMenu={(e) => onContextMenu?.(e, item.id)}
          />
        ))}
      </div>
    </CanvasController>
  );
};