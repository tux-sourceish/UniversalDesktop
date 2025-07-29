import React from 'react';
import { UDItem } from '../../core/universalDocument';
import { μ2_FileManager } from '../μ2_FileManager';

/**
 * μ2_FileManagerWindow - WIND (☴) Views/UI
 * 
 * Proper UniversalDesktop window component for File Manager.
 * Integrates μ2_FileManager with the UniversalDesktop window system,
 * providing proper UDItem integration, window controls, and persistence.
 * 
 * Features:
 * - Full UDItem integration for persistence
 * - Window title bar with controls (handled by μ8_DesktopItem)
 * - Proper content rendering within window boundaries
 * - Drag/drop positioning support via μ8_DesktopItem
 * - State synchronization with UDItem content
 */

interface μ2_FileManagerWindowProps {
  /** Complete UDItem with all Bagua metadata */
  udItem: UDItem;
  /** Callback for UDItem updates with transformation tracking */
  onUDItemChange: (updatedItem: UDItem, transformationDescription: string) => void;
  /** Callback for Context Manager integration */
  onAddToContext?: (item: UDItem) => void;
  /** Read-only mode */
  readOnly?: boolean;
}

export const μ2_FileManagerWindow: React.FC<μ2_FileManagerWindowProps> = ({
  udItem,
  onUDItemChange,
  onAddToContext,
  readOnly = false
}) => {
  // Extract file manager configuration from UDItem content
  const fileManagerConfig = typeof udItem.content === 'object' ? udItem.content : {
    initialPath: '/home/user',
    mode: 'gui',
    showToolbar: true,
    showStatusBar: true,
    allowMultiSelect: true
  };

  // Handle file operations and create UDItems for opened files
  const handleFileOpen = (file: any) => {
    // When a file is opened, we could create a new UDItem for it
    // For now, just log the action
    console.log('File opened in File Manager:', file.name);
  };

  const handleFileSelect = (files: any[]) => {
    // Update UDItem content with selected files info
    const updatedContent = {
      ...fileManagerConfig,
      selectedFiles: files.map(f => f.path),
      lastSelectedCount: files.length
    };
    
    onUDItemChange({
      ...udItem,
      content: updatedContent,
      updated_at: Date.now()
    }, `Selected ${files.length} files`);
  };

  const handleCreateUDItem = (item: any) => {
    // This would be handled by the parent component
    console.log('Create UDItem requested from File Manager:', item);
    onAddToContext?.({
      ...udItem,
      ...item,
      id: `ud_item_${Date.now()}_${Math.floor(Math.random() * 10000)}`
    });
  };

  return (
    <div 
      className="file-manager-window-container"
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      <μ2_FileManager
        initialPath={fileManagerConfig.initialPath || '/home/user'}
        mode={fileManagerConfig.mode || 'gui'}
        onFileOpen={handleFileOpen}
        onFileSelect={handleFileSelect}
        onCreateUDItem={handleCreateUDItem}
        showToolbar={fileManagerConfig.showToolbar !== false}
        showStatusBar={fileManagerConfig.showStatusBar !== false}
        allowMultiSelect={fileManagerConfig.allowMultiSelect !== false}
        style={{
          width: '100%',
          height: '100%',
          border: 'none', // Remove border since μ8_DesktopItem handles window styling
          borderRadius: '0'
        }}
      />
    </div>
  );
};

export default μ2_FileManagerWindow;