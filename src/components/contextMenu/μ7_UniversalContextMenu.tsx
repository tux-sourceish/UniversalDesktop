import React, { useCallback, useMemo, useState } from 'react';
import { UDFormat } from '../../core/UDFormat';

/**
 * μ7_UniversalContextMenu - DONNER (☳) Events/Interactions
 * 
 * Universal Context Menu System for UniversalDesktop
 * - Context-aware actions for files, folders, windows, and canvas
 * - Keyboard shortcut teaching functionality  
 * - File type specific actions (.ud, images, code files)
 * - Preview functionality for actions
 * - Disabled state explanations
 * - μX-Bagua action categorization
 */

export interface ContextAction {
  id: string;
  label: string;
  icon: string;
  shortcut?: string;
  baguaCategory: number;
  enabled: boolean;
  submenu?: ContextAction[];
  preview?: () => string;
  description?: string;
  disabledReason?: string;
  separator?: boolean;
}

export interface UniversalContextMenuProps {
  element?: any;
  visible: boolean;
  x: number;
  y: number;
  contextType: 'file' | 'folder' | 'canvas' | 'window' | 'content';
  onClose: () => void;
  onItemAction: (action: string, item?: any) => void;
  clipboardHasContent?: boolean;
  hasSelection?: boolean;
  currentPath?: string;
  selectedFiles?: string[];
}

export const μ7_UniversalContextMenu: React.FC<UniversalContextMenuProps> = ({
  element,
  visible,
  x,
  y,
  contextType,
  onClose,
  onItemAction,
  clipboardHasContent = false,
  hasSelection: _hasSelection = false,
  currentPath: _currentPath = '',
  selectedFiles: _selectedFiles = []
}) => {
  const [hoveredSubmenu, setHoveredSubmenu] = useState<string | null>(null);
  const [submenuPosition, setSubmenuPosition] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  
  // Get actions for the current element and context
  const getActionsForElement = useCallback((element: any, type: string): ContextAction[] => {
    const actions: ContextAction[] = [];

    if (type === 'file') {
      // File Operations (☵ WASSER - Flow/Procedures)
      actions.push({
        id: 'open',
        label: 'Open',
        icon: '📂',
        shortcut: 'Enter',
        baguaCategory: UDFormat.BAGUA.WASSER,
        enabled: true,
        description: 'Open file with default application'
      });

      actions.push({
        id: 'open-with',
        label: 'Open with...',
        icon: '🔧',
        shortcut: 'Shift+Enter',
        baguaCategory: UDFormat.BAGUA.WASSER,
        enabled: true,
        submenu: [
          {
            id: 'open-text-editor',
            label: 'Text Editor',
            icon: '📝',
            baguaCategory: UDFormat.BAGUA.FEUER,
            enabled: true
          },
          {
            id: 'open-code-window',
            label: 'Code Window',
            icon: '💻',
            baguaCategory: UDFormat.BAGUA.FEUER,
            enabled: true
          },
          {
            id: 'open-preview',
            label: 'Preview',
            icon: '👁️',
            baguaCategory: UDFormat.BAGUA.SEE,
            enabled: true
          }
        ]
      });

      actions.push({ id: 'separator-1', label: '', icon: '', baguaCategory: 0, enabled: true, separator: true });

      // Clipboard Operations (☳ DONNER - Events)
      actions.push({
        id: 'copy',
        label: 'Copy',
        icon: '📋',
        shortcut: 'Ctrl+C',
        baguaCategory: UDFormat.BAGUA.DONNER,
        enabled: true,
        description: 'Copy file to clipboard'
      });

      actions.push({
        id: 'cut',
        label: 'Cut',
        icon: '✂️',
        shortcut: 'Ctrl+X',
        baguaCategory: UDFormat.BAGUA.DONNER,
        enabled: true,
        description: 'Cut file to clipboard'
      });

      actions.push({
        id: 'paste',
        label: 'Paste',
        icon: '📄',
        shortcut: 'Ctrl+V',
        baguaCategory: UDFormat.BAGUA.DONNER,
        enabled: clipboardHasContent,
        disabledReason: clipboardHasContent ? undefined : 'Clipboard is empty'
      });

      actions.push({
        id: 'duplicate',
        label: 'Duplicate',
        icon: '📄',
        shortcut: 'Ctrl+D',
        baguaCategory: UDFormat.BAGUA.WASSER,
        enabled: true,
        description: 'Create a copy of this file'
      });

      actions.push({ id: 'separator-2', label: '', icon: '', baguaCategory: 0, enabled: true, separator: true });

      // File Management (☶ BERG - Setup/Properties)
      actions.push({
        id: 'rename',
        label: 'Rename',
        icon: '✏️',
        shortcut: 'F2',
        baguaCategory: UDFormat.BAGUA.BERG,
        enabled: true,
        description: 'Rename this file'
      });

      actions.push({
        id: 'delete',
        label: 'Delete',
        icon: '🗑️',
        shortcut: 'Delete',
        baguaCategory: UDFormat.BAGUA.BERG,
        enabled: true,
        description: 'Move file to trash'
      });

      actions.push({
        id: 'properties',
        label: 'Properties',
        icon: 'ℹ️',
        shortcut: 'Alt+Enter',
        baguaCategory: UDFormat.BAGUA.SEE,
        enabled: true,
        description: 'Show file properties and metadata'
      });

      actions.push({ id: 'separator-3', label: '', icon: '', baguaCategory: 0, enabled: true, separator: true });

      // Transform Actions (☲ FEUER - Functions)
      actions.push({
        id: 'transform',
        label: 'Transform to',
        icon: '🔄',
        baguaCategory: UDFormat.BAGUA.FEUER,
        enabled: true,
        submenu: [
          {
            id: 'transform-to-ud',
            label: 'UniversalDesktop Document',
            icon: '📋',
            baguaCategory: UDFormat.BAGUA.FEUER,
            enabled: true,
            description: 'Convert to .ud document format'
          },
          {
            id: 'transform-to-workspace',
            label: 'Workspace Item',
            icon: '🎯',
            baguaCategory: UDFormat.BAGUA.FEUER,
            enabled: true,
            description: 'Add as spatial workspace item'
          }
        ]
      });

      // File type specific actions
      if (element?.name?.endsWith('.ud')) {
        actions.push({
          id: 'preview-minimap',
          label: 'Preview in Minimap',
          icon: '🗺️',
          baguaCategory: UDFormat.BAGUA.SEE,
          enabled: true,
          description: 'Show .ud content in minimap'
        });
      }

      if (element?.name?.match(/\.(jpg|jpeg|png|gif|svg)$/i)) {
        actions.push({
          id: 'set-canvas-background',
          label: 'Set as Canvas Background',
          icon: '🎨',
          baguaCategory: UDFormat.BAGUA.BERG,
          enabled: true,
          description: 'Use image as canvas background'
        });
      }

      if (element?.name?.match(/\.(js|ts|tsx|jsx|py|cpp|rs|java)$/i)) {
        actions.push({
          id: 'run-with-agent',
          label: 'Run with Agent',
          icon: '🤖',
          baguaCategory: UDFormat.BAGUA.FEUER,
          enabled: true,
          description: 'Execute code with AI agent'
        });
      }

    } else if (type === 'folder') {
      // Folder Operations
      actions.push({
        id: 'open',
        label: 'Open',
        icon: '📁',
        shortcut: 'Enter',
        baguaCategory: UDFormat.BAGUA.WASSER,
        enabled: true,
        description: 'Navigate into folder'
      });

      actions.push({
        id: 'open-new-window',
        label: 'Open in New Window',
        icon: '🆕',
        shortcut: 'Ctrl+Enter',
        baguaCategory: UDFormat.BAGUA.WIND,
        enabled: true,
        description: 'Open folder in new file manager window'
      });

      actions.push({ id: 'separator-1', label: '', icon: '', baguaCategory: 0, enabled: true, separator: true });

      // Clipboard Operations
      actions.push({
        id: 'copy',
        label: 'Copy',
        icon: '📋',
        shortcut: 'Ctrl+C',
        baguaCategory: UDFormat.BAGUA.DONNER,
        enabled: true
      });

      actions.push({
        id: 'cut',
        label: 'Cut',
        icon: '✂️',
        shortcut: 'Ctrl+X',
        baguaCategory: UDFormat.BAGUA.DONNER,
        enabled: true
      });

      actions.push({
        id: 'paste',
        label: 'Paste',
        icon: '📄',
        shortcut: 'Ctrl+V',
        baguaCategory: UDFormat.BAGUA.DONNER,
        enabled: clipboardHasContent,
        disabledReason: clipboardHasContent ? undefined : 'Clipboard is empty'
      });

      actions.push({ id: 'separator-2', label: '', icon: '', baguaCategory: 0, enabled: true, separator: true });

      // Folder Management
      actions.push({
        id: 'rename',
        label: 'Rename',
        icon: '✏️',
        shortcut: 'F2',
        baguaCategory: UDFormat.BAGUA.BERG,
        enabled: true
      });

      actions.push({
        id: 'delete',
        label: 'Delete',
        icon: '🗑️',
        shortcut: 'Delete',
        baguaCategory: UDFormat.BAGUA.BERG,
        enabled: true
      });

      actions.push({
        id: 'create-ud-archive',
        label: 'Create .ud Archive',
        icon: '📦',
        baguaCategory: UDFormat.BAGUA.FEUER,
        enabled: true,
        description: 'Archive folder as .ud document'
      });

    } else if (type === 'canvas') {
      // Canvas Operations
      actions.push({
        id: 'create-file',
        label: 'New File',
        icon: '📄',
        shortcut: 'Ctrl+N',
        baguaCategory: UDFormat.BAGUA.HIMMEL,
        enabled: true
      });

      actions.push({
        id: 'create-folder',
        label: 'New Folder',
        icon: '📁',
        shortcut: 'Ctrl+Shift+N',
        baguaCategory: UDFormat.BAGUA.HIMMEL,
        enabled: true
      });

      actions.push({ id: 'separator-1', label: '', icon: '', baguaCategory: 0, enabled: true, separator: true });

      actions.push({
        id: 'paste',
        label: 'Paste',
        icon: '📄',
        shortcut: 'Ctrl+V',
        baguaCategory: UDFormat.BAGUA.DONNER,
        enabled: clipboardHasContent,
        disabledReason: clipboardHasContent ? undefined : 'Clipboard is empty'
      });

      actions.push({ id: 'separator-2', label: '', icon: '', baguaCategory: 0, enabled: true, separator: true });

      actions.push({
        id: 'refresh',
        label: 'Refresh',
        icon: '🔄',
        shortcut: 'F5',
        baguaCategory: UDFormat.BAGUA.WASSER,
        enabled: true
      });

      actions.push({
        id: 'toggle-hidden',
        label: 'Show Hidden Files',
        icon: '👁️',
        shortcut: 'Ctrl+H',
        baguaCategory: UDFormat.BAGUA.SEE,
        enabled: true
      });

      actions.push({ id: 'separator-3', label: '', icon: '', baguaCategory: 0, enabled: true, separator: true });

      // μ8_ERDE - Workspace Export with Binary Optimization
      actions.push({
        id: 'export-workspace',
        label: 'Workspace exportieren...',
        icon: '📤',
        shortcut: 'Ctrl+E',
        baguaCategory: UDFormat.BAGUA.ERDE,
        enabled: true,
        description: 'Export current workspace with optimization options',
        submenu: [
          {
            id: 'export-standard',
            label: 'Als .ud (Standard)',
            icon: '📋',
            baguaCategory: UDFormat.BAGUA.ERDE,
            enabled: true,
            description: 'Standard .ud binary format'
          },
          {
            id: 'export-traditional',
            label: 'Als .ud (Optimiert - Traditionell)',
            icon: '🏺',
            baguaCategory: UDFormat.BAGUA.BERG,
            enabled: true,
            description: 'Traditional optimization - balanced size/speed'
          },
          {
            id: 'export-algebraic',
            label: 'Als .ud (Optimiert - Algebraisch)',
            icon: '🧮',
            baguaCategory: UDFormat.BAGUA.FEUER,
            enabled: true,
            description: 'Algebraic optimization - maximum compression'
          },
          {
            id: 'export-zip',
            label: 'Als .zip Archiv',
            icon: '📦',
            baguaCategory: UDFormat.BAGUA.ERDE,
            enabled: false,  // Future feature
            description: 'ZIP archive with metadata (coming soon)',
            disabledReason: 'Coming in future update'
          }
        ]
      });
    }

    return actions;
  }, [clipboardHasContent]);

  // Get current actions
  const actions = useMemo(() => {
    return getActionsForElement(element, contextType);
  }, [element, contextType, getActionsForElement]);

  // Handle action click
  const handleActionClick = useCallback((action: ContextAction) => {
    if (!action.enabled) return;
    
    // Don't close menu for actions with submenus
    if (action.submenu && action.submenu.length > 0) {
      setHoveredSubmenu(hoveredSubmenu === action.id ? null : action.id);
      return;
    }
    
    onItemAction(action.id, element);
    onClose();
  }, [onItemAction, element, onClose, hoveredSubmenu]);

  // Render menu item
  const renderMenuItem = useCallback((action: ContextAction, level = 0) => {
    if (action.separator) {
      return (
        <div
          key={action.id}
          style={{
            height: '1px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            margin: '4px 0'
          }}
        />
      );
    }

    return (
      <div
        key={action.id}
        onClick={() => handleActionClick(action)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '8px 12px',
          cursor: action.enabled ? 'pointer' : 'not-allowed',
          fontSize: '13px',
          color: action.enabled ? '#e5e5e5' : '#666',
          opacity: action.enabled ? 1 : 0.5,
          transition: 'all 0.15s ease',
          paddingLeft: `${12 + (level * 16)}px`,
          position: 'relative'
        }}
        onMouseEnter={(e) => {
          if (action.enabled) {
            e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.8)';
            e.currentTarget.style.color = 'white';
            // Show submenu on hover and calculate position
            if (action.submenu && action.submenu.length > 0) {
              const rect = e.currentTarget.getBoundingClientRect();
              setSubmenuPosition({
                x: rect.right + 5, // Position 5px to the right of the menu item
                y: rect.top // Align with the top of the menu item
              });
              setHoveredSubmenu(action.id);
            }
          }
        }}
        onMouseLeave={(e) => {
          if (action.enabled) {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#e5e5e5';
          }
        }}
        title={action.description || (action.disabledReason && !action.enabled ? action.disabledReason : undefined)}
      >
        {/* Revolutionary File Type Icon Integration */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '6px',
          minWidth: '20px' 
        }}>
          <span style={{ fontSize: '14px' }}>{action.icon}</span>
          {/* Show file's Bagua indicator for file-specific actions */}
          {element?.metadata?.baguaSymbol && (action.id === 'open' || action.id === 'properties') && (
            <div 
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: element.metadata.baguaColor || '#696969',
                border: '1px solid rgba(255,255,255,0.4)',
                boxShadow: `0 0 4px ${element.metadata.baguaColor || '#696969'}40`,
                flexShrink: 0
              }}
              title={element.metadata.baguaDescription}
            />
          )}
        </div>
        <span style={{ flex: 1 }}>{action.label}</span>
        {action.shortcut && (
          <span style={{ 
            fontSize: '11px', 
            opacity: 0.7,
            fontFamily: 'monospace',
            color: action.enabled ? '#a1a1aa' : '#555'
          }}>
            {action.shortcut}
          </span>
        )}
        {action.submenu && (
          <span style={{ fontSize: '12px', opacity: 0.7 }}>▶</span>
        )}
        
        {/* Submenu - Rendered at top level to avoid scroll container issues */}
      </div>
    );
  }, [handleActionClick, hoveredSubmenu]);

  // Early return if not visible
  if (!visible) return null;

  return (
    <>
      {/* Background Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1000,
          background: 'transparent'
        }}
      />

      {/* Context Menu */}
      <div
        style={{
          position: 'fixed',
          left: `${x}px`,
          top: `${y}px`,
          minWidth: '220px',
          maxWidth: '300px',
          backgroundColor: 'rgba(30, 30, 30, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
          zIndex: 1001,
          overflow: 'hidden',
          animation: 'contextMenuAppear 0.15s ease-out'
        }}
      >
        {/* Menu Header */}
        <div style={{
          padding: '8px 12px',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: '11px',
          fontWeight: '600',
          color: '#a1a1aa',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
            {contextType === 'file' && (
              <>
                <span>📄 {element?.name || 'File'}</span>
                {/* Revolutionary Bagua Context Header */}
                {element?.metadata?.baguaSymbol && (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    marginLeft: 'auto',
                    fontSize: '10px',
                    opacity: 0.8
                  }}>
                    <div 
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: element.metadata.baguaColor || '#696969',
                        border: '1px solid rgba(255,255,255,0.3)'
                      }}
                    />
                    <span style={{ color: element.metadata.baguaColor }}>
                      {element.metadata.baguaSymbol} {element.metadata.baguaDescription?.split(' - ')[0]}
                    </span>
                  </div>
                )}
              </>
            )}
            {contextType === 'folder' && (
              <>
                <span>📁 {element?.name || 'Folder'}</span>
                {element?.metadata?.baguaSymbol && (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    marginLeft: 'auto',
                    fontSize: '10px',
                    opacity: 0.8
                  }}>
                    <span style={{ color: '#8B4513' }}>⛰ Directory</span>
                  </div>
                )}
              </>
            )}
            {contextType === 'canvas' && '🖥️ File Manager'}
            {contextType === 'window' && '🪟 Window'}
            {contextType === 'content' && '📄 Content'}
          </div>
        </div>

        {/* Menu Items */}
        <div 
          style={{ 
            maxHeight: '400px', 
            overflowY: 'auto',
            position: 'relative' // Ensure relative positioning for proper submenu placement
          }}
        >
          {actions.map(action => renderMenuItem(action))}
        </div>

        {/* Revolutionary Bagua Footer */}
        <div style={{
          padding: '6px 12px',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: '10px',
          color: '#888',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px'
        }}>
          <div>Right-click discovers features • Shortcuts teach efficiency</div>
          {element?.metadata?.baguaDescription && (
            <div style={{ 
              fontSize: '9px', 
              opacity: 0.7,
              color: element.metadata.baguaColor,
              fontStyle: 'italic'
            }}>
              {element.metadata.baguaDescription} • I Ching Philosophy
            </div>
          )}
        </div>
      </div>

      {/* Submenu - Rendered at top level to avoid being constrained by scrollable container */}
      {hoveredSubmenu && actions.find(a => a.id === hoveredSubmenu)?.submenu && (
        <div
          style={{
            position: 'fixed',
            left: `${submenuPosition.x}px`,
            top: `${submenuPosition.y}px`,
            minWidth: '250px',
            backgroundColor: 'rgba(30, 30, 30, 0.98)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
            zIndex: 1002,
            overflow: 'hidden',
            animation: 'submenuAppear 0.12s ease-out'
          }}
          onMouseEnter={() => {/* Keep submenu open when hovering */}}
          onMouseLeave={() => setHoveredSubmenu(null)}
        >
          {actions.find(a => a.id === hoveredSubmenu)?.submenu?.map(subAction => (
            <div
              key={subAction.id}
              onClick={() => handleActionClick(subAction)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 12px',
                cursor: subAction.enabled ? 'pointer' : 'not-allowed',
                fontSize: '13px',
                color: subAction.enabled ? '#e5e5e5' : '#666',
                opacity: subAction.enabled ? 1 : 0.5,
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (subAction.enabled) {
                  e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.8)';
                  e.currentTarget.style.color = 'white';
                }
              }}
              onMouseLeave={(e) => {
                if (subAction.enabled) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#e5e5e5';
                }
              }}
              title={subAction.description || (subAction.disabledReason && !subAction.enabled ? subAction.disabledReason : undefined)}
            >
              <span style={{ fontSize: '14px', minWidth: '20px' }}>{subAction.icon}</span>
              <span style={{ flex: 1 }}>{subAction.label}</span>
              {subAction.shortcut && (
                <span style={{ 
                  fontSize: '11px', 
                  opacity: 0.7,
                  fontFamily: 'monospace',
                  color: subAction.enabled ? '#a1a1aa' : '#555'
                }}>
                  {subAction.shortcut}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* CSS Animation */}
      <style>{`
        @keyframes contextMenuAppear {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-5px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes submenuAppear {
          from {
            opacity: 0;
            transform: scale(0.95) translateX(-5px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateX(0);
          }
        }
      `}</style>
    </>
  );
};

// Hook for using the Universal Context Menu
export const useUniversalContextMenu = () => {
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    element: any;
    contextType: 'file' | 'folder' | 'canvas' | 'window' | 'content';
  }>({
    visible: false,
    x: 0,
    y: 0,
    element: null,
    contextType: 'canvas'
  });

  const showContextMenu = useCallback((
    event: React.MouseEvent, 
    element?: any, 
    contextType: 'file' | 'folder' | 'canvas' | 'window' | 'content' = 'canvas'
  ) => {
    event.preventDefault();
    event.stopPropagation();

    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      element,
      contextType
    });
  }, []);

  const hideContextMenu = useCallback(() => {
    setContextMenu(prev => ({ ...prev, visible: false }));
  }, []);

  return {
    contextMenu,
    showContextMenu,
    hideContextMenu
  };
};

export default μ7_UniversalContextMenu;