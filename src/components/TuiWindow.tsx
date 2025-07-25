import React, { useState, useRef, useEffect } from 'react';
import '../styles/TuiWindow.css';

interface TuiWindowProps {
  content: string;
  onContentChange?: (content: string) => void;
  onThemeChange?: (theme: 'green' | 'amber' | 'white' | 'blue') => void;
  readOnly?: boolean;
  width?: number;
  height?: number;
  theme?: 'green' | 'amber' | 'white' | 'blue';
}

const TuiWindow: React.FC<TuiWindowProps> = ({
  content,
  onContentChange,
  onThemeChange,
  readOnly = false,
  width = 80,
  height = 25,
  theme = 'green'
}) => {
  const [localContent, setLocalContent] = useState(content);
  const [cursorPosition, setCursorPosition] = useState({ row: 1, col: 1 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  const handleContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = event.target.value;
    setLocalContent(newContent);
    onContentChange?.(newContent);
    updateCursorPosition(event.target);
  };

  const updateCursorPosition = (textarea: HTMLTextAreaElement) => {
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = textarea.value.substring(0, cursorPos);
    const lines = textBeforeCursor.split('\n');
    const row = lines.length;
    const col = lines[lines.length - 1].length + 1;
    setCursorPosition({ row, col });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle special terminal keys
    if (event.key === 'Tab') {
      event.preventDefault();
      const textarea = event.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = localContent.substring(0, start) + '    ' + localContent.substring(end);
      setLocalContent(newContent);
      onContentChange?.(newContent);
      
      // Move cursor after the inserted spaces
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
        updateCursorPosition(textarea);
      }, 0);
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLTextAreaElement>) => {
    updateCursorPosition(event.currentTarget);
  };

  // Format content to ensure proper dimensions
  const formatContent = (text: string): string => {
    const lines = text.split('\n');
    const formattedLines = lines.slice(0, height).map(line => {
      if (line.length > width) {
        return line.substring(0, width);
      }
      return line.padEnd(width, ' ');
    });
    
    // Fill remaining lines with spaces
    while (formattedLines.length < height) {
      formattedLines.push(' '.repeat(width));
    }
    
    return formattedLines.join('\n');
  };

  const displayContent = formatContent(localContent);

  return (
    <div className={`tui-window tui-theme-${theme}`}>
      <div className="tui-screen">
        <textarea
          ref={textareaRef}
          className="tui-textarea"
          value={displayContent}
          onChange={handleContentChange}
          onKeyDown={handleKeyDown}
          onClick={handleClick}
          readOnly={readOnly}
          spellCheck={false}
          wrap="off"
          rows={height}
          cols={width}
          style={{
            width: `${width * 0.6}em`,
            height: `${height * 1.2}em`,
          }}
        />
      </div>
      <div className="tui-status-bar">
        <div className="tui-status-left">
          <span className="tui-status-mode">
            {readOnly ? 'VIEW' : 'EDIT'}
          </span>
          <span className="tui-status-size">
            {width}x{height}
          </span>
          <div className="tui-theme-selector">
            <button onClick={() => onThemeChange?.('green')} className={`theme-btn ${theme === 'green' ? 'active' : ''}`}>🟢</button>
            <button onClick={() => onThemeChange?.('amber')} className={`theme-btn ${theme === 'amber' ? 'active' : ''}`}>🟡</button>
            <button onClick={() => onThemeChange?.('white')} className={`theme-btn ${theme === 'white' ? 'active' : ''}`}>⚪</button>
            <button onClick={() => onThemeChange?.('blue')} className={`theme-btn ${theme === 'blue' ? 'active' : ''}`}>🔵</button>
          </div>
        </div>
        <div className="tui-status-right">
          <button 
            className="copy-btn"
            onClick={() => {
              navigator.clipboard.writeText(content);
              const toast = document.createElement('div');
              toast.textContent = '📋 TUI Copied!';
              toast.className = 'copy-toast';
              document.body.appendChild(toast);
              setTimeout(() => toast.remove(), 2000);
            }}
          >
            📋
          </button>
          <span className="tui-status-cursor">
            {cursorPosition.row}:{cursorPosition.col}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TuiWindow;