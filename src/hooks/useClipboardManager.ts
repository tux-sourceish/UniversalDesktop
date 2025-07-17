import { useState, useCallback, useRef } from 'react';

interface DesktopItemData {
  id: string;
  type: string;
  title: string;
  position: { x: number; y: number; z: number };
  content: any;
  width?: number;
  height?: number;
  metadata?: Record<string, any>;
}

interface ClipboardOperation {
  type: 'copy' | 'cut' | 'paste';
  timestamp: Date;
  itemId?: string;
  contentType: string;
  success: boolean;
  error?: string;
}

interface ClipboardHistory {
  id: string;
  content: any;
  sourceType: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface ClipboardResult {
  success: boolean;
  newContent?: any;
  error?: string;
  metadata?: Record<string, any>;
}

interface ClipboardCapabilities {
  canRead: boolean;
  canWrite: boolean;
  canReadText: boolean;
  canReadFiles: boolean;
  supportedFormats: string[];
}

export const useClipboardManager = () => {
  const [clipboardHistory, setClipboardHistory] = useState<ClipboardHistory[]>([]);
  const [operationHistory, setOperationHistory] = useState<ClipboardOperation[]>([]);
  const [capabilities, setCapabilities] = useState<ClipboardCapabilities>({
    canRead: false,
    canWrite: false,
    canReadText: false,
    canReadFiles: false,
    supportedFormats: []
  });
  
  const lastOperationRef = useRef<ClipboardOperation | null>(null);

  // Initialize clipboard capabilities
  const initializeCapabilities = useCallback(async () => {
    try {
      const caps: ClipboardCapabilities = {
        canRead: !!navigator.clipboard?.read,
        canWrite: !!navigator.clipboard?.write,
        canReadText: !!navigator.clipboard?.readText,
        canReadFiles: 'ClipboardItem' in window,
        supportedFormats: []
      };

      // Test supported formats
      const testFormats = ['text/plain', 'text/html', 'application/json', 'image/png'];
      for (const format of testFormats) {
        try {
          if (ClipboardItem && ClipboardItem.supports && ClipboardItem.supports(format)) {
            caps.supportedFormats.push(format);
          }
        } catch (e) {
          // Format not supported
        }
      }

      setCapabilities(caps);
    } catch (error) {
      console.warn('Clipboard API not fully supported:', error);
    }
  }, []);

  // Check if clipboard operations are possible
  const canPaste = useCallback(async (): Promise<boolean> => {
    try {
      // Simple permission check
      const permission = await navigator.permissions?.query({ name: 'clipboard-read' as any });
      return permission?.state === 'granted' || permission?.state === 'prompt';
    } catch {
      // Fallback: try to read clipboard
      try {
        await navigator.clipboard?.readText();
        return true;
      } catch {
        return false;
      }
    }
  }, []);

  // Type-specific content processing
  const processContentForType = useCallback((item: DesktopItemData, operation: 'copy' | 'cut'): any => {
    switch (item.type) {
      case 'tabelle':
        if (Array.isArray(item.content)) {
          // Convert table to CSV format
          return item.content.map(row => 
            Array.isArray(row) ? row.join(',') : row
          ).join('\n');
        }
        return item.content;

      case 'code':
        // Preserve code formatting
        if (typeof item.content === 'string') {
          return `\`\`\`\n${item.content}\n\`\`\``;
        }
        return item.content;

      case 'tui':
        // Preserve TUI formatting as plain text
        return typeof item.content === 'string' ? item.content : JSON.stringify(item.content);

      case 'notizzettel':
        // Plain text content
        return typeof item.content === 'string' ? item.content : JSON.stringify(item.content);

      default:
        // Default JSON representation
        return typeof item.content === 'string' ? item.content : JSON.stringify(item.content, null, 2);
    }
  }, []);

  // Copy operation with type-specific handling
  const copy = useCallback(async (item: DesktopItemData): Promise<ClipboardResult> => {
    const operation: ClipboardOperation = {
      type: 'copy',
      timestamp: new Date(),
      itemId: item.id,
      contentType: item.type,
      success: false
    };

    try {
      const processedContent = processContentForType(item, 'copy');
      
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(processedContent);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = processedContent;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      // Add to clipboard history
      const historyEntry: ClipboardHistory = {
        id: `clipboard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: processedContent,
        sourceType: item.type,
        timestamp: new Date(),
        metadata: {
          sourceId: item.id,
          sourceTitle: item.title,
          operation: 'copy'
        }
      };

      setClipboardHistory(prev => [historyEntry, ...prev.slice(0, 19)]); // Keep last 20

      operation.success = true;
      setOperationHistory(prev => [operation, ...prev.slice(0, 49)]); // Keep last 50
      lastOperationRef.current = operation;

      if (import.meta.env.DEV) {
        console.log('📋 Copy Success:', {
          type: item.type,
          title: item.title,
          contentLength: processedContent.length
        });
      }

      return { success: true, metadata: { operation: 'copy' } };

    } catch (error: any) {
      operation.success = false;
      operation.error = error.message;
      setOperationHistory(prev => [operation, ...prev.slice(0, 49)]);

      if (import.meta.env.DEV) {
        console.error('❌ Copy Failed:', error);
      }

      return { 
        success: false, 
        error: error.message || 'Copy operation failed',
        metadata: { operation: 'copy' }
      };
    }
  }, [processContentForType]);

  // Cut operation (copy + modify content)
  const cut = useCallback(async (item: DesktopItemData): Promise<ClipboardResult> => {
    const operation: ClipboardOperation = {
      type: 'cut',
      timestamp: new Date(),
      itemId: item.id,
      contentType: item.type,
      success: false
    };

    try {
      // First copy the content
      const copyResult = await copy(item);
      if (!copyResult.success) {
        return copyResult;
      }

      // Then modify the original content based on type
      let newContent: any;
      switch (item.type) {
        case 'tabelle':
          // Clear table content but keep headers
          if (Array.isArray(item.content) && item.content.length > 0) {
            newContent = [item.content[0]]; // Keep header row
          } else {
            newContent = [];
          }
          break;

        case 'code':
        case 'notizzettel':
        case 'tui':
          // Clear text content
          newContent = '';
          break;

        default:
          // Clear content
          newContent = '';
          break;
      }

      operation.success = true;
      setOperationHistory(prev => [operation, ...prev.slice(0, 49)]);
      lastOperationRef.current = operation;

      if (import.meta.env.DEV) {
        console.log('✂️ Cut Success:', {
          type: item.type,
          title: item.title
        });
      }

      return { 
        success: true, 
        newContent,
        metadata: { operation: 'cut' }
      };

    } catch (error: any) {
      operation.success = false;
      operation.error = error.message;
      setOperationHistory(prev => [operation, ...prev.slice(0, 49)]);

      return { 
        success: false, 
        error: error.message || 'Cut operation failed',
        metadata: { operation: 'cut' }
      };
    }
  }, [copy]);

  // Paste operation with intelligent content parsing
  const paste = useCallback(async (targetItem: DesktopItemData): Promise<ClipboardResult> => {
    const operation: ClipboardOperation = {
      type: 'paste',
      timestamp: new Date(),
      itemId: targetItem.id,
      contentType: targetItem.type,
      success: false
    };

    try {
      let clipboardContent: string;

      if (navigator.clipboard?.readText) {
        clipboardContent = await navigator.clipboard.readText();
      } else {
        throw new Error('Clipboard read not supported');
      }

      if (!clipboardContent.trim()) {
        throw new Error('Clipboard is empty');
      }

      // Parse content based on target type
      let newContent: any;
      
      switch (targetItem.type) {
        case 'tabelle':
          // Try to parse as CSV/TSV
          try {
            const lines = clipboardContent.split('\n').filter(line => line.trim());
            newContent = lines.map(line => {
              // Split by comma, tab, or semicolon
              return line.split(/[,;\t]/).map(cell => cell.trim());
            });
            
            // Validate table structure
            if (newContent.length === 0 || newContent[0].length === 0) {
              throw new Error('Invalid table format');
            }
          } catch {
            // Fallback: create single cell table
            newContent = [['Pasted Content'], [clipboardContent]];
          }
          break;

        case 'code':
          // Clean up code formatting
          newContent = clipboardContent
            .replace(/^```[\w]*\n?/, '')  // Remove opening code fence
            .replace(/\n?```$/, '');      // Remove closing code fence
          break;

        case 'tui':
        case 'notizzettel':
          // Use content as-is for text types
          newContent = clipboardContent;
          break;

        default:
          // Try to parse as JSON, fallback to string
          try {
            newContent = JSON.parse(clipboardContent);
          } catch {
            newContent = clipboardContent;
          }
          break;
      }

      operation.success = true;
      setOperationHistory(prev => [operation, ...prev.slice(0, 49)]);
      lastOperationRef.current = operation;

      if (import.meta.env.DEV) {
        console.log('📌 Paste Success:', {
          targetType: targetItem.type,
          contentLength: clipboardContent.length,
          parsedAs: typeof newContent
        });
      }

      return { 
        success: true, 
        newContent,
        metadata: { 
          operation: 'paste',
          originalContent: clipboardContent,
          contentType: typeof newContent
        }
      };

    } catch (error: any) {
      operation.success = false;
      operation.error = error.message;
      setOperationHistory(prev => [operation, ...prev.slice(0, 49)]);

      if (import.meta.env.DEV) {
        console.error('❌ Paste Failed:', error);
      }

      return { 
        success: false, 
        error: error.message || 'Paste operation failed',
        metadata: { operation: 'paste' }
      };
    }
  }, []);

  // Export operations
  const exportAsJSON = useCallback((item: DesktopItemData) => {
    const exportData = {
      id: item.id,
      type: item.type,
      title: item.title,
      content: item.content,
      metadata: {
        ...item.metadata,
        exportedAt: new Date().toISOString(),
        exportFormat: 'json'
      }
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    
    // Create downloadable file
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.title.replace(/[^a-z0-9]/gi, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);

    if (import.meta.env.DEV) {
      console.log('💾 Export JSON:', { title: item.title, size: jsonString.length });
    }
  }, []);

  const exportAsCSV = useCallback((item: DesktopItemData) => {
    let csvContent: string;

    if (item.type === 'tabelle' && Array.isArray(item.content)) {
      csvContent = item.content.map(row => 
        Array.isArray(row) ? row.map(cell => `"${cell}"`).join(',') : `"${row}"`
      ).join('\n');
    } else {
      // Convert other types to CSV format
      csvContent = `"Type","Title","Content"\n"${item.type}","${item.title}","${String(item.content).replace(/"/g, '""')}"`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.title.replace(/[^a-z0-9]/gi, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    if (import.meta.env.DEV) {
      console.log('📊 Export CSV:', { title: item.title, rows: csvContent.split('\n').length });
    }
  }, []);

  // Clear clipboard history
  const clearHistory = useCallback(() => {
    setClipboardHistory([]);
    setOperationHistory([]);
    lastOperationRef.current = null;
  }, []);

  // Get recent clipboard item
  const getLastClipboardItem = useCallback((): ClipboardHistory | null => {
    return clipboardHistory[0] || null;
  }, [clipboardHistory]);

  // Initialize on mount
  React.useEffect(() => {
    initializeCapabilities();
  }, [initializeCapabilities]);

  return {
    // State
    clipboardHistory,
    operationHistory,
    capabilities,

    // Core Operations
    copy,
    cut,
    paste,
    canPaste,

    // Export Operations
    exportAsJSON,
    exportAsCSV,

    // Utilities
    clearHistory,
    getLastClipboardItem,
    initializeCapabilities,

    // Getters
    lastOperation: lastOperationRef.current
  };
};

// Add React import for useEffect
import React from 'react';