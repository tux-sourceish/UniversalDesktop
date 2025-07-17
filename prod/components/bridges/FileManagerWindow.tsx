import React, { useState, useCallback, useMemo } from 'react';
import { useFileManager } from '../../hooks/useFileManager';

interface FileManagerWindowProps {
  initialPath?: string;
  onFileSelect?: (file: any) => void;
  onFileOpen?: (file: any) => void;
  className?: string;
  style?: React.CSSProperties;
  showToolbar?: boolean;
  showStatusBar?: boolean;
  allowMultiSelect?: boolean;
  compact?: boolean;
}

/**
 * 📁 FileManagerWindow - Hook-to-Component Bridge
 * 
 * Verbindet useFileManager Hook mit einer vollständigen Dolphin-inspirierten
 * File-Manager-Oberfläche. Drag&Drop, Search, Multi-View-Modi.
 */
export const FileManagerWindow: React.FC<FileManagerWindowProps> = ({
  initialPath = '/home/user',
  onFileSelect,
  onFileOpen,
  className = '',
  style = {},
  showToolbar = true,
  showStatusBar = true,
  allowMultiSelect = true,
  compact = false
}) => {
  const [searchExpanded, setSearchExpanded] = useState(false);

  // Hook Integration
  const fileManager = useFileManager(
    initialPath,
    onFileOpen,
    (error) => console.error('File Manager Error:', error)
  );

  // Handle file double-click
  const handleFileDoubleClick = useCallback((item: any) => {
    fileManager.openItem(item);
    onFileSelect?.(item);
  }, [fileManager, onFileSelect]);

  // Handle file selection
  const handleFileClick = useCallback((item: any, e: React.MouseEvent) => {
    const multiSelect = allowMultiSelect && (e.ctrlKey || e.metaKey);
    fileManager.selectItem(item.id, multiSelect);
    onFileSelect?.(item);
  }, [fileManager, onFileSelect, allowMultiSelect]);

  // Toolbar component
  const Toolbar = () => {
    if (!showToolbar) return null;

    return (
      <div className="file-manager-toolbar" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        backgroundColor: 'rgba(245, 245, 245, 0.8)'
      }}>
        {/* Navigation buttons */}
        <div className="nav-buttons" style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={fileManager.goBack}
            disabled={!fileManager.canGoBack}
            className="nav-btn"
            title="Back"
            style={{
              padding: '6px 8px',
              border: 'none',
              borderRadius: '4px',
              background: fileManager.canGoBack ? 'rgba(26, 127, 86, 0.1)' : 'rgba(0, 0, 0, 0.05)',
              cursor: fileManager.canGoBack ? 'pointer' : 'not-allowed'
            }}
          >
            ⬅️
          </button>
          <button
            onClick={fileManager.goForward}
            disabled={!fileManager.canGoForward}
            className="nav-btn"
            title="Forward"
            style={{
              padding: '6px 8px',
              border: 'none',
              borderRadius: '4px',
              background: fileManager.canGoForward ? 'rgba(26, 127, 86, 0.1)' : 'rgba(0, 0, 0, 0.05)',
              cursor: fileManager.canGoForward ? 'pointer' : 'not-allowed'
            }}
          >
            ➡️
          </button>
          <button
            onClick={fileManager.goUp}
            className="nav-btn"
            title="Up"
            style={{
              padding: '6px 8px',
              border: 'none',
              borderRadius: '4px',
              background: 'rgba(26, 127, 86, 0.1)',
              cursor: 'pointer'
            }}
          >
            ⬆️
          </button>
          <button
            onClick={fileManager.goHome}
            className="nav-btn"
            title="Home"
            style={{
              padding: '6px 8px',
              border: 'none',
              borderRadius: '4px',
              background: 'rgba(26, 127, 86, 0.1)',
              cursor: 'pointer'
            }}
          >
            🏠
          </button>
        </div>

        {/* Address bar */}
        <div className="address-bar" style={{ flex: 1, marginX: '8px' }}>
          <input
            type="text"
            value={fileManager.currentPath}
            onChange={(e) => fileManager.navigateTo(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 8px',
              border: '1px solid rgba(0, 0, 0, 0.2)',
              borderRadius: '4px',
              fontSize: '13px'
            }}
          />
        </div>

        {/* Search */}
        <div className="search-area" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            onClick={() => setSearchExpanded(!searchExpanded)}
            style={{
              padding: '6px 8px',
              border: 'none',
              borderRadius: '4px',
              background: searchExpanded ? 'rgba(26, 127, 86, 0.2)' : 'rgba(26, 127, 86, 0.1)',
              cursor: 'pointer'
            }}
          >
            🔍
          </button>
          {searchExpanded && (
            <input
              type="text"
              placeholder="Search files..."
              value={fileManager.searchQuery}
              onChange={(e) => fileManager.setSearchQuery(e.target.value)}
              style={{
                padding: '6px 8px',
                border: '1px solid rgba(0, 0, 0, 0.2)',
                borderRadius: '4px',
                fontSize: '13px',
                width: '150px'
              }}
            />
          )}
        </div>

        {/* View mode buttons */}
        <div className="view-modes" style={{ display: 'flex', gap: '2px' }}>
          {['list', 'grid', 'tree'].map(mode => (
            <button
              key={mode}
              onClick={() => fileManager.setViewMode(mode as any)}
              className={`view-mode-btn ${fileManager.viewMode === mode ? 'active' : ''}`}
              title={`${mode} view`}
              style={{
                padding: '6px 8px',
                border: 'none',
                borderRadius: '4px',
                background: fileManager.viewMode === mode ? 'rgba(26, 127, 86, 0.3)' : 'rgba(26, 127, 86, 0.1)',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              {mode === 'list' && '📋'}
              {mode === 'grid' && '⊞'}
              {mode === 'tree' && '🌲'}
            </button>
          ))}
        </div>

        {/* Settings */}
        <button
          onClick={fileManager.toggleHidden}
          title={`${fileManager.showHidden ? 'Hide' : 'Show'} hidden files`}
          style={{
            padding: '6px 8px',
            border: 'none',
            borderRadius: '4px',
            background: fileManager.showHidden ? 'rgba(26, 127, 86, 0.3)' : 'rgba(26, 127, 86, 0.1)',
            cursor: 'pointer'
          }}
        >
          👁️
        </button>
      </div>
    );
  };

  // File list component
  const FileList = () => {
    const getFileIcon = (item: any) => {
      if (item.type === 'directory') return '📁';
      if (item.metadata?.icon) return item.metadata.icon;
      
      const extensionIcons: Record<string, string> = {
        'ud': '🌌',
        'json': '📄',
        'js': '📜',
        'ts': '📘',
        'tsx': '⚛️',
        'css': '🎨',
        'html': '🌐',
        'md': '📝',
        'txt': '📄',
        'pdf': '📕',
        'jpg': '🖼️',
        'png': '🖼️',
        'gif': '🖼️',
        'mp4': '🎬',
        'mp3': '🎵',
        'zip': '📦'
      };

      return extensionIcons[item.extension] || '📄';
    };

    const formatFileSize = (bytes: number) => {
      return fileManager.formatFileSize(bytes);
    };

    const formatDate = (date: Date) => {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (fileManager.viewMode === 'list') {
      return (
        <div className="file-list-view" style={{ padding: '8px' }}>
          {/* Header */}
          <div className="file-list-header" style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr auto auto auto',
            gap: '12px',
            padding: '8px 4px',
            borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#666'
          }}>
            <div></div>
            <div 
              onClick={() => fileManager.setSorting('name')}
              style={{ cursor: 'pointer' }}
            >
              Name {fileManager.sortBy === 'name' && (fileManager.sortOrder === 'asc' ? '↑' : '↓')}
            </div>
            <div 
              onClick={() => fileManager.setSorting('size')}
              style={{ cursor: 'pointer' }}
            >
              Size {fileManager.sortBy === 'size' && (fileManager.sortOrder === 'asc' ? '↑' : '↓')}
            </div>
            <div 
              onClick={() => fileManager.setSorting('type')}
              style={{ cursor: 'pointer' }}
            >
              Type {fileManager.sortBy === 'type' && (fileManager.sortOrder === 'asc' ? '↑' : '↓')}
            </div>
            <div 
              onClick={() => fileManager.setSorting('modified')}
              style={{ cursor: 'pointer' }}
            >
              Modified {fileManager.sortBy === 'modified' && (fileManager.sortOrder === 'asc' ? '↑' : '↓')}
            </div>
          </div>

          {/* Files */}
          {fileManager.filteredAndSortedItems.map(item => (
            <div
              key={item.id}
              className={`file-item ${fileManager.selectedItems.includes(item.id) ? 'selected' : ''}`}
              onClick={(e) => handleFileClick(item, e)}
              onDoubleClick={() => handleFileDoubleClick(item)}
              style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto auto auto',
                gap: '12px',
                padding: '6px 4px',
                borderRadius: '4px',
                cursor: 'pointer',
                backgroundColor: fileManager.selectedItems.includes(item.id) ? 'rgba(26, 127, 86, 0.2)' : 'transparent',
                fontSize: '13px',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!fileManager.selectedItems.includes(item.id)) {
                  e.currentTarget.style.backgroundColor = 'rgba(26, 127, 86, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (!fileManager.selectedItems.includes(item.id)) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <div style={{ fontSize: '16px' }}>{getFileIcon(item)}</div>
              <div style={{ 
                fontWeight: item.type === 'directory' ? 'bold' : 'normal',
                color: item.isHidden ? '#999' : 'inherit'
              }}>
                {item.name}
              </div>
              <div style={{ color: '#666', fontSize: '12px' }}>
                {item.type === 'file' ? formatFileSize(item.size) : '—'}
              </div>
              <div style={{ color: '#666', fontSize: '12px' }}>
                {item.extension || item.type}
              </div>
              <div style={{ color: '#666', fontSize: '12px' }}>
                {formatDate(item.modified)}
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (fileManager.viewMode === 'grid') {
      return (
        <div className="file-grid-view" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: '12px',
          padding: '12px'
        }}>
          {fileManager.filteredAndSortedItems.map(item => (
            <div
              key={item.id}
              className={`file-grid-item ${fileManager.selectedItems.includes(item.id) ? 'selected' : ''}`}
              onClick={(e) => handleFileClick(item, e)}
              onDoubleClick={() => handleFileDoubleClick(item)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '8px',
                borderRadius: '6px',
                cursor: 'pointer',
                backgroundColor: fileManager.selectedItems.includes(item.id) ? 'rgba(26, 127, 86, 0.2)' : 'transparent',
                transition: 'background-color 0.2s ease'
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '4px' }}>
                {getFileIcon(item)}
              </div>
              <div style={{
                fontSize: '12px',
                textAlign: 'center',
                wordBreak: 'break-word',
                maxWidth: '100%',
                color: item.isHidden ? '#999' : 'inherit'
              }}>
                {item.name}
              </div>
              {item.type === 'file' && (
                <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
                  {formatFileSize(item.size)}
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }

    return <div>Tree view not implemented yet</div>;
  };

  // Status bar component
  const StatusBar = () => {
    if (!showStatusBar) return null;

    const selectedCount = fileManager.selectedItems.length;
    const totalCount = fileManager.filteredAndSortedItems.length;

    return (
      <div className="file-manager-status-bar" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '4px 12px',
        borderTop: '1px solid rgba(0, 0, 0, 0.1)',
        backgroundColor: 'rgba(245, 245, 245, 0.8)',
        fontSize: '12px',
        color: '#666'
      }}>
        <div>
          {selectedCount > 0 ? `${selectedCount} selected` : `${totalCount} items`}
        </div>
        <div>
          {fileManager.loading && '⏳ Loading...'}
          {fileManager.operations.length > 0 && `📋 ${fileManager.operations.filter(op => op.status === 'processing').length} operations`}
        </div>
      </div>
    );
  };

  return (
    <div 
      className={`file-manager-window ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        backgroundColor: 'white',
        border: '1px solid rgba(0, 0, 0, 0.2)',
        borderRadius: '6px',
        overflow: 'hidden',
        ...style
      }}
    >
      <Toolbar />
      
      <div 
        className="file-manager-content"
        style={{ 
          flex: 1, 
          overflow: 'auto',
          backgroundColor: 'white'
        }}
      >
        {fileManager.loading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px',
            fontSize: '14px',
            color: '#666'
          }}>
            ⏳ Loading directory...
          </div>
        ) : fileManager.error ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px',
            fontSize: '14px',
            color: '#d32f2f'
          }}>
            ❌ {fileManager.error}
          </div>
        ) : (
          <FileList />
        )}
      </div>

      <StatusBar />
    </div>
  );
};

// Export hook for external access
export const useFileManagerWindowHook = (initialPath?: string) => 
  useFileManager(initialPath);