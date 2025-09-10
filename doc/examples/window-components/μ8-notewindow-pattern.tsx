/**
 * μ8_NoteWindow Implementation Pattern
 * ===================================
 * 
 * Complete example of how to implement a μX-Bagua window component
 * following UniversalDesktop v2.1 patterns with proper UDItem integration.
 * 
 * Based on: src/components/windows/μ8_NoteWindow.tsx
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { UDFormat } from '../../core/UDFormat';

// Types from the real implementation
interface UDItem {
    id: string;
    type: number;
    title: string;
    position: { x: number; y: number; z: number };
    dimensions: { width: number; height: number };
    bagua_descriptor: number;
    content: any;
    is_contextual: boolean;
    transformation_history: UDTransformation[];
    created_at: number;
    updated_at: number;
}

interface UDTransformation {
    id: string;
    timestamp: number;
    verb: string;
    agent: string;
    description: string;
}

interface μ8_NoteWindowProps {
    udItem: UDItem;
    onUDItemChange?: (updatedItem: UDItem, description: string) => void;
    onAddToContext?: (item: UDItem) => void;
    readOnly?: boolean;
}

// ✅ COMPLETE μ8_NoteWindow IMPLEMENTATION PATTERN
export const μ8_NoteWindow: React.FC<μ8_NoteWindowProps> = ({
    udItem,
    onUDItemChange,
    onAddToContext,
    readOnly = false
}) => {
    // μ8_ Base window state (ERDE - Foundation)
    const [localContent, setLocalContent] = useState(udItem.content?.text || '');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [lastSaveTime, setLastSaveTime] = useState<number | null>(null);

    // μ4_ Setup/Init (BERG - Solid initialization)
    const μ4_initializeWindow = useCallback(() => {
        setLocalContent(udItem.content?.text || '');
        setHasUnsavedChanges(false);
    }, [udItem.content?.text]);

    // μ5_ Properties (SEE - Reflecting attributes)
    const μ5_windowStyle = useMemo(() => ({
        position: 'absolute' as const,
        left: udItem.position.x,
        top: udItem.position.y,
        zIndex: udItem.position.z,
        width: udItem.dimensions.width,
        height: udItem.dimensions.height,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid rgba(0, 0, 0, 0.1)',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column'
    }), [udItem.position, udItem.dimensions]);

    const μ5_contentStyle = useMemo(() => ({
        flex: 1,
        padding: '12px',
        border: 'none',
        outline: 'none',
        resize: 'none' as const,
        backgroundColor: 'transparent',
        fontFamily: 'inherit',
        fontSize: '14px',
        lineHeight: '1.5'
    }), []);

    // μ6_ Functions (FEUER - Active processing)
    const μ6_saveContent = useCallback((newContent: string) => {
        if (onUDItemChange && newContent !== udItem.content?.text) {
            const μ6_transformation: UDTransformation = {
                id: `μ8_edit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                timestamp: Date.now(),
                verb: 'edited',
                agent: 'user:human',
                description: 'Content updated via text editing'
            };

            const μ6_updatedItem: UDItem = {
                ...udItem,
                content: { ...udItem.content, text: newContent },
                transformation_history: [...udItem.transformation_history, μ6_transformation],
                updated_at: Date.now()
            };

            onUDItemChange(μ6_updatedItem, 'Text content updated');
            setLastSaveTime(Date.now());
            setHasUnsavedChanges(false);
        }
    }, [udItem, onUDItemChange]);

    const μ6_handleContextAdd = useCallback(() => {
        if (onAddToContext) {
            const μ6_contextTransformation: UDTransformation = {
                id: `μ8_context_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                timestamp: Date.now(),
                verb: 'contextualized',
                agent: 'user:human',
                description: 'Added to AI context'
            };

            const μ6_contextualItem: UDItem = {
                ...udItem,
                is_contextual: true,
                transformation_history: [...udItem.transformation_history, μ6_contextTransformation],
                updated_at: Date.now()
            };

            onAddToContext(μ6_contextualItem);
            if (onUDItemChange) {
                onUDItemChange(μ6_contextualItem, 'Added to AI context');
            }
        }
    }, [udItem, onAddToContext, onUDItemChange]);

    // μ7_ Events (DONNER - Sudden reactions)
    const μ7_handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = e.target.value;
        setLocalContent(newContent);
        setHasUnsavedChanges(newContent !== udItem.content?.text);
    }, [udItem.content?.text]);

    const μ7_handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        // Ctrl+S to save
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            μ6_saveContent(localContent);
        }
    }, [localContent, μ6_saveContent]);

    // μ3_ Auto-save flow (WASSER - Flowing procedures)
    useEffect(() => {
        if (hasUnsavedChanges) {
            const μ3_saveTimer = setTimeout(() => {
                μ6_saveContent(localContent);
            }, 1500); // 1.5s debounce

            return () => clearTimeout(μ3_saveTimer);
        }
    }, [localContent, hasUnsavedChanges, μ6_saveContent]);

    // Initialize on udItem change
    useEffect(() => {
        μ4_initializeWindow();
    }, [μ4_initializeWindow]);

    // μ2_ UI Controls with Algebraic Transistors (WIND - Visual interface)
    const μ2_showSaveIndicator = UDFormat.transistor(hasUnsavedChanges);
    const μ2_showLastSaved = UDFormat.transistor(!hasUnsavedChanges && lastSaveTime !== null);
    const μ2_showContextButton = UDFormat.transistor(!!onAddToContext);
    const μ2_isReadOnly = UDFormat.transistor(readOnly);
    const μ2_isContextual = UDFormat.transistor(udItem.is_contextual);

    const μ2_headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 12px',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        backgroundColor: 'rgba(0, 0, 0, 0.02)'
    };

    const μ2_statusStyle = {
        fontSize: '12px',
        color: hasUnsavedChanges ? '#ff6b35' : '#28a745',
        opacity: 0.3 + 0.7 * (μ2_showSaveIndicator + μ2_showLastSaved)
    };

    const μ2_contextButtonStyle = {
        background: udItem.is_contextual ? '#28a745' : 'transparent',
        border: '1px solid #ddd',
        borderRadius: '4px',
        padding: '4px 8px',
        cursor: 'pointer',
        fontSize: '12px',
        opacity: 0.1 + 0.9 * μ2_showContextButton
    };

    // μ2_ Render (WIND - Visual interface)
    return (
        <div style={μ5_windowStyle} className="μ8-note-window">
            {/* Window Header */}
            <div style={μ2_headerStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 500, fontSize: '14px' }}>
                        {udItem.title}
                    </span>
                    <span style={μ2_statusStyle}>
                        {hasUnsavedChanges && '● Unsaved'}
                        {!hasUnsavedChanges && lastSaveTime && `✓ Saved ${new Date(lastSaveTime).toLocaleTimeString()}`}
                    </span>
                </div>
                
                <div style={{ display: 'flex', gap: '4px' }}>
                    {/* Context Pin Button */}
                    <button
                        style={μ2_contextButtonStyle}
                        onClick={μ7_handleKeyDown}
                        disabled={!onAddToContext}
                        title={udItem.is_contextual ? 'In AI Context' : 'Add to AI Context'}
                    >
                        📌
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <textarea
                style={μ5_contentStyle}
                value={localContent}
                onChange={μ7_handleContentChange}
                onKeyDown={μ7_handleKeyDown}
                placeholder="Enter your thoughts here..."
                readOnly={readOnly}
            />

            {/* Status Footer */}
            <div style={{
                padding: '4px 12px',
                fontSize: '11px',
                color: '#666',
                borderTop: '1px solid rgba(0, 0, 0, 0.05)',
                display: 'flex',
                justifyContent: 'space-between'
            }}>
                <span>
                    Bagua: {udItem.bagua_descriptor.toString(2).padStart(9, '0')} 
                    {udItem.is_contextual && ' • In Context'}
                </span>
                <span>
                    {localContent.length} chars • Ctrl+S to save
                </span>
            </div>
        </div>
    );
};

/**
 * Key μ8_NoteWindow Patterns:
 * 
 * 1. **μ8_ Base Foundation**: Core window functionality shared by all windows
 * 2. **μ4_ Initialization**: Setup patterns using useCallback for stable refs
 * 3. **μ5_ Properties**: Memoized styles and computed values
 * 4. **μ6_ Functions**: Active processing (save, transform, context management)
 * 5. **μ7_ Events**: User interaction handlers with proper event prevention
 * 6. **μ3_ Flow**: Auto-save debouncing and state synchronization
 * 7. **μ2_ UI**: Visual rendering with algebraic transistor visibility control
 * 
 * UDItem Integration:
 * - Complete transformation history tracking
 * - Proper bagua descriptor usage
 * - Context management integration
 * - Auto-save with change detection
 * - 3D spatial positioning
 * 
 * Algebraic Transistor Usage:
 * - Visibility control: UDFormat.transistor(condition)
 * - Opacity calculations: base + factor * transistor(condition)
 * - Feature enabling: opacity controlled by transistor results
 */

export default μ8_NoteWindow;