import React, { useState, useEffect, useRef } from 'react';
import '../styles/ImHexContextMenu.css';

export interface ContextMenuItem {
  id: string;
  label: string;
  icon: string;
  action?: () => void;
  submenu?: ContextMenuItem[];
  disabled?: boolean;
  separator?: boolean;
}

interface ImHexContextMenuProps {
  items: ContextMenuItem[];
  position: { x: number; y: number };
  onClose: () => void;
  visible: boolean;
  targetItem?: any; // The desktop item that was right-clicked
}

export const ImHexContextMenu: React.FC<ImHexContextMenuProps> = ({
  items,
  position,
  onClose,
  visible,
  targetItem
}) => {
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [submenuPosition, setSubmenuPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [visible, onClose]);

  // Close menu on escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [visible, onClose]);

  const handleItemClick = (item: ContextMenuItem, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (item.disabled) return;

    if (item.submenu) {
      // Toggle submenu
      if (activeSubmenu === item.id) {
        setActiveSubmenu(null);
      } else {
        setActiveSubmenu(item.id);
        // Position submenu to the right of the current item
        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
        setSubmenuPosition({
          x: rect.right + 5,
          y: rect.top
        });
      }
    } else if (item.action) {
      // Execute action and close menu
      item.action();
      onClose();
    }
  };

  const handleMouseEnter = (item: ContextMenuItem, event: React.MouseEvent) => {
    if (item.submenu) {
      setActiveSubmenu(item.id);
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      setSubmenuPosition({
        x: rect.right + 5,
        y: rect.top
      });
    }
  };

  const renderMenuItem = (item: ContextMenuItem) => {
    if (item.separator) {
      return <div key={item.id} className="imhex-menu-separator" />;
    }

    return (
      <div
        key={item.id}
        className={`imhex-menu-item ${item.disabled ? 'disabled' : ''} ${
          activeSubmenu === item.id ? 'active' : ''
        }`}
        onClick={(e) => handleItemClick(item, e)}
        onMouseEnter={(e) => handleMouseEnter(item, e)}
      >
        <div className="imhex-menu-item-content">
          <span className="imhex-menu-icon">{item.icon}</span>
          <span className="imhex-menu-label">{item.label}</span>
          {item.submenu && <span className="imhex-menu-arrow">▶</span>}
        </div>
      </div>
    );
  };

  const renderSubmenu = (item: ContextMenuItem) => {
    if (!item.submenu || activeSubmenu !== item.id) return null;

    return (
      <div
        className="imhex-submenu"
        style={{
          left: submenuPosition.x,
          top: submenuPosition.y
        }}
      >
        {item.submenu.map(renderMenuItem)}
      </div>
    );
  };

  if (!visible) return null;

  return (
    <>
      <div
        ref={menuRef}
        className="imhex-context-menu"
        style={{
          left: position.x,
          top: position.y
        }}
      >
        <div className="imhex-menu-header">
          <span className="imhex-menu-title">Context Actions</span>
          <div className="imhex-menu-target-info">
            {targetItem && (
              <span className="imhex-target-type">{targetItem.type?.toUpperCase()}</span>
            )}
          </div>
        </div>
        
        <div className="imhex-menu-content">
          {items.map(renderMenuItem)}
        </div>

        {/* Render active submenu */}
        {items.map(item => renderSubmenu(item))}
      </div>
      
      {/* Backdrop */}
      <div className="imhex-menu-backdrop" onClick={onClose} />
    </>
  );
};

export default ImHexContextMenu;