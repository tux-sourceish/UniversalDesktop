// Clipboard Service for UniversalDesktop
// Handles clipboard operations for different content types

interface DesktopItemData {
  id: string;
  type: 'notizzettel' | 'tabelle' | 'code' | 'browser' | 'terminal' | 'tui' | 'media' | 'chart' | 'calendar';
  title: string;
  content: any;
  metadata?: Record<string, any>;
}

interface ClipboardData {
  type: 'text' | 'html' | 'json' | 'csv' | 'code' | 'table' | 'tui';
  content: string;
  originalType?: string;
  timestamp: number;
  source: 'desktop' | 'external';
}

class ClipboardService {
  private static instance: ClipboardService;
  private clipboardHistory: ClipboardData[] = [];
  private maxHistorySize = 10;
  private currentSelection: { item: DesktopItemData; selectedText?: string } | null = null;

  private constructor() {}

  static getInstance(): ClipboardService {
    if (!ClipboardService.instance) {
      ClipboardService.instance = new ClipboardService();
    }
    return ClipboardService.instance;
  }

  // Set current selection context
  setSelection(item: DesktopItemData, selectedText?: string) {
    this.currentSelection = { item, selectedText };
  }

  // Clear current selection
  clearSelection() {
    this.currentSelection = null;
  }

  // Check if content can be pasted (user activation required)
  async canPaste(): Promise<boolean> {
    try {
      // First try permissions API if available
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'clipboard-read' as any });
        if (permission.state === 'denied') {
          return false;
        }
        if (permission.state === 'granted') {
          // Try to read clipboard to confirm content exists
          const text = await navigator.clipboard.readText();
          return text.length > 0;
        }
      }
      
      // Fallback: Direct clipboard read (requires user activation)
      if (document.hasFocus()) {
        const text = await navigator.clipboard.readText();
        return text.length > 0;
      }
      return false;
    } catch (error) {
      // Silently handle - no console warnings for normal denials
      return false;
    }
  }

  // Check if there's a selection to cut/copy
  hasSelection(): boolean {
    return this.currentSelection !== null;
  }

  // Copy content based on item type
  async copy(item: DesktopItemData, selectedText?: string): Promise<boolean> {
    try {
      let clipboardData: ClipboardData;
      
      if (selectedText) {
        // Copy selected text
        clipboardData = {
          type: 'text',
          content: selectedText,
          originalType: item.type,
          timestamp: Date.now(),
          source: 'desktop'
        };
      } else {
        // Copy entire item content
        clipboardData = await this.getItemClipboardData(item);
      }

      await navigator.clipboard.writeText(clipboardData.content);
      this.addToHistory(clipboardData);

      // Visual feedback
      this.showClipboardToast('📋 Copied to clipboard');
      return true;
    } catch (error) {
      console.error('Copy failed:', error);
      this.showClipboardToast('❌ Copy failed', 'error');
      return false;
    }
  }

  // Cut content (copy + clear selection)
  async cut(item: DesktopItemData, selectedText?: string): Promise<{ success: boolean; newContent?: any }> {
    try {
      const copySuccess = await this.copy(item, selectedText);
      if (!copySuccess) return { success: false };

      let newContent = item.content;

      if (selectedText) {
        // Remove selected text from content
        newContent = await this.removeSelectedText(item, selectedText);
      } else {
        // Clear entire content
        newContent = this.getEmptyContent(item.type);
      }

      this.showClipboardToast('✂️ Cut to clipboard');
      return { success: true, newContent };
    } catch (error) {
      console.error('Cut failed:', error);
      this.showClipboardToast('❌ Cut failed', 'error');
      return { success: false };
    }
  }

  // Paste content into item
  async paste(item: DesktopItemData, cursorPosition?: number): Promise<{ success: boolean; newContent?: any }> {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (!clipboardText) return { success: false };

      const newContent = await this.insertContent(item, clipboardText, cursorPosition);
      
      this.showClipboardToast('📄 Pasted from clipboard');
      return { success: true, newContent };
    } catch (error) {
      console.error('Paste failed:', error);
      this.showClipboardToast('❌ Paste failed', 'error');
      return { success: false };
    }
  }

  // Get clipboard data for specific item type
  private async getItemClipboardData(item: DesktopItemData): Promise<ClipboardData> {
    switch (item.type) {
      case 'notizzettel':
        return {
          type: 'text',
          content: typeof item.content === 'string' ? item.content : '',
          originalType: item.type,
          timestamp: Date.now(),
          source: 'desktop'
        };

      case 'tabelle':
        return {
          type: 'csv',
          content: this.tableToCSV(item.content),
          originalType: item.type,
          timestamp: Date.now(),
          source: 'desktop'
        };

      case 'code':
        return {
          type: 'code',
          content: typeof item.content === 'string' ? item.content : '',
          originalType: item.type,
          timestamp: Date.now(),
          source: 'desktop'
        };

      case 'tui':
      case 'terminal':
        return {
          type: 'tui',
          content: typeof item.content === 'string' ? item.content : '',
          originalType: item.type,
          timestamp: Date.now(),
          source: 'desktop'
        };

      default:
        return {
          type: 'text',
          content: JSON.stringify(item.content, null, 2),
          originalType: item.type,
          timestamp: Date.now(),
          source: 'desktop'
        };
    }
  }

  // Remove selected text from content
  private async removeSelectedText(item: DesktopItemData, selectedText: string): Promise<any> {
    if (typeof item.content !== 'string') return item.content;

    return item.content.replace(selectedText, '');
  }

  // Insert content into item
  private async insertContent(item: DesktopItemData, content: string, cursorPosition?: number): Promise<any> {
    switch (item.type) {
      case 'notizzettel':
        return this.insertTextContent(item.content, content, cursorPosition);

      case 'tabelle':
        return this.insertTableContent(item.content, content);

      case 'code':
        return this.insertCodeContent(item.content, content, cursorPosition);

      case 'tui':
      case 'terminal':
        return this.insertTUIContent(item.content, content);

      default:
        return this.insertTextContent(item.content, content, cursorPosition);
    }
  }

  // Insert text content at cursor position
  private insertTextContent(currentContent: any, newContent: string, cursorPosition?: number): string {
    const text = typeof currentContent === 'string' ? currentContent : '';
    
    if (cursorPosition !== undefined) {
      return text.substring(0, cursorPosition) + newContent + text.substring(cursorPosition);
    }
    
    return text + newContent;
  }

  // Insert table content
  private insertTableContent(currentContent: any, newContent: string): any[][] {
    const currentTable = Array.isArray(currentContent) ? currentContent : [['Header 1', 'Header 2', 'Header 3']];
    
    try {
      // Try to parse as CSV
      const csvData = this.parseCSV(newContent);
      if (csvData.length > 0) {
        return [...currentTable, ...csvData];
      }
    } catch (error) {
      console.warn('Failed to parse CSV, treating as text');
    }
    
    // Add as single row
    return [...currentTable, [newContent]];
  }

  // Insert code content
  private insertCodeContent(currentContent: any, newContent: string, cursorPosition?: number): string {
    const code = typeof currentContent === 'string' ? currentContent : '';
    
    if (cursorPosition !== undefined) {
      return code.substring(0, cursorPosition) + newContent + code.substring(cursorPosition);
    }
    
    return code + '\n' + newContent;
  }

  // Insert TUI content
  private insertTUIContent(currentContent: any, newContent: string): string {
    const tui = typeof currentContent === 'string' ? currentContent : '';
    return tui + '\n' + newContent;
  }

  // Convert table to CSV
  private tableToCSV(tableData: any[][]): string {
    if (!Array.isArray(tableData)) return '';
    
    return tableData.map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`)
         .join(',')
    ).join('\n');
  }

  // Parse CSV content
  private parseCSV(csvContent: string): string[][] {
    const lines = csvContent.split('\n');
    const result: string[][] = [];
    
    for (const line of lines) {
      if (line.trim()) {
        const row = line.split(',').map(cell => 
          cell.trim().replace(/^"|"$/g, '').replace(/""/g, '"')
        );
        result.push(row);
      }
    }
    
    return result;
  }

  // Get empty content for item type
  private getEmptyContent(type: string): any {
    switch (type) {
      case 'notizzettel':
      case 'code':
      case 'tui':
      case 'terminal':
        return '';
      case 'tabelle':
        return [['Header 1', 'Header 2', 'Header 3']];
      default:
        return '';
    }
  }

  // Add to clipboard history
  private addToHistory(data: ClipboardData) {
    this.clipboardHistory.unshift(data);
    if (this.clipboardHistory.length > this.maxHistorySize) {
      this.clipboardHistory = this.clipboardHistory.slice(0, this.maxHistorySize);
    }
  }

  // Get clipboard history
  getHistory(): ClipboardData[] {
    return [...this.clipboardHistory];
  }

  // Show clipboard toast notification
  private showClipboardToast(message: string, type: 'success' | 'error' = 'success') {
    const toast = document.createElement('div');
    toast.className = `clipboard-toast ${type}`;
    toast.textContent = message;
    
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'error' ? 'rgba(239, 68, 68, 0.9)' : 'rgba(16, 185, 129, 0.9)'};
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 500;
      z-index: 10000;
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      animation: toastSlideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'toastSlideOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }

  // Export specific formats
  async exportAsJSON(item: DesktopItemData): Promise<boolean> {
    try {
      const jsonData = JSON.stringify({
        id: item.id,
        type: item.type,
        title: item.title,
        content: item.content,
        metadata: item.metadata,
        exported_at: new Date().toISOString()
      }, null, 2);
      
      await navigator.clipboard.writeText(jsonData);
      this.showClipboardToast('📄 Exported as JSON');
      return true;
    } catch (error) {
      console.error('JSON export failed:', error);
      return false;
    }
  }

  async exportAsCSV(item: DesktopItemData): Promise<boolean> {
    try {
      if (item.type === 'tabelle' && Array.isArray(item.content)) {
        const csvData = this.tableToCSV(item.content);
        await navigator.clipboard.writeText(csvData);
        this.showClipboardToast('📊 Exported as CSV');
        return true;
      }
      return false;
    } catch (error) {
      console.error('CSV export failed:', error);
      return false;
    }
  }

  // Keyboard shortcuts handler
  handleKeyboardShortcut(event: KeyboardEvent, item?: DesktopItemData, selectedText?: string) {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key.toLowerCase()) {
        case 'c':
          if (item) {
            event.preventDefault();
            this.copy(item, selectedText);
          }
          break;
        case 'x':
          if (item) {
            event.preventDefault();
            this.cut(item, selectedText);
          }
          break;
        case 'v':
          if (item) {
            event.preventDefault();
            this.paste(item);
          }
          break;
      }
    }
  }
}

// Add CSS for toast animations
const toastCSS = `
  @keyframes toastSlideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes toastSlideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;

// Inject toast CSS
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = toastCSS;
  document.head.appendChild(styleElement);
}

export default ClipboardService;