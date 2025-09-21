import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UDItem } from '../../core/universalDocument';
import { UDFormat } from '../../core/UDFormat';

/**
 * µ2_TuiWindow - WIND (☴) Views/UI - Authentic Terminal User Interface
 * 
 * Vollständige µX-Bagua Integration mit historisch authentischen Terminal-Presets!
 * Von ZX Spectrum bis moderne Workstations - echte Terminal-Nostalgie mit V2 Power.
 * 
 * Features:
 * - UDItem-native Content Management
 * - Historische Terminal-Presets (ZX Spectrum, Apple II, C64, VT100, etc.)
 * - CodePage Support (Pure ASCII vs CP437)
 * - Bagua-Theme-System + Historical Themes
 * - Authentic Terminal Dimensions & Behavior
 * - Context Integration (📌 Button)
 * - Transformation History Tracking
 */

interface µ2_TuiWindowProps {
  /** Vollständiges UDItem mit allen Bagua-Metadaten */
  udItem: UDItem;
  /** Callback für UDItem Updates mit Transformation Tracking */
  onUDItemChange: (updatedItem: UDItem, transformationDescription: string) => void;
  /** Callback für Context Manager Integration (📌 Button) */
  onAddToContext?: (item: UDItem) => void;
  /** Read-only Modus */
  readOnly?: boolean;
  /** Force specific Terminal Preset */
  forcePreset?: string;
  /** Force specific Bagua theme */
  forceBaguaTheme?: string;
}

interface µ2_TerminalPreset {
  id: string;
  name: string;
  width: number;
  height: number;
  category: 'default' | 'classic' | 'modern' | 'social';
  description: string;
  historicalContext?: string;
  defaultTheme: string;
  codepage: 'ascii' | 'cp437';
  aspectRatio?: string;
}

interface µ2_TuiTheme {
  name: string;
  backgroundColor: string;
  textColor: string;
  cursorColor: string;
  selectionColor: string;
  borderColor: string;
  statusBarBg: string;
  statusBarText: string;
  symbol: string;
  historicalSystem?: string;
}

interface µ2_CursorPosition {
  row: number;
  col: number;
}

interface µ2_TuiState {
  content: string;
  cursorPosition: µ2_CursorPosition;
  theme: µ2_TuiTheme;
  preset: µ2_TerminalPreset;
  codepage: 'ascii' | 'cp437';
  lastModified: number;
  hasUnsavedChanges: boolean;
}

export const µ2_TuiWindow: React.FC<µ2_TuiWindowProps> = ({
  udItem,
  onUDItemChange,
  onAddToContext,
  readOnly = false,
  forcePreset,
  forceBaguaTheme
}) => {

  // µ2_ Historische Terminal-Presets (wie im Bild!)
  const µ2_terminalPresets: µ2_TerminalPreset[] = [
    // Default Presets
    { id: 'standard', name: 'Standard Console', width: 80, height: 25, category: 'default', description: 'Modern terminal standard', defaultTheme: 'green', codepage: 'ascii' },
    { id: 'small', name: 'Small Canvas', width: 40, height: 12, category: 'default', description: 'Compact display', defaultTheme: 'amber', codepage: 'ascii' },
    { id: 'large', name: 'Large Canvas', width: 120, height: 40, category: 'default', description: 'Extended workspace', defaultTheme: 'blue', codepage: 'ascii' },
    { id: 'banner', name: 'Banner Size', width: 160, height: 50, category: 'default', description: 'Ultra-wide display', defaultTheme: 'white', codepage: 'ascii' },
    { id: 'square', name: 'Square Canvas', width: 30, height: 30, category: 'default', description: 'Perfect square', defaultTheme: 'green', codepage: 'ascii', aspectRatio: '1:1' },
    
    // Classic Presets (AUTHENTISCH!)
    { id: 'zx-spectrum', name: 'Sinclair ZX Spectrum', width: 32, height: 24, category: 'classic', description: '1982 home computer', historicalContext: 'British 8-bit legend', defaultTheme: 'spectrum', codepage: 'ascii' },
    { id: 'apple2', name: 'Apple II', width: 40, height: 24, category: 'classic', description: '1977 personal computer', historicalContext: 'Dawn of personal computing', defaultTheme: 'apple2', codepage: 'ascii' },
    { id: 'c64', name: 'Commodore 64', width: 40, height: 25, category: 'classic', description: '1982 home computer', historicalContext: 'Best-selling computer model', defaultTheme: 'c64', codepage: 'cp437' },
    { id: 'trs80', name: 'TRS-80 Model', width: 64, height: 16, category: 'classic', description: '1977 microcomputer', historicalContext: 'Radio Shack computer', defaultTheme: 'trs80', codepage: 'ascii' },
    { id: 'vt100', name: 'VT100 Terminal', width: 80, height: 24, category: 'classic', description: '1978 video terminal', historicalContext: 'DEC terminal standard', defaultTheme: 'vt100', codepage: 'ascii' },
    { id: 'msdos', name: 'MS-DOS', width: 80, height: 25, category: 'classic', description: '1981 operating system', historicalContext: 'PC-DOS era', defaultTheme: 'msdos', codepage: 'cp437' },
    
    // Modern Systems
    { id: 'ibm3270', name: 'IBM 3270 Terminal', width: 80, height: 32, category: 'modern', description: '1971 mainframe terminal', historicalContext: 'Mainframe computing', defaultTheme: 'ibm3270', codepage: 'ascii' },
    { id: 'amiga', name: 'Amiga Workbench', width: 80, height: 50, category: 'modern', description: '1985 workstation', historicalContext: 'Multimedia pioneer', defaultTheme: 'amiga', codepage: 'ascii' },
    { id: 'next', name: 'NeXT Computer', width: 112, height: 31, category: 'modern', description: '1988 workstation', historicalContext: 'Steve Jobs\' next venture', defaultTheme: 'next', codepage: 'ascii' },
    { id: 'sun', name: 'Sun Workstation', width: 115, height: 34, category: 'modern', description: '1982 workstation', historicalContext: 'Unix workstation era', defaultTheme: 'sun', codepage: 'ascii' },
    { id: 'vt100-wide', name: 'VT100 Wide', width: 132, height: 24, category: 'modern', description: 'Extended VT100', historicalContext: 'Wide terminal mode', defaultTheme: 'vt100', codepage: 'ascii' }
  ];

  // µ2_ Historische Terminal-Themes (AUTHENTISCH!)
  const µ2_terminalThemes: Record<string, µ2_TuiTheme> = {
    // Bagua Themes (V2)
    green: { name: 'Classic Green', backgroundColor: '#001100', textColor: '#00ff00', cursorColor: '#00ff00', selectionColor: 'rgba(0, 255, 0, 0.3)', borderColor: '#00aa00', statusBarBg: '#003300', statusBarText: '#00ff00', symbol: '🟢' },
    amber: { name: 'Amber Terminal', backgroundColor: '#2a1500', textColor: '#ffb000', cursorColor: '#ffb000', selectionColor: 'rgba(255, 176, 0, 0.3)', borderColor: '#cc8800', statusBarBg: '#442200', statusBarText: '#ffb000', symbol: '🟡' },
    white: { name: 'Paper Terminal', backgroundColor: '#fefefe', textColor: '#2a2a2a', cursorColor: '#2a2a2a', selectionColor: 'rgba(42, 42, 42, 0.2)', borderColor: '#dddddd', statusBarBg: '#f0f0f0', statusBarText: '#2a2a2a', symbol: '⚪' },
    blue: { name: 'Digital Ocean', backgroundColor: '#001122', textColor: '#00aaff', cursorColor: '#00aaff', selectionColor: 'rgba(0, 170, 255, 0.3)', borderColor: '#0077cc', statusBarBg: '#002244', statusBarText: '#00aaff', symbol: '🔵' },
    fire: { name: 'FEUER ☲', backgroundColor: '#2a0505', textColor: '#ff4444', cursorColor: '#ff6666', selectionColor: 'rgba(255, 68, 68, 0.3)', borderColor: '#cc2222', statusBarBg: '#441111', statusBarText: '#ff4444', symbol: '☲' },
    water: { name: 'WASSER ☵', backgroundColor: '#050a2a', textColor: '#4488ff', cursorColor: '#66aaff', selectionColor: 'rgba(68, 136, 255, 0.3)', borderColor: '#2266cc', statusBarBg: '#112244', statusBarText: '#4488ff', symbol: '☵' },
    
    // Historical Themes (AUTHENTIC!)
    spectrum: { name: 'ZX Spectrum', backgroundColor: '#000000', textColor: '#ffffff', cursorColor: '#ffffff', selectionColor: 'rgba(255, 255, 255, 0.3)', borderColor: '#666666', statusBarBg: '#333333', statusBarText: '#ffffff', symbol: '🌈', historicalSystem: 'Sinclair ZX Spectrum' },
    apple2: { name: 'Apple II', backgroundColor: '#000000', textColor: '#00ff00', cursorColor: '#00ff00', selectionColor: 'rgba(0, 255, 0, 0.3)', borderColor: '#00aa00', statusBarBg: '#001100', statusBarText: '#00ff00', symbol: '🍎', historicalSystem: 'Apple II' },
    c64: { name: 'Commodore 64', backgroundColor: '#4040aa', textColor: '#a0a0ff', cursorColor: '#ffffff', selectionColor: 'rgba(160, 160, 255, 0.3)', borderColor: '#8080cc', statusBarBg: '#2020aa', statusBarText: '#a0a0ff', symbol: '💙', historicalSystem: 'Commodore 64' },
    trs80: { name: 'TRS-80', backgroundColor: '#000000', textColor: '#c0c0c0', cursorColor: '#ffffff', selectionColor: 'rgba(192, 192, 192, 0.3)', borderColor: '#808080', statusBarBg: '#202020', statusBarText: '#c0c0c0', symbol: '📻', historicalSystem: 'TRS-80' },
    vt100: { name: 'DEC VT100', backgroundColor: '#001100', textColor: '#00dd00', cursorColor: '#00ff00', selectionColor: 'rgba(0, 221, 0, 0.3)', borderColor: '#00aa00', statusBarBg: '#002200', statusBarText: '#00dd00', symbol: '📟', historicalSystem: 'DEC VT100' },
    msdos: { name: 'MS-DOS', backgroundColor: '#000080', textColor: '#c0c0c0', cursorColor: '#ffffff', selectionColor: 'rgba(192, 192, 192, 0.3)', borderColor: '#4040aa', statusBarBg: '#000040', statusBarText: '#c0c0c0', symbol: '💽', historicalSystem: 'MS-DOS' },
    ibm3270: { name: 'IBM 3270', backgroundColor: '#000000', textColor: '#00ff00', cursorColor: '#ffffff', selectionColor: 'rgba(0, 255, 0, 0.3)', borderColor: '#00aa00', statusBarBg: '#001100', statusBarText: '#00ff00', symbol: '🏢', historicalSystem: 'IBM 3270' },
    amiga: { name: 'Amiga Workbench', backgroundColor: '#0055aa', textColor: '#ffffff', cursorColor: '#ffff00', selectionColor: 'rgba(255, 255, 255, 0.3)', borderColor: '#0077cc', statusBarBg: '#004488', statusBarText: '#ffffff', symbol: '⚡', historicalSystem: 'Amiga' },
    next: { name: 'NeXT Computer', backgroundColor: '#202020', textColor: '#ffffff', cursorColor: '#ffff00', selectionColor: 'rgba(255, 255, 255, 0.3)', borderColor: '#666666', statusBarBg: '#101010', statusBarText: '#ffffff', symbol: '⬛', historicalSystem: 'NeXT' },
    sun: { name: 'Sun Workstation', backgroundColor: '#000040', textColor: '#ffff80', cursorColor: '#ffffff', selectionColor: 'rgba(255, 255, 128, 0.3)', borderColor: '#0000aa', statusBarBg: '#000020', statusBarText: '#ffff80', symbol: '☀️', historicalSystem: 'Sun' }
  };

  const [µ2_tuiState, setµ2_TuiState] = useState<µ2_TuiState>({
    content: '',
    cursorPosition: { row: 1, col: 1 },
    theme: µ2_terminalThemes.green,
    preset: µ2_terminalPresets[0],
    codepage: 'ascii',
    lastModified: Date.now(),
    hasUnsavedChanges: false
  });

  const [µ2_isInContext, setµ2_IsInContext] = useState(udItem.is_contextual || false);
  const [µ2_showPresetSelector, setµ2_ShowPresetSelector] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // µ2_ Initialize TUI State from UDItem (Smart Update - Avoids Theme Reset Loop)
  useEffect(() => {
    // Extract content
    const contentText = typeof udItem.content === 'string' 
      ? udItem.content 
      : udItem.content?.text || udItem.content?.tui_content || '';

    // Determine preset
    let selectedPreset = µ2_terminalPresets[0];
    if (forcePreset) {
      selectedPreset = µ2_terminalPresets.find(p => p.id === forcePreset) || selectedPreset;
    } else if (udItem.content?.tui_preset) {
      selectedPreset = µ2_terminalPresets.find(p => p.id === udItem.content.tui_preset) || selectedPreset;
    } else {
      // Auto-detect from dimensions
      const width = udItem.content?.tui_width || 80;
      const height = udItem.content?.tui_height || 25;
      const matchingPreset = µ2_terminalPresets.find(p => p.width === width && p.height === height);
      if (matchingPreset) selectedPreset = matchingPreset;
    }

    // Determine theme (SMART: Don't override if user just changed it)
    let selectedTheme = µ2_terminalThemes[selectedPreset.defaultTheme] || µ2_terminalThemes.green;
    if (forceBaguaTheme) {
      selectedTheme = µ2_terminalThemes[forceBaguaTheme] || selectedTheme;
    } else if (udItem.content?.tui_theme) {
      selectedTheme = µ2_terminalThemes[udItem.content.tui_theme] || selectedTheme;
    } else {
      // Auto-detect from Bagua descriptor
      const descriptor = udItem.bagua_descriptor;
      if (descriptor & UDFormat.BAGUA.FEUER) selectedTheme = µ2_terminalThemes.fire;
      else if (descriptor & UDFormat.BAGUA.WASSER) selectedTheme = µ2_terminalThemes.water;
      else if (descriptor & UDFormat.BAGUA.WIND) selectedTheme = µ2_terminalThemes.blue;
      else if (descriptor & UDFormat.BAGUA.ERDE) selectedTheme = µ2_terminalThemes.green;
    }

    // Determine codepage
    const codepage = udItem.content?.tui_codepage || selectedPreset.codepage;

    // SMART UPDATE: Only update if actually different (prevents reset loops)
    setµ2_TuiState(prev => {
      const shouldUpdateContent = prev.content !== contentText;
      const shouldUpdatePreset = prev.preset.id !== selectedPreset.id;
      const shouldUpdateTheme = prev.theme !== selectedTheme && !prev.hasUnsavedChanges;
      const shouldUpdateCodepage = prev.codepage !== codepage;
      
      if (shouldUpdateContent || shouldUpdatePreset || shouldUpdateTheme || shouldUpdateCodepage) {
        return {
          ...prev,
          content: contentText,
          preset: selectedPreset,
          theme: shouldUpdateTheme ? selectedTheme : prev.theme, // Preserve user's theme choice
          codepage: codepage,
          lastModified: udItem.updated_at
        };
      }
      return prev;
    });

    setµ2_IsInContext(udItem.is_contextual || false);
  }, [udItem, forcePreset, forceBaguaTheme]);

  // µ2_ Format Content for Terminal Display (AUTHENTIC!)
  const µ2_formatTerminalContent = useCallback((text: string): string => {
    const { width, height } = µ2_tuiState.preset;
    const lines = text.split('\n');
    const formattedLines = lines.slice(0, height).map(line => {
      if (line.length > width) {
        return line.substring(0, width);
      }
      return line.padEnd(width, ' ');
    });
    
    // Fill remaining lines with spaces (authentic terminal behavior)
    while (formattedLines.length < height) {
      formattedLines.push(' '.repeat(width));
    }
    
    return formattedLines.join('\n');
  }, [µ2_tuiState.preset]);

  // µ2_ Update Cursor Position
  const µ2_updateCursorPosition = useCallback((textarea: HTMLTextAreaElement) => {
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = textarea.value.substring(0, cursorPos);
    const lines = textBeforeCursor.split('\n');
    const row = lines.length;
    const col = lines[lines.length - 1].length + 1;
    
    setµ2_TuiState(prev => ({
      ...prev,
      cursorPosition: { row, col }
    }));
  }, []);

  // µ2_ Content Change Handler with UDItem Integration (OPTIMIZED)
  const µ2_handleContentChange = useCallback((newContent: string) => {
    if (readOnly) return;

    // Use algebraic transistor for state update
    const µ2_shouldUpdate = UDFormat.transistor(newContent !== µ2_tuiState.content);
    
    setµ2_TuiState(prev => ({
      ...prev,
      content: newContent,
      lastModified: Date.now() * µ2_shouldUpdate,
      hasUnsavedChanges: µ2_shouldUpdate === 1
    }));

    // Auto-save with 2s debounce (only if content changed)
    if (µ2_shouldUpdate === 1) {
      const saveTimeout = setTimeout(() => {
        const updatedContent = {
          text: newContent,
          tui_content: newContent,
          tui_preset: µ2_tuiState.preset.id,
          tui_width: µ2_tuiState.preset.width,
          tui_height: µ2_tuiState.preset.height,
          tui_theme: Object.keys(µ2_terminalThemes).find(key => 
            µ2_terminalThemes[key] === µ2_tuiState.theme
          ) || 'green',
          tui_codepage: µ2_tuiState.codepage
        };

        onUDItemChange({
          ...udItem,
          content: updatedContent,
          updated_at: Date.now()
        }, `TUI ${µ2_tuiState.preset.name} bearbeitet: ${newContent.length} Zeichen`);

        setµ2_TuiState(prev => ({ ...prev, hasUnsavedChanges: false }));
      }, 2000);

      return () => clearTimeout(saveTimeout);
    }
  }, [udItem, onUDItemChange, readOnly, µ2_tuiState.preset, µ2_tuiState.theme, µ2_tuiState.codepage, µ2_tuiState.content]);

  // µ2_ Preset Change Handler
  const µ2_changePreset = useCallback((presetId: string) => {
    if (readOnly) return;
    
    const newPreset = µ2_terminalPresets.find(p => p.id === presetId);
    if (!newPreset) return;

    const newTheme = µ2_terminalThemes[newPreset.defaultTheme] || µ2_tuiState.theme;

    setµ2_TuiState(prev => ({
      ...prev,
      preset: newPreset,
      theme: newTheme,
      codepage: newPreset.codepage,
      hasUnsavedChanges: true
    }));

    setµ2_ShowPresetSelector(false);

    // Update UDItem immediately for preset changes
    const updatedContent = {
      ...udItem.content,
      tui_preset: presetId,
      tui_width: newPreset.width,
      tui_height: newPreset.height,
      tui_theme: Object.keys(µ2_terminalThemes).find(key => µ2_terminalThemes[key] === newTheme),
      tui_codepage: newPreset.codepage
    };

    onUDItemChange({
      ...udItem,
      content: updatedContent
    }, `Terminal-Preset gewechselt zu: ${newPreset.name} (${newPreset.width}x${newPreset.height})`);
  }, [udItem, onUDItemChange, readOnly, µ2_tuiState.theme]);

  // µ2_ Theme Change Handler
  const µ2_changeTheme = useCallback((themeKey: string) => {
    if (readOnly) return;
    
    const newTheme = µ2_terminalThemes[themeKey];
    if (!newTheme) return;

    setµ2_TuiState(prev => ({
      ...prev,
      theme: newTheme,
      hasUnsavedChanges: true
    }));

    const updatedContent = {
      ...udItem.content,
      tui_theme: themeKey
    };

    onUDItemChange({
      ...udItem,
      content: updatedContent
    }, `Terminal-Theme gewechselt zu: ${newTheme.name}`);
  }, [udItem, onUDItemChange, readOnly]);

  // µ2_ Context Toggle  
  const µ2_toggleContext = useCallback(() => {
    if (!onAddToContext) return;

    const wasInContext = µ2_isInContext;
    setµ2_IsInContext(!wasInContext);
    
    onUDItemChange({
      ...udItem,
      is_contextual: !wasInContext
    }, !wasInContext 
      ? `${µ2_tuiState.preset.name} TUI zum AI-Context hinzugefügt` 
      : `${µ2_tuiState.preset.name} TUI aus AI-Context entfernt`
    );

    if (!wasInContext) {
      onAddToContext({
        ...udItem,
        is_contextual: true
      });
    }
  }, [µ2_isInContext, udItem, onUDItemChange, onAddToContext, µ2_tuiState.preset]);

  // µ2_ Special Key Handling (Terminal-specific)
  const µ2_handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (readOnly) return;

    // Handle Tab key (4 spaces for ASCII, special chars for CP437)
    if (event.key === 'Tab') {
      event.preventDefault();
      const textarea = event.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const tabChar = µ2_tuiState.codepage === 'cp437' ? '────' : '    ';
      const newContent = µ2_tuiState.content.substring(0, start) + tabChar + µ2_tuiState.content.substring(end);
      
      µ2_handleContentChange(newContent);
      
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + tabChar.length;
        µ2_updateCursorPosition(textarea);
      }, 0);
    }
  }, [µ2_tuiState.content, µ2_tuiState.codepage, µ2_handleContentChange, µ2_updateCursorPosition, readOnly]);

  // µ2_ Get Bagua Info
  const µ2_getBaguaInfo = useCallback((): string => {
    const descriptor = udItem.bagua_descriptor;
    const symbols: string[] = [];
    
    if (descriptor & UDFormat.BAGUA.HIMMEL) symbols.push('☰');
    if (descriptor & UDFormat.BAGUA.WIND) symbols.push('☴'); // Main für TUI
    if (descriptor & UDFormat.BAGUA.WASSER) symbols.push('☵');
    if (descriptor & UDFormat.BAGUA.BERG) symbols.push('☶');
    if (descriptor & UDFormat.BAGUA.SEE) symbols.push('☱');
    if (descriptor & UDFormat.BAGUA.FEUER) symbols.push('☲');
    if (descriptor & UDFormat.BAGUA.DONNER) symbols.push('☳');
    if (descriptor & UDFormat.BAGUA.ERDE) symbols.push('☷');
    if (descriptor & UDFormat.BAGUA.TAIJI) symbols.push('☯');
    
    return symbols.join('') || '☴'; // WIND als Default für µ2
  }, [udItem.bagua_descriptor]);

  // Raimunds algebraischer Transistor
  const µ2_showContextButton = UDFormat.transistor(!!onAddToContext);
  const µ2_isEditable = UDFormat.transistor(!readOnly);

  // µ2_ Terminal Display Content
  const µ2_displayContent = µ2_formatTerminalContent(µ2_tuiState.content);

  // µ2_ Window Styling
  const µ2_windowStyle: React.CSSProperties = {
    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
    backgroundColor: µ2_tuiState.theme.backgroundColor,
    border: `2px solid ${µ2_isInContext ? '#ef4444' : µ2_tuiState.theme.borderColor}`,
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: µ2_isInContext 
      ? '0 4px 20px rgba(239, 68, 68, 0.15)' 
      : `0 4px 12px ${µ2_tuiState.theme.backgroundColor}33`,
    position: 'relative',
    width: '100%',
    height: '100%',
    minWidth: '300px',
    minHeight: '200px',
    display: 'flex',
    flexDirection: 'column'
  };

  return (
    <div className={`µ2-tui-window µ2-preset-${µ2_tuiState.preset.id}`} style={µ2_windowStyle}>
      
      {/* µ2_ Terminal Header */}
      <div className="µ2-tui-header" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '4px 8px',
        backgroundColor: µ2_tuiState.theme.statusBarBg,
        borderBottom: `1px solid ${µ2_tuiState.theme.borderColor}55`,
        fontSize: '11px',
        color: µ2_tuiState.theme.statusBarText
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>{µ2_tuiState.theme.symbol}</span>
          <span style={{ fontWeight: '600' }}>{µ2_tuiState.preset.name}</span>
          <span style={{ opacity: 0.8 }}>
            {µ2_tuiState.preset.width}×{µ2_tuiState.preset.height}
          </span>
          {µ2_tuiState.preset.historicalContext && (
            <span style={{ opacity: 0.6, fontSize: '10px' }}>
              ({µ2_tuiState.preset.historicalContext})
            </span>
          )}
        </div>
        
        {µ2_isEditable === 1 && (
          <button
            onClick={() => setµ2_ShowPresetSelector(!µ2_showPresetSelector)}
            style={{
              background: 'none',
              border: `1px solid ${µ2_tuiState.theme.textColor}55`,
              color: µ2_tuiState.theme.textColor,
              borderRadius: '2px',
              cursor: 'pointer',
              fontSize: '10px',
              padding: '2px 4px'
            }}
          >
            ⚙️ Preset
          </button>
        )}
      </div>

      {/* µ2_ Preset Selector (Dropdown) */}
      {µ2_showPresetSelector && (
        <div className="µ2-preset-selector" style={{
          position: 'absolute',
          top: '100%',
          left: '0',
          right: '0',
          maxHeight: '300px',
          overflowY: 'auto',
          backgroundColor: µ2_tuiState.theme.backgroundColor,
          border: `2px solid ${µ2_tuiState.theme.borderColor}`,
          borderTop: 'none',
          zIndex: 1000,
          fontSize: '12px'
        }}>
          {['default', 'classic', 'modern'].map(category => (
            <div key={category}>
              <div style={{
                padding: '6px 8px',
                backgroundColor: µ2_tuiState.theme.statusBarBg,
                color: µ2_tuiState.theme.statusBarText,
                fontWeight: '600',
                textTransform: 'uppercase',
                fontSize: '10px'
              }}>
                {category} Presets
              </div>
              {µ2_terminalPresets.filter(p => p.category === category).map(preset => (
                <div
                  key={preset.id}
                  onClick={() => µ2_changePreset(preset.id)}
                  style={{
                    padding: '6px 12px',
                    cursor: 'pointer',
                    backgroundColor: preset.id === µ2_tuiState.preset.id 
                      ? µ2_tuiState.theme.selectionColor 
                      : 'transparent',
                    color: µ2_tuiState.theme.textColor,
                    borderBottom: `1px solid ${µ2_tuiState.theme.borderColor}22`
                  }}
                >
                  <div style={{ fontWeight: '500' }}>{preset.name}</div>
                  <div style={{ fontSize: '10px', opacity: 0.8 }}>
                    {preset.width}×{preset.height} • {preset.codepage.toUpperCase()}
                    {preset.historicalContext && ` • ${preset.historicalContext}`}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* µ2_ Terminal Screen */}
      <div className="µ2-tui-screen" style={{
        position: 'relative',
        backgroundColor: µ2_tuiState.theme.backgroundColor
      }}>
        <textarea
          ref={textareaRef}
          className="µ2-tui-textarea"
          value={µ2_displayContent}
          onChange={(e) => µ2_handleContentChange(e.target.value)}
          onKeyDown={µ2_handleKeyDown}
          onClick={(e) => µ2_updateCursorPosition(e.currentTarget)}
          readOnly={readOnly}
          spellCheck={false}
          wrap="off"
          rows={µ2_tuiState.preset.height}
          cols={µ2_tuiState.preset.width}
          style={{
            width: `${µ2_tuiState.preset.width * 0.6}em`,
            height: `${µ2_tuiState.preset.height * 1.2}em`,
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            color: µ2_tuiState.theme.textColor,
            fontSize: '14px',
            lineHeight: '1.2',
            padding: '8px',
            resize: 'none',
            fontFamily: 'inherit',
            caretColor: µ2_tuiState.theme.cursorColor
          }}
        />

        {/* Unsaved Changes Indicator */}
        {µ2_tuiState.hasUnsavedChanges && (
          <div style={{
            position: 'absolute',
            top: '4px',
            right: '8px',
            padding: '2px 6px',
            backgroundColor: '#f59e0b',
            color: 'white',
            fontSize: '10px',
            borderRadius: '4px',
            fontWeight: '500'
          }}>
            *
          </div>
        )}
      </div>

      {/* µ2_ Status Bar */}
      <div className="µ2-tui-status-bar" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '4px 8px',
        backgroundColor: µ2_tuiState.theme.statusBarBg,
        color: µ2_tuiState.theme.statusBarText,
        fontSize: '11px',
        fontWeight: '500',
        borderTop: `1px solid ${µ2_tuiState.theme.borderColor}55`
      }}>
        
        {/* Left: Mode & CodePage */}
        <div className="µ2-status-left" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>{readOnly ? 'VIEW' : 'EDIT'}</span>
          <span style={{ opacity: 0.8 }}>{µ2_tuiState.codepage.toUpperCase()}</span>
          
          {/* Theme Selector - All Available Themes */}
          {µ2_isEditable === 1 && (
            <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap' }}>
              {Object.entries(µ2_terminalThemes).map(([key, theme]) => {
                const isActive = µ2_tuiState.theme === theme;
                return (
                  <button
                    key={key}
                    onClick={() => µ2_changeTheme(key)}
                    title={`${theme.name}${theme.historicalSystem ? ` (${theme.historicalSystem})` : ''}`}
                    style={{
                      background: isActive ? theme.backgroundColor : 'none',
                      color: isActive ? theme.textColor : µ2_tuiState.theme.textColor,
                      border: isActive ? `1px solid ${theme.textColor}` : '1px solid transparent',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '10px',
                      padding: '2px 4px',
                      transition: 'all 0.2s ease',
                      minWidth: '20px'
                    }}
                  >
                    {theme.symbol}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Center: Bagua & System Info */}
        <div className="µ2-status-center" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '10px'
        }}>
          <span title="Bagua Descriptor">{µ2_getBaguaInfo()}</span>
          {µ2_tuiState.theme.historicalSystem && (
            <span title="Historical System" style={{ opacity: 0.7 }}>
              {µ2_tuiState.theme.historicalSystem}
            </span>
          )}
          {µ2_isInContext && (
            <span title="In AI Context" style={{ color: '#ef4444' }}>📌</span>
          )}
        </div>

        {/* Right: Cursor & Actions */}
        <div className="µ2-status-right" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          
          {/* Context Button */}
          {µ2_showContextButton === 1 && (
            <button
              onClick={µ2_toggleContext}
              title={µ2_isInContext ? 'Aus AI-Context entfernen' : 'Zum AI-Context hinzufügen'}
              style={{
                background: µ2_isInContext ? '#ef4444' : 'none',
                border: `1px solid ${µ2_isInContext ? '#ef4444' : µ2_tuiState.theme.textColor}55`,
                color: µ2_isInContext ? 'white' : µ2_tuiState.theme.textColor,
                borderRadius: '2px',
                cursor: 'pointer',
                fontSize: '9px',
                padding: '1px 3px'
              }}
            >
              📌
            </button>
          )}

          {/* Copy Button */}
          <button 
            onClick={() => navigator.clipboard.writeText(µ2_tuiState.content)}
            title="Copy Terminal Content"
            style={{
              background: 'none',
              border: `1px solid ${µ2_tuiState.theme.textColor}55`,
              color: µ2_tuiState.theme.textColor,
              borderRadius: '2px',
              cursor: 'pointer',
              fontSize: '9px',
              padding: '1px 3px'
            }}
          >
            📋
          </button>

          {/* Cursor Position */}
          <span style={{ fontSize: '10px' }}>
            {µ2_tuiState.cursorPosition.row}:{µ2_tuiState.cursorPosition.col}
          </span>
        </div>

      </div>

    </div>
  );
};

export default µ2_TuiWindow;