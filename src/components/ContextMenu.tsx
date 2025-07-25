import React, { useEffect } from 'react';
import '../styles/ContextMenu.css';

interface ContextMenuProps {
  visible: boolean;
  x: number;
  y: number;
  onClose: () => void;
  onToggleAI: () => void;
  onRename?: (itemId: string) => void;
  onDelete?: (itemId: string) => void;
  itemId?: string;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  visible,
  x,
  y,
  onClose,
  onToggleAI,
  onRename,
  onDelete,
  itemId
}) => {
  useEffect(() => {
    if (visible) {
      const handleClick = () => onClose();
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      
      // Leichte Verzögerung um sofortiges Schließen zu verhindern
      setTimeout(() => {
        window.addEventListener('click', handleClick);
        window.addEventListener('keydown', handleEscape);
      }, 10);
      
      return () => {
        window.removeEventListener('click', handleClick);
        window.removeEventListener('keydown', handleEscape);
      };
    }
  }, [visible, onClose]);

  if (!visible) return null;

  const handleItemClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
    onClose();
  };

  // Position anpassen falls Menü außerhalb des Viewports wäre
  const adjustedX = Math.min(x, window.innerWidth - 200);
  const adjustedY = Math.min(y, window.innerHeight - 150);

  return (
    <div 
      className="context-menu" 
      style={{ 
        left: adjustedX, 
        top: adjustedY 
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="context-menu-item" onClick={(e) => handleItemClick(e, onToggleAI)}>
        <span className="context-menu-icon">🤖</span>
        KI-Hilfe anfordern
      </div>
      
      {itemId && onRename && (
        <div className="context-menu-item" onClick={(e) => handleItemClick(e, () => onRename(itemId))}>
          <span className="context-menu-icon">✏️</span>
          Umbenennen
        </div>
      )}
      
      {itemId && onDelete && (
        <>
          <div className="context-menu-divider"></div>
          <div className="context-menu-item danger" onClick={(e) => handleItemClick(e, () => onDelete(itemId))}>
            <span className="context-menu-icon">🗑️</span>
            Löschen
          </div>
        </>
      )}
      
      <div className="context-menu-divider"></div>
      <div className="context-menu-item" onClick={(e) => handleItemClick(e, onClose)}>
        <span className="context-menu-icon">❌</span>
        Schließen
      </div>
    </div>
  );
};

export default ContextMenu;