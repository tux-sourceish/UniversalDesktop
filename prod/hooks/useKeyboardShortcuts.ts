import { useEffect, useCallback, useState } from 'react';

interface KeyboardShortcut {
  id: string;
  keys: string[];
  description: string;
  category: 'navigation' | 'panels' | 'tools' | 'ai' | 'context' | 'general';
  handler: (e: KeyboardEvent) => void;
  enabled: boolean;
  context?: 'global' | 'canvas' | 'panel' | 'input';
}

interface ShortcutHandlers {
  // Navigation
  onNavigateUp?: () => void;
  onNavigateDown?: () => void;
  onNavigateLeft?: () => void;
  onNavigateRight?: () => void;
  onZoomToLevel?: (level: string) => void;
  onResetPosition?: () => void;
  onResetZoom?: () => void;
  
  // Panels
  onTogglePanel?: (panel: string) => void;
  onToggleMinimap?: () => void;
  onToggleBoundaries?: () => void;
  
  // Tools & Actions
  onCreateBookmark?: () => void;
  onCopySelection?: () => void;
  onCutSelection?: () => void;
  onPasteClipboard?: () => void;
  onSelectAll?: () => void;
  onDeleteSelected?: () => void;
  
  // AI & Context
  onToggleAI?: () => void;
  onClearContext?: () => void;
  onOptimizeContext?: () => void;
}

export const useKeyboardShortcuts = (handlers: ShortcutHandlers = {}) => {
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>([]);
  const [activeContext, setActiveContext] = useState<'global' | 'canvas' | 'panel' | 'input'>('global');
  const [shortcutsEnabled, setShortcutsEnabled] = useState(true);

  // Initialize default shortcuts
  const initializeShortcuts = useCallback(() => {
    const defaultShortcuts: Omit<KeyboardShortcut, 'handler'>[] = [
      // Navigation shortcuts
      { id: 'nav-up', keys: ['Ctrl', 'ArrowUp'], description: 'Navigate Up', category: 'navigation', enabled: true, context: 'global' },
      { id: 'nav-down', keys: ['Ctrl', 'ArrowDown'], description: 'Navigate Down', category: 'navigation', enabled: true, context: 'global' },
      { id: 'nav-left', keys: ['Ctrl', 'ArrowLeft'], description: 'Navigate Left', category: 'navigation', enabled: true, context: 'global' },
      { id: 'nav-right', keys: ['Ctrl', 'ArrowRight'], description: 'Navigate Right', category: 'navigation', enabled: true, context: 'global' },
      
      // Zoom levels
      { id: 'zoom-galaxy', keys: ['Ctrl', '1'], description: '🌌 Galaxy View', category: 'navigation', enabled: true, context: 'global' },
      { id: 'zoom-system', keys: ['Ctrl', '2'], description: '🪐 System View', category: 'navigation', enabled: true, context: 'global' },
      { id: 'zoom-planet', keys: ['Ctrl', '3'], description: '🌍 Planet View', category: 'navigation', enabled: true, context: 'global' },
      { id: 'zoom-surface', keys: ['Ctrl', '4'], description: '🏠 Surface View', category: 'navigation', enabled: true, context: 'global' },
      { id: 'zoom-micro', keys: ['Ctrl', '5'], description: '🔬 Microscope View', category: 'navigation', enabled: true, context: 'global' },
      
      // Reset shortcuts
      { id: 'reset-home', keys: ['Ctrl', 'h'], description: 'Home Position', category: 'navigation', enabled: true, context: 'global' },
      { id: 'reset-zoom', keys: ['Ctrl', 'r'], description: 'Reset Zoom', category: 'navigation', enabled: true, context: 'global' },
      
      // Panel shortcuts
      { id: 'toggle-tools', keys: ['Ctrl', 't'], description: 'Toggle Tools Panel', category: 'panels', enabled: true, context: 'global' },
      { id: 'toggle-ai', keys: ['Ctrl', 'a'], description: 'Toggle AI Panel', category: 'panels', enabled: true, context: 'global' },
      { id: 'toggle-territory', keys: ['Ctrl', 'Shift', 't'], description: 'Toggle Territory Panel', category: 'panels', enabled: true, context: 'global' },
      { id: 'toggle-minimap', keys: ['Ctrl', 'm'], description: 'Toggle Minimap', category: 'panels', enabled: true, context: 'global' },
      { id: 'toggle-boundaries', keys: ['Ctrl', 'b'], description: 'Toggle Boundaries', category: 'panels', enabled: true, context: 'global' },
      
      // Action shortcuts
      { id: 'create-bookmark', keys: ['Ctrl', 'Shift', 'b'], description: 'Create Spatial Bookmark', category: 'tools', enabled: true, context: 'global' },
      { id: 'copy', keys: ['Ctrl', 'c'], description: 'Copy Selection', category: 'tools', enabled: true, context: 'canvas' },
      { id: 'cut', keys: ['Ctrl', 'x'], description: 'Cut Selection', category: 'tools', enabled: true, context: 'canvas' },
      { id: 'paste', keys: ['Ctrl', 'v'], description: 'Paste', category: 'tools', enabled: true, context: 'canvas' },
      { id: 'select-all', keys: ['Ctrl', 'a'], description: 'Select All', category: 'tools', enabled: true, context: 'canvas' },
      { id: 'delete', keys: ['Delete'], description: 'Delete Selected', category: 'tools', enabled: true, context: 'canvas' },
      
      // Context shortcuts
      { id: 'clear-context', keys: ['Ctrl', 'Shift', 'c'], description: 'Clear AI Context', category: 'context', enabled: true, context: 'global' },
      { id: 'optimize-context', keys: ['Ctrl', 'Shift', 'o'], description: 'Optimize Context', category: 'context', enabled: true, context: 'global' },
      
      // General shortcuts
      { id: 'help', keys: ['F1'], description: 'Show Help', category: 'general', enabled: true, context: 'global' },
      { id: 'escape', keys: ['Escape'], description: 'Cancel/Close', category: 'general', enabled: true, context: 'global' }
    ];

    const shortcutsWithHandlers: KeyboardShortcut[] = defaultShortcuts.map(shortcut => ({
      ...shortcut,
      handler: createShortcutHandler(shortcut.id)
    }));

    setShortcuts(shortcutsWithHandlers);
  }, []);

  // Create handler for specific shortcut
  const createShortcutHandler = useCallback((shortcutId: string) => {
    return (e: KeyboardEvent) => {
      if (!shortcutsEnabled) return;

      switch (shortcutId) {
        // Navigation
        case 'nav-up':
          e.preventDefault();
          handlers.onNavigateUp?.();
          break;
        case 'nav-down':
          e.preventDefault();
          handlers.onNavigateDown?.();
          break;
        case 'nav-left':
          e.preventDefault();
          handlers.onNavigateLeft?.();
          break;
        case 'nav-right':
          e.preventDefault();
          handlers.onNavigateRight?.();
          break;
          
        // Zoom levels
        case 'zoom-galaxy':
          e.preventDefault();
          handlers.onZoomToLevel?.('GALAXY');
          break;
        case 'zoom-system':
          e.preventDefault();
          handlers.onZoomToLevel?.('SYSTEM');
          break;
        case 'zoom-planet':
          e.preventDefault();
          handlers.onZoomToLevel?.('PLANET');
          break;
        case 'zoom-surface':
          e.preventDefault();
          handlers.onZoomToLevel?.('SURFACE');
          break;
        case 'zoom-micro':
          e.preventDefault();
          handlers.onZoomToLevel?.('MICROSCOPE');
          break;
          
        // Reset actions
        case 'reset-home':
          e.preventDefault();
          handlers.onResetPosition?.();
          break;
        case 'reset-zoom':
          e.preventDefault();
          handlers.onResetZoom?.();
          break;
          
        // Panel toggles
        case 'toggle-tools':
          e.preventDefault();
          handlers.onTogglePanel?.('tools');
          break;
        case 'toggle-ai':
          // Only prevent default if we're not in an input field
          if (!isInInputField(e.target as Element)) {
            e.preventDefault();
            handlers.onTogglePanel?.('ai');
          }
          break;
        case 'toggle-territory':
          e.preventDefault();
          handlers.onTogglePanel?.('territory');
          break;
        case 'toggle-minimap':
          e.preventDefault();
          handlers.onToggleMinimap?.();
          break;
        case 'toggle-boundaries':
          e.preventDefault();
          handlers.onToggleBoundaries?.();
          break;
          
        // Actions
        case 'create-bookmark':
          e.preventDefault();
          handlers.onCreateBookmark?.();
          break;
        case 'copy':
          if (!isInInputField(e.target as Element)) {
            e.preventDefault();
            handlers.onCopySelection?.();
          }
          break;
        case 'cut':
          if (!isInInputField(e.target as Element)) {
            e.preventDefault();
            handlers.onCutSelection?.();
          }
          break;
        case 'paste':
          if (!isInInputField(e.target as Element)) {
            e.preventDefault();
            handlers.onPasteClipboard?.();
          }
          break;
        case 'select-all':
          if (!isInInputField(e.target as Element)) {
            e.preventDefault();
            handlers.onSelectAll?.();
          }
          break;
        case 'delete':
          if (!isInInputField(e.target as Element)) {
            e.preventDefault();
            handlers.onDeleteSelected?.();
          }
          break;
          
        // Context management
        case 'clear-context':
          e.preventDefault();
          handlers.onClearContext?.();
          break;
        case 'optimize-context':
          e.preventDefault();
          handlers.onOptimizeContext?.();
          break;
          
        // General
        case 'escape':
          // Handle escape based on current context
          if (activeContext === 'panel') {
            // Close any open panels or modals
          }
          break;
      }
    };
  }, [handlers, shortcutsEnabled, activeContext]);

  // Check if user is currently in an input field
  const isInInputField = useCallback((target: Element | null): boolean => {
    if (!target) return false;
    
    const tagName = target.tagName.toLowerCase();
    const inputTypes = ['input', 'textarea', 'select'];
    const contentEditable = target.getAttribute('contenteditable') === 'true';
    
    return inputTypes.includes(tagName) || contentEditable;
  }, []);

  // Check if shortcut matches key combination
  const matchesShortcut = useCallback((e: KeyboardEvent, shortcut: KeyboardShortcut): boolean => {
    if (!shortcut.enabled) return false;
    
    const pressedKeys = [];
    if (e.ctrlKey) pressedKeys.push('Ctrl');
    if (e.shiftKey) pressedKeys.push('Shift');
    if (e.altKey) pressedKeys.push('Alt');
    if (e.metaKey) pressedKeys.push('Meta');
    
    // Add the main key
    if (e.key !== 'Control' && e.key !== 'Shift' && e.key !== 'Alt' && e.key !== 'Meta') {
      pressedKeys.push(e.key);
    }
    
    // Check if arrays match
    return pressedKeys.length === shortcut.keys.length && 
           pressedKeys.every(key => shortcut.keys.includes(key));
  }, []);

  // Global keyboard event handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!shortcutsEnabled) return;
    
    // Update context based on focused element
    const target = e.target as Element;
    if (isInInputField(target)) {
      setActiveContext('input');
    } else if (target.closest('.panel')) {
      setActiveContext('panel');
    } else if (target.closest('.infinite-canvas')) {
      setActiveContext('canvas');
    } else {
      setActiveContext('global');
    }
    
    // Find matching shortcut
    const matchingShortcut = shortcuts.find(shortcut => {
      if (shortcut.context && shortcut.context !== 'global' && shortcut.context !== activeContext) {
        return false;
      }
      return matchesShortcut(e, shortcut);
    });
    
    if (matchingShortcut) {
      if (import.meta.env.DEV) {
        console.log('⌨️ Shortcut triggered:', {
          id: matchingShortcut.id,
          keys: matchingShortcut.keys,
          context: activeContext
        });
      }
      matchingShortcut.handler(e);
    }
  }, [shortcuts, shortcutsEnabled, activeContext, matchesShortcut, isInInputField]);

  // Add/remove shortcuts dynamically
  const addShortcut = useCallback((shortcut: Omit<KeyboardShortcut, 'handler'>) => {
    const newShortcut: KeyboardShortcut = {
      ...shortcut,
      handler: createShortcutHandler(shortcut.id)
    };
    
    setShortcuts(prev => [...prev.filter(s => s.id !== shortcut.id), newShortcut]);
  }, [createShortcutHandler]);

  const removeShortcut = useCallback((shortcutId: string) => {
    setShortcuts(prev => prev.filter(s => s.id !== shortcutId));
  }, []);

  const toggleShortcut = useCallback((shortcutId: string) => {
    setShortcuts(prev => prev.map(s => 
      s.id === shortcutId ? { ...s, enabled: !s.enabled } : s
    ));
  }, []);

  // Get shortcuts by category
  const getShortcutsByCategory = useCallback((category: KeyboardShortcut['category']) => {
    return shortcuts.filter(s => s.category === category && s.enabled);
  }, [shortcuts]);

  // Format shortcut display
  const formatShortcut = useCallback((keys: string[]): string => {
    return keys.join(' + ').replace('Ctrl', '⌘').replace('Shift', '⇧').replace('Alt', '⌥');
  }, []);

  // Initialize shortcuts on mount
  useEffect(() => {
    initializeShortcuts();
  }, [initializeShortcuts]);

  // Set up global event listeners
  useEffect(() => {
    if (!shortcutsEnabled) return;
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, shortcutsEnabled]);

  return {
    // State
    shortcuts,
    activeContext,
    shortcutsEnabled,
    
    // Controls
    setShortcutsEnabled,
    addShortcut,
    removeShortcut,
    toggleShortcut,
    
    // Queries
    getShortcutsByCategory,
    formatShortcut,
    
    // Context
    setActiveContext
  };
};