import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UDItem } from '../../core/universalDocument';
import { UDFormat } from '../../core/UDFormat';

/**
 * μ8_NoteWindow - ERDE (☷) Global/Base - Universeller Text/Markdown Editor
 * 
 * Vollständige μX-Bagua Integration mit UDItem Interface, Transformation History,
 * Origin Tracking und algebraischen Transistoren von Raimund.
 * 
 * Features:
 * - UDItem-native Content Management
 * - Transformation History Tracking
 * - Bagua Descriptor Integration
 * - Algebraische Transistor Logik
 * - Context-Aware Functionality
 * - V1 Toolbar Features + V2 Enhancements
 */

interface μ8_NoteWindowProps {
  /** Vollständiges UDItem mit allen Bagua-Metadaten */
  udItem: UDItem;
  /** Callback für UDItem Updates mit Transformation Tracking */
  onUDItemChange: (updatedItem: UDItem, transformationDescription: string) => void;
  /** Callback für Context Manager Integration (📌 Button) */
  onAddToContext?: (item: UDItem) => void;
  /** Read-only Modus */
  readOnly?: boolean;
  /** Bagua-Color-Themes basierend auf Descriptor */
  autoBaguaTheme?: boolean;
}

interface μ8_ContentState {
  text: string;
  wordCount: number;
  charCount: number;
  lineCount: number;
  lastModified: number;
}

export const μ8_NoteWindow: React.FC<μ8_NoteWindowProps> = ({
  udItem,
  onUDItemChange,
  onAddToContext,
  readOnly = false,
  autoBaguaTheme = true
}) => {

  // μ8_ Content State Management (ERDE-Pattern: Global State)
  const [μ8_contentState, setμ8_ContentState] = useState<μ8_ContentState>({
    text: '',
    wordCount: 0,
    charCount: 0,
    lineCount: 1,
    lastModified: Date.now()
  });

  const [μ8_hasUnsavedChanges, setμ8_HasUnsavedChanges] = useState(false);
  const [μ8_isInContext, setμ8_IsInContext] = useState(udItem.is_contextual || false);
  const [μ8_selectedText, setμ8_SelectedText] = useState<string>('');
  const [μ8_selectionRange, setμ8_SelectionRange] = useState<{start: number, end: number}>({start: 0, end: 0});
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // μ8_ Initialize Content from UDItem
  useEffect(() => {
    const contentText = typeof udItem.content === 'string' 
      ? udItem.content 
      : udItem.content?.text || JSON.stringify(udItem.content);
    
    const lines = contentText.split('\n');
    setμ8_ContentState({
      text: contentText,
      wordCount: contentText.trim() ? contentText.trim().split(/\s+/).length : 0,
      charCount: contentText.length,
      lineCount: lines.length,
      lastModified: udItem.updated_at
    });
    setμ8_IsInContext(udItem.is_contextual || false);
  }, [udItem]);

  // μ8_ Bagua Theme Calculator
  const μ8_getBaguaTheme = useCallback((): string => {
    if (!autoBaguaTheme) return 'default';
    
    const descriptor = udItem.bagua_descriptor;
    
    // Raimunds Bagua-Theme-Mapping
    if (descriptor & UDFormat.BAGUA.FEUER) return 'fire'; // Rot/Orange
    if (descriptor & UDFormat.BAGUA.WASSER) return 'water'; // Blau
    if (descriptor & UDFormat.BAGUA.ERDE) return 'earth'; // Braun/Grün
    if (descriptor & UDFormat.BAGUA.HIMMEL) return 'heaven'; // Gold/Weiß
    if (descriptor & UDFormat.BAGUA.WIND) return 'wind'; // Grau/Silber
    if (descriptor & UDFormat.BAGUA.DONNER) return 'thunder'; // Violett
    if (descriptor & UDFormat.BAGUA.BERG) return 'mountain'; // Dunkelgrau
    if (descriptor & UDFormat.BAGUA.SEE) return 'lake'; // Türkis
    if (descriptor & UDFormat.BAGUA.TAIJI) return 'unity'; // Schwarz/Weiß Balance
    
    return 'earth'; // ERDE als Default für μ8
  }, [udItem.bagua_descriptor, autoBaguaTheme]);

  // μ8_ Content Change Handler mit Transformation Tracking
  const μ8_handleContentChange = useCallback((newText: string) => {
    if (readOnly) return;

    const lines = newText.split('\n');
    const newContentState: μ8_ContentState = {
      text: newText,
      wordCount: newText.trim() ? newText.trim().split(/\s+/).length : 0,
      charCount: newText.length,
      lineCount: lines.length,
      lastModified: Date.now()
    };

    setμ8_ContentState(newContentState);
    setμ8_HasUnsavedChanges(true);

    // Auto-save mit 1.5s Debounce (V2 Standard)
    const saveTimeout = setTimeout(() => {
      const updatedContent = typeof udItem.content === 'object' 
        ? { ...udItem.content, text: newText }
        : newText;

      onUDItemChange({
        ...udItem,
        content: updatedContent,
        updated_at: newContentState.lastModified
      }, `Textinhalt bearbeitet: ${newContentState.wordCount} Wörter, ${newContentState.charCount} Zeichen`);

      setμ8_HasUnsavedChanges(false);
    }, 1500);

    return () => clearTimeout(saveTimeout);
  }, [udItem, onUDItemChange, readOnly]);

  // μ8_ Text Formatting Functions (V1 Features preserved)
  const μ8_insertText = useCallback((text: string) => {
    if (readOnly || !textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = μ8_contentState.text.substring(0, start) + text + μ8_contentState.text.substring(end);
    
    μ8_handleContentChange(newContent);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  }, [μ8_contentState.text, μ8_handleContentChange, readOnly]);

  const μ8_formatText = useCallback((prefix: string, suffix: string = '') => {
    if (readOnly || !textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = μ8_contentState.text.substring(start, end);
    
    const newText = prefix + selectedText + suffix;
    const newContent = μ8_contentState.text.substring(0, start) + newText + μ8_contentState.text.substring(end);
    
    μ8_handleContentChange(newContent);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 0);
  }, [μ8_contentState.text, μ8_handleContentChange, readOnly]);

  // μ8_ Context Manager Integration  
  const μ8_toggleContext = useCallback(() => {
    if (!onAddToContext) return;

    const wasInContext = μ8_isInContext;
    
    // Toggle Context State
    setμ8_IsInContext(!wasInContext);
    
    // Update UDItem is_contextual
    onUDItemChange({
      ...udItem,
      is_contextual: !wasInContext
    }, !wasInContext 
      ? 'Zum AI-Context hinzugefügt' 
      : 'Aus AI-Context entfernt'
    );

    // Trigger Context Manager
    if (!wasInContext) {
      onAddToContext({
        ...udItem,
        is_contextual: true
      });
    }
  }, [μ8_isInContext, udItem, onUDItemChange, onAddToContext]);

  // μ8_ Clear Content mit Confirmation
  const μ8_clearContent = useCallback(() => {
    if (readOnly) return;
    
    if (confirm('🗑️ Gesamten Inhalt löschen?')) {
      μ8_handleContentChange('');
    }
  }, [μ8_handleContentChange, readOnly]);

  // μ8_ Get Bagua Info Display
  const μ8_getBaguaInfo = useCallback((): string => {
    const descriptor = udItem.bagua_descriptor;
    const symbols: string[] = [];
    
    if (descriptor & UDFormat.BAGUA.HIMMEL) symbols.push('☰');
    if (descriptor & UDFormat.BAGUA.WIND) symbols.push('☴');
    if (descriptor & UDFormat.BAGUA.WASSER) symbols.push('☵');
    if (descriptor & UDFormat.BAGUA.BERG) symbols.push('☶');
    if (descriptor & UDFormat.BAGUA.SEE) symbols.push('☱');
    if (descriptor & UDFormat.BAGUA.FEUER) symbols.push('☲');
    if (descriptor & UDFormat.BAGUA.DONNER) symbols.push('☳');
    if (descriptor & UDFormat.BAGUA.ERDE) symbols.push('☷');
    if (descriptor & UDFormat.BAGUA.TAIJI) symbols.push('☯');
    
    return symbols.join('') || '○';
  }, [udItem.bagua_descriptor]);

  // μ8_ Text Selection Tracking
  const μ8_handleSelection = useCallback(() => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    setμ8_SelectedText(selectedText);
    setμ8_SelectionRange({ start, end });
  }, []);

  // μ8_ Copy Selected Text (Ctrl+C behavior)
  const μ8_copySelectedText = useCallback(async () => {
    if (!μ8_selectedText) return false;
    
    try {
      await navigator.clipboard.writeText(μ8_selectedText);
      console.log('📋 μ8 Text copied to clipboard:', μ8_selectedText.length, 'characters');
      return true;
    } catch (error) {
      console.error('❌ μ8 Copy failed:', error);
      return false;
    }
  }, [μ8_selectedText]);

  // μ8_ Cut Selected Text (Ctrl+X behavior)
  const μ8_cutSelectedText = useCallback(async () => {
    if (!μ8_selectedText || readOnly) return false;
    
    try {
      await navigator.clipboard.writeText(μ8_selectedText);
      
      // Remove selected text from content
      const newText = μ8_contentState.text.substring(0, μ8_selectionRange.start) + 
                      μ8_contentState.text.substring(μ8_selectionRange.end);
      
      μ8_handleContentChange(newText);
      
      // Reset selection
      setμ8_SelectedText('');
      setμ8_SelectionRange({ start: μ8_selectionRange.start, end: μ8_selectionRange.start });
      
      console.log('✂️ μ8 Text cut to clipboard:', μ8_selectedText.length, 'characters');
      return true;
    } catch (error) {
      console.error('❌ μ8 Cut failed:', error);
      return false;
    }
  }, [μ8_selectedText, μ8_selectionRange, μ8_contentState.text, μ8_handleContentChange, readOnly]);

  // μ8_ Paste Text (Ctrl+V behavior)
  const μ8_pasteText = useCallback(async () => {
    if (readOnly || !textareaRef.current) return false;
    
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (!clipboardText) return false;
      
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      // Insert clipboard text at cursor position
      const newText = μ8_contentState.text.substring(0, start) + 
                      clipboardText + 
                      μ8_contentState.text.substring(end);
      
      μ8_handleContentChange(newText);
      
      // Position cursor after pasted text
      setTimeout(() => {
        const newCursorPos = start + clipboardText.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
      }, 0);
      
      console.log('📄 μ8 Text pasted from clipboard:', clipboardText.length, 'characters');
      return true;
    } catch (error) {
      console.error('❌ μ8 Paste failed:', error);
      return false;
    }
  }, [μ8_contentState.text, μ8_handleContentChange, readOnly]);

  // μ8_ Keyboard Shortcuts Handler
  const μ8_handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'c':
          e.preventDefault();
          μ8_copySelectedText();
          break;
        case 'x':
          e.preventDefault();
          μ8_cutSelectedText();
          break;
        case 'v':
          e.preventDefault();
          μ8_pasteText();
          break;
        case 'a':
          e.preventDefault();
          // Select all text
          if (textareaRef.current) {
            textareaRef.current.select();
            μ8_handleSelection();
          }
          break;
      }
    }
  }, [μ8_copySelectedText, μ8_cutSelectedText, μ8_pasteText, μ8_handleSelection]);

  // μ8_ Universal Event Listeners for Context Menu Actions
  useEffect(() => {
    const handleSelectAll = (e: CustomEvent) => {
      if (e.detail.itemId === udItem.id && textareaRef.current) {
        textareaRef.current.select();
        μ8_handleSelection();
      }
    };

    const handleCopyText = (e: CustomEvent) => {
      if (e.detail.itemId === udItem.id) {
        μ8_copySelectedText();
      }
    };

    const handleCutText = (e: CustomEvent) => {
      if (e.detail.itemId === udItem.id) {
        μ8_cutSelectedText();
      }
    };

    const handlePasteText = (e: CustomEvent) => {
      if (e.detail.itemId === udItem.id) {
        μ8_pasteText();
      }
    };

    // Add event listeners
    document.addEventListener('universal-select-all', handleSelectAll as EventListener);
    document.addEventListener('universal-copy-text', handleCopyText as EventListener);
    document.addEventListener('universal-cut-text', handleCutText as EventListener);
    document.addEventListener('universal-paste-text', handlePasteText as EventListener);

    // Cleanup
    return () => {
      document.removeEventListener('universal-select-all', handleSelectAll as EventListener);
      document.removeEventListener('universal-copy-text', handleCopyText as EventListener);
      document.removeEventListener('universal-cut-text', handleCutText as EventListener);
      document.removeEventListener('universal-paste-text', handlePasteText as EventListener);
    };
  }, [udItem.id, μ8_handleSelection, μ8_copySelectedText, μ8_cutSelectedText, μ8_pasteText]);

  // Raimunds algebraischer Transistor für Conditional Rendering
  const μ8_showToolbar = UDFormat.transistor(!readOnly);
  const μ8_showContextButton = UDFormat.transistor(!!onAddToContext);
  const μ8_showCopyPaste = UDFormat.transistor(!!μ8_selectedText); // Show copy/paste when text selected
  const μ8_themeClass = μ8_getBaguaTheme();

  // Window Styling basierend auf Bagua Theme
  const μ8_windowStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    minWidth: '250px',
    minHeight: '200px',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'white',
    border: `2px solid ${μ8_isInContext ? '#ef4444' : '#e5e7eb'}`,
    borderRadius: '8px',
    boxShadow: μ8_isInContext 
      ? '0 4px 20px rgba(239, 68, 68, 0.15)' 
      : '0 4px 12px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    position: 'relative'
  };

  return (
    <div className={`μ8-note-window μ8-theme-${μ8_themeClass}`} style={μ8_windowStyle}>
      
      {/* μ8_ Toolbar - Enhanced V1 + V2 Features */}
      {μ8_showToolbar === 1 && (
        <div className="μ8-note-toolbar" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          backgroundColor: '#f9fafb',
          borderBottom: '1px solid #e5e7eb',
          gap: '8px'
        }}>
          
          {/* Format Buttons (V1 Features) */}
          <div className="μ8-format-buttons" style={{
            display: 'flex',
            gap: '4px'
          }}>
            <button onClick={() => μ8_formatText('**', '**')} title="Bold" style={toolButtonStyle}>
              <strong>B</strong>
            </button>
            <button onClick={() => μ8_formatText('*', '*')} title="Italic" style={toolButtonStyle}>
              <em>I</em>
            </button>
            <button onClick={() => μ8_formatText('`', '`')} title="Code" style={toolButtonStyle}>
              &lt;/&gt;
            </button>
            <button onClick={() => μ8_insertText('# ')} title="Heading" style={toolButtonStyle}>
              H1
            </button>
            <button onClick={() => μ8_insertText('- ')} title="List" style={toolButtonStyle}>
              •
            </button>
            <button onClick={() => μ8_insertText('> ')} title="Quote" style={toolButtonStyle}>
              "
            </button>
          </div>

          {/* V2 Enhancements */}
          <div className="μ8-meta-buttons" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            
            {/* Bagua Display */}
            <span 
              title={`Bagua: ${udItem.bagua_descriptor} - ${μ8_getBaguaInfo()}`}
              style={{
                fontSize: '16px',
                cursor: 'help'
              }}
            >
              {μ8_getBaguaInfo()}
            </span>

            {/* Text Selection Clipboard Buttons */}
            {μ8_showCopyPaste === 1 && (
              <>
                <button
                  onClick={μ8_copySelectedText}
                  title={`Copy "${μ8_selectedText.substring(0, 20)}${μ8_selectedText.length > 20 ? '...' : ''}" (Ctrl+C)`}
                  style={{
                    ...toolButtonStyle,
                    backgroundColor: '#10b981',
                    color: 'white'
                  }}
                >
                  📋
                </button>
                {!readOnly && (
                  <>
                    <button
                      onClick={μ8_cutSelectedText}
                      title={`Cut "${μ8_selectedText.substring(0, 20)}${μ8_selectedText.length > 20 ? '...' : ''}" (Ctrl+X)`}
                      style={{
                        ...toolButtonStyle,
                        backgroundColor: '#f59e0b',
                        color: 'white'
                      }}
                    >
                      ✂️
                    </button>
                    <button
                      onClick={μ8_pasteText}
                      title="Paste from clipboard (Ctrl+V)"
                      style={{
                        ...toolButtonStyle,
                        backgroundColor: '#3b82f6',
                        color: 'white'
                      }}
                    >
                      📄
                    </button>
                  </>
                )}
              </>
            )}

            {/* Context Button */}
            {μ8_showContextButton === 1 && (
              <button
                onClick={μ8_toggleContext}
                title={μ8_isInContext ? 'Aus AI-Context entfernen' : 'Zum AI-Context hinzufügen'}
                style={{
                  ...toolButtonStyle,
                  backgroundColor: μ8_isInContext ? '#ef4444' : '#6b7280',
                  color: 'white',
                  fontWeight: '600'
                }}
              >
                📌
              </button>
            )}

            {/* Clear Button */}
            <button 
              onClick={μ8_clearContent} 
              title="Clear Content"
              style={{
                ...toolButtonStyle,
                color: '#ef4444'
              }}
            >
              🗑️
            </button>
          </div>

        </div>
      )}

      {/* μ8_ Content Area */}
      <div className="μ8-note-content" style={{
        flex: 1,
        position: 'relative'
      }}>
        <textarea
          ref={textareaRef}
          value={μ8_contentState.text}
          onChange={(e) => μ8_handleContentChange(e.target.value)}
          onSelect={μ8_handleSelection}
          onMouseUp={μ8_handleSelection}
          onKeyUp={μ8_handleSelection}
          onKeyDown={μ8_handleKeyDown}
          placeholder={readOnly ? 'No content' : 'Start typing your note...'}
          readOnly={readOnly}
          spellCheck={true}
          style={{
            width: '100%',
            height: '100%',
            padding: '16px',
            border: 'none',
            outline: 'none',
            resize: 'none',
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
            fontSize: '14px',
            lineHeight: '1.5',
            backgroundColor: 'transparent'
          }}
        />

        {/* Unsaved Changes Indicator */}
        {μ8_hasUnsavedChanges && (
          <div style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            padding: '4px 8px',
            backgroundColor: '#f59e0b',
            color: 'white',
            fontSize: '12px',
            borderRadius: '4px',
            fontWeight: '500'
          }}>
            Unsaved
          </div>
        )}
      </div>

      {/* μ8_ Status Bar - Enhanced */}
      <div className="μ8-note-status" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '6px 12px',
        backgroundColor: '#f9fafb',
        borderTop: '1px solid #e5e7eb',
        fontSize: '12px',
        color: '#6b7280'
      }}>
        
        {/* Left: Content Stats */}
        <div className="μ8-content-stats" style={{
          display: 'flex',
          gap: '12px'
        }}>
          <span>{μ8_contentState.wordCount} words</span>
          <span>{μ8_contentState.charCount} chars</span>
          <span>{μ8_contentState.lineCount} lines</span>
          {μ8_selectedText && (
            <span style={{ 
              color: '#10b981', 
              fontWeight: '600',
              backgroundColor: '#f0fdf4',
              padding: '2px 6px',
              borderRadius: '3px',
              border: '1px solid #10b981'
            }}>
              📋 {μ8_selectedText.length} selected
            </span>
          )}
        </div>

        {/* Center: UDItem Info */}
        <div className="μ8-uditem-info" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '11px'
        }}>
          <span title="UDItem ID">{udItem.id.split('_').pop()}</span>
          <span title="Last Modified">{new Date(μ8_contentState.lastModified).toLocaleTimeString()}</span>
          {μ8_isInContext && (
            <span 
              title="In AI Context" 
              style={{ color: '#ef4444', fontWeight: '600' }}
            >
              📌 CONTEXT
            </span>
          )}
        </div>

        {/* Right: Mode */}
        <div className="μ8-mode-info">
          <span className="μ8-mode-badge" style={{
            padding: '2px 6px',
            borderRadius: '4px',
            backgroundColor: readOnly ? '#6b7280' : '#22c55e',
            color: 'white',
            fontWeight: '500',
            fontSize: '11px'
          }}>
            {readOnly ? 'READ-ONLY' : 'EDIT'}
          </span>
        </div>

      </div>

    </div>
  );
};

// μ8_ Tool Button Styling
const toolButtonStyle: React.CSSProperties = {
  padding: '4px 8px',
  fontSize: '12px',
  border: '1px solid #d1d5db',
  borderRadius: '4px',
  backgroundColor: 'white',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};

export default μ8_NoteWindow;