import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { UDItem } from '../../core/universalDocument';
import { UDFormat } from '../../core/UDFormat';

/**
 * μ2_CodeWindow - WIND (☴) Views/UI - Universeller Code Editor
 * 
 * Vollständige μX-Bagua Integration für Code-Entwicklung mit:
 * - Syntax Highlighting für TypeScript/JavaScript/HTML/CSS/Python
 * - Language-specific Formatting
 * - Line Numbers Display
 * - UDItem-native Content Management
 * - Transformation History Tracking
 * - Bagua Descriptor Integration (HIMMEL + FEUER für Code)
 * - Context-Aware Functionality
 * 
 * Standards für AI-Modelle:
 * - TypeScript bevorzugt (μX-Bagua Konvention)
 * - Python für Data Science & AI Tasks
 * - Funktions-basierter Code mit μX-Prefix
 * - Campus-Model Single-Responsibility Pattern
 */

interface μ2_CodeWindowProps {
  /** Vollständiges UDItem mit Code-spezifischen Metadaten */
  udItem: UDItem;
  /** Callback für UDItem Updates mit Transformation Tracking */
  onUDItemChange: (updatedItem: UDItem, transformationDescription: string) => void;
  /** Callback für Context Manager Integration (📌 Button) */
  onAddToContext?: (item: UDItem) => void;
  /** Read-only Modus für Code-Review */
  readOnly?: boolean;
  /** Auto-Format bei Save */
  autoFormat?: boolean;
}

interface μ2_CodeState {
  code: string;
  language: string;
  lineCount: number;
  charCount: number;
  lastModified: number;
  hasErrors: boolean;
  isFormatted: boolean;
}

// μ2_ Supported Languages mit sprachspezifischer Formatierung (WIND-Pattern: UI Language Selection)
const μ2_SUPPORTED_LANGUAGES = [
  { id: 'typescript', name: 'TypeScript', icon: '🔷', ext: '.ts', indentSize: 2, brackets: ['{', '}'] },
  { id: 'javascript', name: 'JavaScript', icon: '🟨', ext: '.js', indentSize: 2, brackets: ['{', '}'] },
  { id: 'python', name: 'Python', icon: '🐍', ext: '.py', indentSize: 4, brackets: [':', ''] },
  { id: 'html', name: 'HTML', icon: '🟧', ext: '.html', indentSize: 2, brackets: ['<', '>'] },
  { id: 'css', name: 'CSS', icon: '🎨', ext: '.css', indentSize: 2, brackets: ['{', '}'] },
  { id: 'json', name: 'JSON', icon: '📋', ext: '.json', indentSize: 2, brackets: ['{', '}'] },
  { id: 'markdown', name: 'Markdown', icon: '📝', ext: '.md', indentSize: 2, brackets: ['', ''] },
  { id: 'plain', name: 'Plain Text', icon: '📄', ext: '.txt', indentSize: 2, brackets: ['', ''] }
];

export const μ2_CodeWindow: React.FC<μ2_CodeWindowProps> = ({
  udItem,
  onUDItemChange,
  onAddToContext,
  readOnly = false,
  autoFormat = true
}) => {

  // μ2_ Code State Management (WIND-Pattern: UI State)
  const [μ2_codeState, setμ2_CodeState] = useState<μ2_CodeState>({
    code: udItem.content?.code || udItem.content?.text || '',
    language: udItem.content?.language || 'typescript',
    lineCount: 1,
    charCount: 0,
    lastModified: Date.now(),
    hasErrors: false,
    isFormatted: false
  });

  // μ7_ Event Handlers (DONNER-Pattern: Events)
  const μ2_textareaRef = useRef<HTMLTextAreaElement>(null);
  const [μ2_isContextual, setμ2_IsContextual] = useState(udItem.is_contextual || false);
  const [μ2_scrollTop, setμ2_ScrollTop] = useState(0);
  
  // μ5_ Theme State (SEE-Pattern: Properties) - moved up for callback access
  const [μ5_theme, setμ5_Theme] = useState(udItem.content?.theme || 'light');

  // μ6_ Initialize Code Content (FEUER-Pattern: Functions)
  useEffect(() => {
    const initialCode = udItem.content?.code || udItem.content?.text || '// Neuer Code\nfunction μ1_example() {\n  return "UniversalDesktop v2.1";\n}';
    const initialLanguage = udItem.content?.language || 'typescript';
    
    setμ2_CodeState(prev => ({
      ...prev,
      code: initialCode,
      language: initialLanguage,
      lineCount: (initialCode.match(/\n/g) || []).length + 1,
      charCount: initialCode.length
    }));
  }, [udItem.content]);

  // μ5_ Sync Theme State with UDItem changes
  useEffect(() => {
    const newTheme = udItem.content?.theme || 'light';
    setμ5_Theme(newTheme);
  }, [udItem.content?.theme]);

  // μ6_ Update Code Content (FEUER-Pattern: Code Processing)
  const μ6_updateCodeContent = useCallback((newCode: string, description: string = "Code edited") => {
    const lineCount = (newCode.match(/\n/g) || []).length + 1;
    const charCount = newCode.length;

    setμ2_CodeState(prev => ({
      ...prev,
      code: newCode,
      lineCount,
      charCount,
      lastModified: Date.now(),
      hasErrors: false // Basic implementation
    }));

    // μ8_ UDItem Update mit Transformation History (ERDE-Pattern: Global State)
    const updatedItem: UDItem = {
      ...udItem,
      content: {
        ...udItem.content,
        code: newCode,
        text: newCode, // Backward compatibility
        language: μ2_codeState.language,
        theme: μ5_theme // Preserve current theme!
      },
      updated_at: new Date().toISOString(),
      transformation_history: [
        ...(udItem.transformation_history || []),
        {
          timestamp: new Date().toISOString(),
          description,
          previous_bagua: udItem.bagua_descriptor || 0,
          new_bagua: udItem.bagua_descriptor || 0,
          user_id: 'current-user',
          transformation_type: 'content_edit'
        }
      ]
    };

    onUDItemChange(updatedItem, description);
  }, [udItem, onUDItemChange, μ2_codeState.language, μ5_theme]);

  // μ6_ Language Change Handler (FEUER-Pattern: Language Processing)
  const μ6_changeLanguage = useCallback((newLanguage: string) => {
    setμ2_CodeState(prev => ({ ...prev, language: newLanguage }));
    
    // Update UDItem with new language - preserve ALL existing content
    const updatedItem: UDItem = {
      ...udItem,
      content: {
        ...udItem.content,
        language: newLanguage,
        theme: udItem.content?.theme || μ5_theme // Preserve current theme
      }
    };
    
    onUDItemChange(updatedItem, `Language changed to ${newLanguage}`);
  }, [udItem, onUDItemChange, μ5_theme]);

  // μ6_ Theme Change Handler (FEUER-Pattern: Theme Processing)  
  const μ6_changeTheme = useCallback((newTheme: string) => {
    setμ5_Theme(newTheme);
    
    // Update UDItem with new theme - preserve ALL existing content
    const updatedItem: UDItem = {
      ...udItem,
      content: {
        ...udItem.content,
        theme: newTheme,
        language: udItem.content?.language || μ2_codeState.language // Preserve current language
      }
    };
    
    onUDItemChange(updatedItem, `Theme changed to ${newTheme}`);
  }, [udItem, onUDItemChange, μ2_codeState.language]);

  // μ6_ Language-specific Auto-Format Code (FEUER-Pattern: Code Formatting)
  const μ6_formatCode = useCallback(() => {
    if (!autoFormat) return;

    const langConfig = μ2_SUPPORTED_LANGUAGES.find(l => l.id === μ2_codeState.language);
    if (!langConfig) return;

    let formatted = μ2_codeState.code;
    const indent = ' '.repeat(langConfig.indentSize);

    if (μ2_codeState.language === 'python') {
      // Python-specific formatting
      const lines = formatted.split('\n');
      let indentLevel = 0;
      const indentedLines = lines.map(line => {
        const trimmed = line.trim();
        if (trimmed.endsWith(':')) {
          const result = indent.repeat(indentLevel) + trimmed;
          indentLevel++;
          return result;
        } else if (trimmed === '' || trimmed.startsWith('#')) {
          return line; // Keep empty lines and comments as-is
        } else {
          // Check if we should dedent
          if (trimmed.startsWith('except ') || trimmed.startsWith('elif ') || 
              trimmed.startsWith('else:') || trimmed.startsWith('finally:')) {
            indentLevel = Math.max(0, indentLevel - 1);
            const result = indent.repeat(indentLevel) + trimmed;
            if (trimmed.endsWith(':')) indentLevel++;
            return result;
          }
          return indent.repeat(indentLevel) + trimmed;
        }
      });
      formatted = indentedLines.join('\n');

    } else if (μ2_codeState.language === 'typescript' || μ2_codeState.language === 'javascript') {
      // TypeScript/JavaScript formatting
      const lines = formatted.split('\n');
      let indentLevel = 0;
      const indentedLines = lines.map(line => {
        const trimmed = line.trim();
        if (trimmed.endsWith('{')) {
          const result = indent.repeat(indentLevel) + trimmed;
          indentLevel++;
          return result;
        } else if (trimmed.startsWith('}')) {
          indentLevel = Math.max(0, indentLevel - 1);
          return indent.repeat(indentLevel) + trimmed;
        } else if (trimmed === '') {
          return ''; // Keep empty lines
        } else {
          return indent.repeat(indentLevel) + trimmed;
        }
      });
      formatted = indentedLines.join('\n');

      // Add semicolons for JS/TS (basic)
      formatted = formatted.replace(/([^;,{}\s])\s*\n/g, '$1;\n');

    } else if (μ2_codeState.language === 'html') {
      // Basic HTML indentation
      const lines = formatted.split('\n');
      let indentLevel = 0;
      const indentedLines = lines.map(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('</')) {
          indentLevel = Math.max(0, indentLevel - 1);
          return indent.repeat(indentLevel) + trimmed;
        } else if (trimmed.startsWith('<') && !trimmed.endsWith('/>') && !trimmed.includes('</')) {
          const result = indent.repeat(indentLevel) + trimmed;
          indentLevel++;
          return result;
        } else {
          return indent.repeat(indentLevel) + trimmed;
        }
      });
      formatted = indentedLines.join('\n');
    }

    if (formatted !== μ2_codeState.code) {
      μ6_updateCodeContent(formatted, `Auto-formatted ${μ2_codeState.language} code`);
      setμ2_CodeState(prev => ({ ...prev, isFormatted: true }));
    }
  }, [μ2_codeState.code, μ2_codeState.language, autoFormat, μ6_updateCodeContent]);

  // μ7_ Context Pin Toggle (DONNER-Pattern: Event Handler)
  const μ7_toggleContextPin = useCallback(() => {
    if (!onAddToContext) return;
    
    const newContextualState = !μ2_isContextual;
    setμ2_IsContextual(newContextualState);
    
    const updatedItem: UDItem = {
      ...udItem,
      is_contextual: newContextualState
    };
    
    onUDItemChange(updatedItem, newContextualState ? "Added to AI context" : "Removed from AI context");
    
    if (newContextualState) {
      onAddToContext(updatedItem);
    }
  }, [udItem, onUDItemChange, onAddToContext, μ2_isContextual]);

  // μ7_ Keyboard Shortcuts (DONNER-Pattern: Events)
  const μ7_handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      μ6_formatCode();
    } else if (e.ctrlKey && e.shiftKey && e.key === 'F') {
      e.preventDefault();
      μ6_formatCode();
    }
  }, [μ6_formatCode]);

  // μ7_ Scroll Synchronization (DONNER-Pattern: Events)
  const μ7_handleScroll = useCallback((e: React.UIEvent<HTMLTextAreaElement>) => {
    setμ2_ScrollTop(e.currentTarget.scrollTop);
  }, []);


  // μ5_ Bagua Theme Colors (SEE-Pattern: Properties)
  const μ5_baguaTheme = useMemo(() => {
    if (μ5_theme === 'dark') {
      return {
        borderColor: '#00aa00', // Classic terminal green
        backgroundColor: '#001100', // Dark green background
        accentColor: '#00ff00', // Bright green
        lineNumberBg: '#003300',
        lineNumberColor: '#00aa00',
        textColor: '#00ff00',
        textBg: '#001100'
      };
    }
    return {
      borderColor: 'rgba(167, 139, 250, 0.3)', // Light theme (original)
      backgroundColor: 'rgba(167, 139, 250, 0.02)',
      accentColor: '#a78bfa', 
      lineNumberBg: 'rgba(107, 114, 128, 0.1)',
      lineNumberColor: '#6b7280',
      textColor: '#1f2937',
      textBg: 'white'
    };
  }, [μ5_theme]);

  // μ2_ Generate Line Numbers (WIND-Pattern: UI Element)
  const μ2_generateLineNumbers = useCallback(() => {
    const lines = Array.from({ length: μ2_codeState.lineCount }, (_, i) => i + 1);
    return lines.map(lineNum => (
      <div
        key={lineNum}
        style={{
          height: '21px', // Same as line-height * font-size (1.5 * 14px)
          fontSize: '12px',
          color: μ5_baguaTheme.lineNumberColor,
          textAlign: 'right',
          paddingRight: '8px',
          fontFamily: 'Monaco, Consolas, "Courier New", monospace',
          userSelect: 'none'
        }}
      >
        {lineNum}
      </div>
    ));
  }, [μ2_codeState.lineCount, μ5_baguaTheme.lineNumberColor]);

  // μ2_ Language Selector (WIND-Pattern: UI Element)
  const μ2_languageSelector = (
    <select
      value={μ2_codeState.language}
      onChange={(e) => μ6_changeLanguage(e.target.value)}
      disabled={readOnly}
      style={{
        padding: '4px 8px',
        borderRadius: '4px',
        border: '1px solid rgba(167, 139, 250, 0.3)',
        backgroundColor: 'white',
        fontSize: '12px',
        color: '#a78bfa'
      }}
    >
      {μ2_SUPPORTED_LANGUAGES.map(lang => (
        <option key={lang.id} value={lang.id}>
          {lang.icon} {lang.name}
        </option>
      ))}
    </select>
  );

  // μ2_ Render (WIND-Pattern: Views/UI)
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'monospace',
      border: `2px solid ${μ5_baguaTheme.borderColor}`,
      borderRadius: '8px',
      backgroundColor: μ5_baguaTheme.backgroundColor
    }}>
      
      {/* μ2_ Header mit Language Selector & Stats */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 12px',
        backgroundColor: 'rgba(167, 139, 250, 0.05)',
        borderBottom: `1px solid ${μ5_baguaTheme.borderColor}`,
        fontSize: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontWeight: 'bold', color: μ5_baguaTheme.accentColor }}>
            💻 Code Editor
          </span>
          {μ2_languageSelector}
          
          {/* μ5_ Theme Selector */}
          <select
            value={μ5_theme}
            onChange={(e) => μ6_changeTheme(e.target.value)}
            disabled={readOnly}
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              border: `1px solid ${μ5_baguaTheme.borderColor}`,
              backgroundColor: μ5_baguaTheme.textBg,
              fontSize: '12px',
              color: μ5_baguaTheme.accentColor
            }}
          >
            <option value="light">☀️ Light</option>
            <option value="dark">🌙 Dark</option>
          </select>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* μ2_ Code Stats */}
          <span style={{ color: '#6b7280' }}>
            Lines: {μ2_codeState.lineCount} | Chars: {μ2_codeState.charCount}
          </span>
          
          {/* μ7_ Context Pin Button */}
          {onAddToContext && (
            <button
              onClick={μ7_toggleContextPin}
              title={μ2_isContextual ? 'Remove from AI Context' : 'Add to AI Context'}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '16px',
                cursor: 'pointer',
                color: μ2_isContextual ? μ5_baguaTheme.accentColor : '#9ca3af'
              }}
            >
              📌
            </button>
          )}
          
          {/* μ6_ Format Button */}
          {!readOnly && (
            <button
              onClick={μ6_formatCode}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                border: `1px solid ${μ5_baguaTheme.borderColor}`,
                backgroundColor: 'white',
                color: μ5_baguaTheme.accentColor,
                fontSize: '11px',
                cursor: 'pointer'
              }}
              title="Format Code (Ctrl+Shift+F)"
            >
              ✨ Format
            </button>
          )}
        </div>
      </div>

      {/* μ2_ Code Editor mit Line Numbers */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        backgroundColor: μ5_baguaTheme.textBg
      }}>
        
        {/* μ2_ Line Numbers Column */}
        <div style={{
          width: '50px',
          backgroundColor: μ5_baguaTheme.lineNumberBg,
          borderRight: `1px solid ${μ5_baguaTheme.borderColor}`,
          paddingTop: '12px',
          overflow: 'hidden',
          transform: `translateY(-${μ2_scrollTop}px)`,
          position: 'relative'
        }}>
          {μ2_generateLineNumbers()}
        </div>

        {/* μ2_ Code Editor Textarea */}
        <textarea
          ref={μ2_textareaRef}
          value={μ2_codeState.code}
          onChange={(e) => μ6_updateCodeContent(e.target.value)}
          onKeyDown={μ7_handleKeyDown}
          onScroll={μ7_handleScroll}
          readOnly={readOnly}
          placeholder={`// ${μ2_codeState.language === 'python' ? 'Python' : μ2_codeState.language} code here...
${μ2_codeState.language === 'python' ? 
`def μ1_example():
    """UniversalDesktop v2.1 Python Function"""
    return "UniversalDesktop v2.1"` :
`function μ1_example() {
  return "UniversalDesktop v2.1";
}`}`}
          style={{
            flex: 1,
            padding: '12px',
            border: 'none',
            outline: 'none',
            resize: 'none',
            fontFamily: 'Monaco, Consolas, "Courier New", monospace',
            fontSize: '14px',
            lineHeight: '1.5',
            backgroundColor: 'transparent',
            color: μ5_baguaTheme.textColor,
            tabSize: μ2_SUPPORTED_LANGUAGES.find(l => l.id === μ2_codeState.language)?.indentSize || 2
          }}
          spellCheck={false}
        />
      </div>

      {/* μ2_ Footer mit Keyboard Shortcuts & Language Info */}
      <div style={{
        padding: '6px 12px',
        backgroundColor: 'rgba(167, 139, 250, 0.05)',
        borderTop: `1px solid ${μ5_baguaTheme.borderColor}`,
        fontSize: '11px',
        color: '#6b7280',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <span>
          μ2 WIND (☴) - Code Editor v2.1 | {μ2_SUPPORTED_LANGUAGES.find(l => l.id === μ2_codeState.language)?.icon} {μ2_codeState.language}
        </span>
        <span>
          Shortcuts: Ctrl+S = Format | Ctrl+Shift+F = Format | Tab = {μ2_SUPPORTED_LANGUAGES.find(l => l.id === μ2_codeState.language)?.indentSize} spaces
        </span>
      </div>
    </div>
  );
};