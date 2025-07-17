import React, { useState, useEffect, useRef } from 'react';
import './NoteWindow.css';

interface NoteWindowProps {
  content: string;
  onContentChange: (content: string) => void;
  readOnly?: boolean;
}

const NoteWindow: React.FC<NoteWindowProps> = ({
  content,
  onContentChange,
  readOnly = false
}) => {
  const [localContent, setLocalContent] = useState(content || '');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalContent(content || '');
    updateCounts(content || '');
  }, [content]);

  const updateCounts = (text: string) => {
    setCharCount(text.length);
    setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setLocalContent(newContent);
    updateCounts(newContent);
    onContentChange(newContent);
  };

  const insertText = (text: string) => {
    if (readOnly || !textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = localContent.substring(0, start) + text + localContent.substring(end);
    
    setLocalContent(newContent);
    updateCounts(newContent);
    onContentChange(newContent);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  const formatText = (prefix: string, suffix: string = '') => {
    if (readOnly || !textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = localContent.substring(start, end);
    
    const newText = prefix + selectedText + suffix;
    const newContent = localContent.substring(0, start) + newText + localContent.substring(end);
    
    setLocalContent(newContent);
    updateCounts(newContent);
    onContentChange(newContent);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 0);
  };

  const clearContent = () => {
    if (readOnly) return;
    if (confirm('Clear all content?')) {
      setLocalContent('');
      updateCounts('');
      onContentChange('');
    }
  };

  return (
    <div className="note-window">
      {!readOnly && (
        <div className="note-toolbar">
          <div className="format-buttons">
            <button onClick={() => formatText('**', '**')} title="Bold">
              <strong>B</strong>
            </button>
            <button onClick={() => formatText('*', '*')} title="Italic">
              <em>I</em>
            </button>
            <button onClick={() => formatText('`', '`')} title="Code">
              &lt;/&gt;
            </button>
            <button onClick={() => insertText('# ')} title="Heading">
              H1
            </button>
            <button onClick={() => insertText('- ')} title="List">
              •
            </button>
            <button onClick={() => insertText('> ')} title="Quote">
              "
            </button>
          </div>
          <button className="clear-btn" onClick={clearContent} title="Clear">
            🗑️
          </button>
        </div>
      )}
      
      <div className="note-content">
        <textarea
          ref={textareaRef}
          value={localContent}
          onChange={handleChange}
          placeholder={readOnly ? 'No content' : 'Start typing your note...'}
          className="note-textarea"
          readOnly={readOnly}
          spellCheck={true}
        />
      </div>
      
      <div className="note-status">
        <span className="note-stats">
          {wordCount} words • {charCount} chars
        </span>
        <span className="note-mode">
          {readOnly ? 'READ-ONLY' : 'EDIT'}
        </span>
      </div>
    </div>
  );
};

export default NoteWindow;