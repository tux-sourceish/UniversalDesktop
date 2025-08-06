/**
 * μ7_useUniversalContextMenu - DONNER (☳) Events/Interactions
 * 
 * Universal context menu hook providing intelligent, context-aware menu system
 * with Tauri-ready architecture and μX-Bagua integration.
 * 
 * Features:
 * - Dynamic menu building based on context type
 * - Algebraic transistor visibility logic
 * - Platform abstraction for native/web environments
 * - AI context manager integration
 * - Event-driven architecture with proper cleanup
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { UDFormat } from '../core/UDFormat';
import type { 
  μ7_ContextMenuData, 
  μ7_MenuItem, 
  μ7_MenuSection, 
  μ7_ContextMenuProvider,
  μ7_ContextMenuConfig,
  μ7_PlatformContextMenu,
  FileSystemItem
} from '../types/ContextMenuTypes';
import type { DesktopItemData } from '../types';

interface μ7_UniversalContextMenuOptions {
  config?: Partial<μ7_ContextMenuConfig>;
  onItemSelect?: (item: μ7_MenuItem, context: any) => void;
  onMenuShow?: (data: μ7_ContextMenuData) => void;
  onMenuHide?: (reason: string) => void;
  aiContextManager?: any; // Integration with μ6_useContextManager
}

export const μ7_useUniversalContextMenu = (
  options: μ7_UniversalContextMenuOptions = {}
) => {
  // Configuration with defaults
  const config: μ7_ContextMenuConfig = useMemo(() => ({
    enableAnimations: true,
    maxWidth: 300,
    showIcons: true,
    showShortcuts: true,
    darkMode: true,
    position: 'smart' as const,
    closeOnAction: true,
    preventOverflow: true,
    ...options.config
  }), [options.config]);

  // State Management
  const [menuData, setMenuData] = useState<μ7_ContextMenuData | null>(null);
  const [registeredSections, setRegisteredSections] = useState<Map<string, μ7_MenuSection>>(new Map());
  const [dynamicItems, setDynamicItems] = useState<Map<string, μ7_MenuItem[]>>(new Map());
  
  // Refs for cleanup and positioning
  const menuRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Platform Detection (Tauri-Ready)
  const platform: μ7_PlatformContextMenu = useMemo(() => ({
    supportsNativeMenus: !!(window as any).__TAURI__,
    platform: (window as any).__TAURI__ ? 'tauri' : 'browser',
    showNativeMenu: async (_items: μ7_MenuItem[], _x: number, _y: number) => {
      if ((window as any).__TAURI__) {
        // Future Tauri implementation
        try {
          try {
            // TODO: Fix Tauri import - const { invoke } = await import('@tauri-apps/api/tauri');
            // TODO: Fix Tauri invoke - return await invoke('show_context_menu', { items, x, y });
            return null;
          } catch (error) {
            // Fallback for browser environment
            console.warn('Tauri not available, using browser clipboard fallback');
            return null;
          }
        } catch (error) {
          console.warn('Tauri invoke not available in browser environment');
          return null;
        }
      }
      return null;
    }
  }), []);

  // Algebraic Transistor for Visibility Logic
  const μ7_calculateVisibility = useCallback((condition: boolean): number => {
    return UDFormat.transistor(condition);
  }, []);

  // Core Menu Sections Registry
  const defaultSections = useMemo((): μ7_MenuSection[] => [
    // Canvas Context Sections
    {
      id: 'canvas-create',
      title: 'Erstellen',
      order: 1,
      contextTypes: ['canvas'],
      visible: 1,
      items: [
        {
          id: 'create-note',
          label: 'Notizzettel',
          icon: '📝',
          action: () => options.onItemSelect?.({ id: 'create-note' } as any, { type: 'notizzettel' }),
          visible: 1,
          enabled: true,
          role: 'create'
        },
        {
          id: 'create-table',
          label: 'Tabelle',
          icon: '📊',
          action: () => options.onItemSelect?.({ id: 'create-table' } as any, { type: 'tabelle' }),
          visible: 1,
          enabled: true,
          role: 'create'
        },
        {
          id: 'create-code',
          label: 'Code Editor',
          icon: '💻',
          action: () => options.onItemSelect?.({ id: 'create-code' } as any, { type: 'code' }),
          visible: 1,
          enabled: true,
          role: 'create'
        },
        {
          id: 'create-terminal',
          label: 'Terminal',
          icon: '⚫',
          action: () => options.onItemSelect?.({ id: 'create-terminal' } as any, { type: 'terminal' }),
          visible: 1,
          enabled: true,
          role: 'create'
        },
        {
          id: 'create-browser',
          label: 'Browser',
          icon: '🌐',
          action: () => options.onItemSelect?.({ id: 'create-browser' } as any, { type: 'browser' }),
          visible: 1,
          enabled: true,
          role: 'create'
        },
        {
          id: 'create-calendar',
          label: 'Kalender',
          icon: '📅',
          action: () => options.onItemSelect?.({ id: 'create-calendar' } as any, { type: 'calendar' }),
          visible: 1,
          enabled: true,
          role: 'create'
        },
        {
          id: 'create-media',
          label: 'Media Player',
          icon: '🎬',
          action: () => options.onItemSelect?.({ id: 'create-media' } as any, { type: 'media' }),
          visible: 1,
          enabled: true,
          role: 'create'
        }
      ]
    },
    
    // Window Context Sections
    {
      id: 'window-actions',
      title: 'Fenster-Aktionen',
      order: 1,
      contextTypes: ['window'],
      visible: 1,
      items: [
        {
          id: 'rename-window',
          label: 'Umbenennen',
          icon: '✏️',
          action: () => {},
          visible: 1,
          enabled: true,
          shortcut: 'F2',
          role: 'edit'
        },
        {
          id: 'duplicate-window',
          label: 'Duplizieren',
          icon: '📋',
          action: () => {},
          visible: 1,
          enabled: true,
          shortcut: 'Ctrl+D',
          role: 'create'
        },
        {
          id: 'delete-window',
          label: 'Löschen',
          icon: '🗑️',
          action: () => {},
          visible: 1,
          enabled: true,
          shortcut: 'Del',
          role: 'delete'
        }
      ]
    },

    // AI Integration Section
    {
      id: 'ai-context',
      title: 'KI-Kontext',
      order: 2,
      contextTypes: ['window', 'file'],
      visible: 1,
      items: [
        {
          id: 'add-to-context',
          label: 'Zu AI-Kontext hinzufügen',
          icon: '📌',
          action: () => {},
          visible: 1,
          enabled: true,
          role: 'ai'
        },
        {
          id: 'remove-from-context',
          label: 'Aus AI-Kontext entfernen',
          icon: '📍',
          action: () => {},
          visible: 0, // Will be calculated dynamically
          enabled: true,
          role: 'ai'
        }
      ]
    },

    // File System Sections
    {
      id: 'file-operations',
      title: 'Datei-Operationen',
      order: 1,
      contextTypes: ['file', 'directory'],
      visible: 1,
      items: [
        {
          id: 'open-file',
          label: 'Öffnen',
          icon: '📂',
          action: () => {},
          visible: 1,
          enabled: true,
          role: 'navigate'
        },
        {
          id: 'rename-file',
          label: 'Umbenennen',
          icon: '✏️',
          action: () => {},
          visible: 1,
          enabled: true,
          shortcut: 'F2',
          role: 'edit'
        },
        {
          id: 'copy-file',
          label: 'Kopieren',
          icon: '📋',
          action: () => {},
          visible: 1,
          enabled: true,
          shortcut: 'Ctrl+C',
          role: 'edit'
        },
        {
          id: 'cut-file',
          label: 'Ausschneiden',
          icon: '✂️',
          action: () => {},
          visible: 1,
          enabled: true,
          shortcut: 'Ctrl+X',
          role: 'edit'
        },
        {
          id: 'delete-file',
          label: 'Löschen',
          icon: '🗑️',
          action: () => {},
          visible: 1,
          enabled: true,
          shortcut: 'Del',
          role: 'delete'
        }
      ]
    }
  ], [options.onItemSelect]);

  // Initialize default sections
  useEffect(() => {
    const sectionMap = new Map<string, μ7_MenuSection>();
    defaultSections.forEach(section => {
      sectionMap.set(section.id, section);
    });
    setRegisteredSections(sectionMap);
  }, [defaultSections]);

  // Smart Position Calculation
  const calculateMenuPosition = useCallback((x: number, y: number, menuElement?: HTMLElement) => {
    if (!config.preventOverflow || !menuElement) {
      return { x, y };
    }

    const menuRect = menuElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let adjustedX = x;
    let adjustedY = y;

    // Prevent horizontal overflow
    if (x + menuRect.width > viewportWidth) {
      adjustedX = viewportWidth - menuRect.width - 10;
    }

    // Prevent vertical overflow
    if (y + menuRect.height > viewportHeight) {
      adjustedY = viewportHeight - menuRect.height - 10;
    }

    // Ensure minimum distance from edges
    adjustedX = Math.max(10, adjustedX);
    adjustedY = Math.max(10, adjustedY);

    return { x: adjustedX, y: adjustedY };
  }, [config.preventOverflow]);

  // Build Dynamic Menu based on Context
  const buildContextMenu = useCallback((
    contextType: string, 
    targetItem?: DesktopItemData | FileSystemItem
  ): μ7_MenuSection[] => {
    const relevantSections = Array.from(registeredSections.values())
      .filter(section => section.contextTypes.includes(contextType as any))
      .sort((a, b) => a.order - b.order);

    return relevantSections.map(section => ({
      ...section,
      items: section.items.map(item => {
        // Dynamic visibility calculation
        let visibility = item.visible;
        
        // Special logic for AI context items
        if (item.id === 'remove-from-context' && targetItem) {
          const isInContext = options.aiContextManager?.isInContext?.(targetItem.id) || false;
          visibility = μ7_calculateVisibility(isInContext);
        }
        
        if (item.id === 'add-to-context' && targetItem) {
          const isInContext = options.aiContextManager?.isInContext?.(targetItem.id) || false;
          visibility = μ7_calculateVisibility(!isInContext);
        }

        return {
          ...item,
          visible: visibility,
          action: () => {
            item.action();
            if (config.closeOnAction) {
              hideMenu();
            }
          }
        };
      }).filter(item => item.visible === 1) // Only show visible items
    })).filter(section => section.items.length > 0); // Only show sections with visible items
  }, [registeredSections, options.aiContextManager, μ7_calculateVisibility, config.closeOnAction]);

  // Show Menu
  const showMenu = useCallback(async (data: μ7_ContextMenuData) => {
    // Clear any existing hide timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    // Try native menu first (Tauri)
    if (platform.supportsNativeMenus && platform.showNativeMenu) {
      const sections = buildContextMenu(data.contextType, data.targetItem);
      const allItems = sections.flatMap(section => section.items);
      
      try {
        const selectedId = await platform.showNativeMenu(allItems, data.position.x, data.position.y);
        if (selectedId) {
          const selectedItem = allItems.find(item => item.id === selectedId);
          if (selectedItem) {
            options.onItemSelect?.(selectedItem, data);
          }
        }
        return;
      } catch (error) {
        console.warn('Native context menu failed, falling back to web implementation:', error);
      }
    }

    // Web implementation
    setMenuData(data);
    options.onMenuShow?.(data);
  }, [platform, buildContextMenu, options]);

  // Hide Menu
  const hideMenu = useCallback((reason: string = 'programmatic') => {
    setMenuData(null);
    options.onMenuHide?.(reason);
  }, [options]);

  // Section Management
  const registerSection = useCallback((section: μ7_MenuSection) => {
    setRegisteredSections(prev => new Map(prev.set(section.id, section)));
  }, []);

  const unregisterSection = useCallback((sectionId: string) => {
    setRegisteredSections(prev => {
      const next = new Map(prev);
      next.delete(sectionId);
      return next;
    });
  }, []);

  const updateSection = useCallback((sectionId: string, updates: Partial<μ7_MenuSection>) => {
    setRegisteredSections(prev => {
      const section = prev.get(sectionId);
      if (!section) return prev;
      
      const next = new Map(prev);
      next.set(sectionId, { ...section, ...updates });
      return next;
    });
  }, []);

  // Dynamic Item Management
  const addDynamicItem = useCallback((contextType: string, item: μ7_MenuItem) => {
    setDynamicItems(prev => {
      const next = new Map(prev);
      const existing = next.get(contextType) || [];
      next.set(contextType, [...existing, item]);
      return next;
    });
  }, []);

  const removeDynamicItem = useCallback((contextType: string, itemId: string) => {
    setDynamicItems(prev => {
      const next = new Map(prev);
      const existing = next.get(contextType) || [];
      next.set(contextType, existing.filter(item => item.id !== itemId));
      return next;
    });
  }, []);

  // Event Handling
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        hideMenu('click-outside');
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && menuData?.visible) {
        hideMenu('escape');
      }
    };

    if (menuData?.visible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [menuData?.visible, hideMenu]);

  // Provider Interface
  const provider: μ7_ContextMenuProvider = useMemo(() => ({
    show: showMenu,
    hide: hideMenu,
    isVisible: () => !!menuData?.visible,
    registerSection,
    unregisterSection,
    updateSection,
    buildMenu: buildContextMenu,
    addDynamicItem,
    removeDynamicItem,
    getMenuState: () => ({ menuData, registeredSections, dynamicItems }),
    setMenuState: (state: any) => {
      if (state.menuData) setMenuData(state.menuData);
      if (state.registeredSections) setRegisteredSections(state.registeredSections);
      if (state.dynamicItems) setDynamicItems(state.dynamicItems);
    }
  }), [
    showMenu, hideMenu, menuData, registerSection, unregisterSection, 
    updateSection, buildContextMenu, addDynamicItem, removeDynamicItem, 
    registeredSections, dynamicItems
  ]);

  return {
    // Core State
    menuData,
    isVisible: !!menuData?.visible,
    
    // Menu Management
    showMenu,
    hideMenu,
    
    // Section Management
    registerSection,
    unregisterSection,
    updateSection,
    registeredSections: Array.from(registeredSections.values()),
    
    // Dynamic Items
    addDynamicItem,
    removeDynamicItem,
    
    // Menu Building
    buildContextMenu,
    
    // Configuration
    config,
    platform,
    
    // Provider Interface
    provider,
    
    // Refs for component integration
    menuRef,
    calculateMenuPosition
  };
};