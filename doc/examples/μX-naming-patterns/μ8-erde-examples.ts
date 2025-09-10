/**
 * μ8_ERDE (☷) - Global/Base Examples
 * ==================================
 * 
 * "Grundlegende Daten, das Fundament" - Raimund Welsch
 * 
 * ERDE represents the foundational aspect - global state, base data,
 * core components, fundamental systems, and the underlying foundation.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { UDFormat } from '../../core/UDFormat';

// ✅ CORRECT μ8_ Examples:

// Global State Management (Foundation data)
export const μ8_useGlobalCanvasState = () => {
    const [canvasBounds, setCanvasBounds] = useState<UDBounds>({
        minX: -8000, maxX: 8000,
        minY: -8000, maxY: 8000
    });
    
    const [globalItems, setGlobalItems] = useState<UDItem[]>([]);
    
    // μ8_ Fundamental canvas operations
    const μ8_updateCanvasBounds = useCallback((newBounds: UDBounds) => {
        // Base-level boundary management
        setCanvasBounds(prev => ({
            minX: Math.min(prev.minX, newBounds.minX),
            maxX: Math.max(prev.maxX, newBounds.maxX),
            minY: Math.min(prev.minY, newBounds.minY),
            maxY: Math.max(prev.maxY, newBounds.maxY)
        }));
    }, []);
    
    // μ8_ Global item management  
    const μ8_addGlobalItem = useCallback((item: UDItem) => {
        setGlobalItems(prev => [...prev, item]);
        μ8_updateCanvasBounds({
            minX: item.position.x,
            maxX: item.position.x + item.dimensions.width,
            minY: item.position.y,
            maxY: item.position.y + item.dimensions.height
        });
    }, [μ8_updateCanvasBounds]);
    
    return {
        canvasBounds,
        globalItems,
        μ8_updateCanvasBounds,
        μ8_addGlobalItem
    };
};

// Base Window Component (Foundation for all windows)
export const μ8_BaseWindow: React.FC<μ8_BaseWindowProps> = ({ 
    udItem, 
    children, 
    onUDItemChange,
    onAddToContext 
}) => {
    // μ8_ Base window functionality that all windows share
    const μ8_windowStyle = useMemo(() => ({
        position: 'absolute' as const,
        left: udItem.position.x,
        top: udItem.position.y,
        zIndex: udItem.position.z,
        width: udItem.dimensions.width,
        height: udItem.dimensions.height,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid rgba(0, 0, 0, 0.1)',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
    }), [udItem.position, udItem.dimensions]);
    
    // μ8_ Base transformation tracking
    const μ8_recordTransformation = useCallback((verb: string, description: string) => {
        const transformation = {
            id: `μ8_trans_${Date.now()}`,
            timestamp: Date.now(),
            verb,
            agent: 'user:human',
            description
        };
        
        const updatedItem = {
            ...udItem,
            transformation_history: [...udItem.transformation_history, transformation],
            updated_at: Date.now()
        };
        
        onUDItemChange?.(updatedItem, description);
    }, [udItem, onUDItemChange]);
    
    // μ8_ Base context management
    const μ8_handleContextPin = useCallback(() => {
        const shouldAdd = UDFormat.transistor(!udItem.is_contextual);
        if (shouldAdd) {
            onAddToContext?.(udItem);
            μ8_recordTransformation('contextualized', 'Added to AI context');
        }
    }, [udItem, onAddToContext, μ8_recordTransformation]);
    
    return (
        <div className="μ8-base-window" style={μ8_windowStyle}>
            <div className="μ8-window-header">
                <span className="μ8-window-title">{udItem.title}</span>
                <div className="μ8-window-controls">
                    <button 
                        className={`μ8-context-pin ${udItem.is_contextual ? 'active' : ''}`}
                        onClick={μ8_handleContextPin}
                        title="Pin to AI Context"
                    >
                        📌
                    </button>
                </div>
            </div>
            <div className="μ8-window-content">
                {children}
            </div>
        </div>
    );
};

// Global Data Management (Core persistence)
export const μ8_DataLayer = {
    // μ8_ Foundation data operations
    μ8_persistWorkspace: async (workspace: UniversalDocument): Promise<boolean> => {
        try {
            const μ8_snapshot = workspace.toWorkspaceSnapshot();
            const μ8_buffer = await μ8_serializeToBuffer(μ8_snapshot);
            
            // Try Supabase first, fallback to localStorage
            const μ8_supabaseSuccess = await μ8_saveToSupabase(μ8_buffer);
            if (!μ8_supabaseSuccess) {
                μ8_saveToLocalStorage(μ8_buffer);
            }
            
            return true;
        } catch (error) {
            console.error('μ8_DataLayer persistence failed:', error);
            return false;
        }
    },
    
    μ8_loadWorkspace: async (): Promise<UniversalDocument | null> => {
        try {
            // Try Supabase first, fallback to localStorage
            let μ8_buffer = await μ8_loadFromSupabase();
            if (!μ8_buffer) {
                μ8_buffer = μ8_loadFromLocalStorage();
            }
            
            if (μ8_buffer) {
                const μ8_snapshot = await μ8_deserializeFromBuffer(μ8_buffer);
                return UniversalDocument.fromWorkspaceSnapshot(μ8_snapshot);
            }
            
            return null;
        } catch (error) {
            console.error('μ8_DataLayer loading failed:', error);
            return null;
        }
    }
};

// Global Configuration (System foundations)
export const μ8_SystemConfig = {
    // μ8_ Core system settings
    CANVAS_BOUNDS: {
        DEFAULT_MIN_X: -8000,
        DEFAULT_MAX_X: 8000,
        DEFAULT_MIN_Y: -8000,
        DEFAULT_MAX_Y: 8000
    },
    
    Z_LAYERS: {
        BACKGROUND: 0,
        CONTENT: 10,
        PANELS: 20,
        CONTEXT_MENU: 30,
        MODAL: 40,
        SYSTEM: 50
    },
    
    AUTO_SAVE: {
        DEBOUNCE_MS: 2000,
        MAX_RETRIES: 3,
        BACKUP_INTERVAL_MS: 300000 // 5 minutes
    },
    
    BAGUA_COLORS: {
        [UDFormat.BAGUA.HIMMEL]: '#87CEEB',
        [UDFormat.BAGUA.WIND]:   '#98FB98',
        [UDFormat.BAGUA.WASSER]: '#4682B4',
        [UDFormat.BAGUA.BERG]:   '#8B4513',
        [UDFormat.BAGUA.SEE]:    '#20B2AA',
        [UDFormat.BAGUA.FEUER]:  '#FF6347',
        [UDFormat.BAGUA.DONNER]: '#FFD700',
        [UDFormat.BAGUA.ERDE]:   '#DEB887',
        [UDFormat.BAGUA.TAIJI]:  '#DDA0DD'
    }
};

// Desktop Item (Foundation component for all spatial items)
export const μ8_DesktopItem: React.FC<μ8_DesktopItemProps> = ({ 
    udItem, 
    onUDItemChange, 
    onAddToContext,
    children 
}) => {
    // μ8_ Base item state
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    
    // μ8_ Foundation positioning system
    const μ8_itemStyle = useMemo(() => ({
        position: 'absolute' as const,
        left: udItem.position.x,
        top: udItem.position.y,
        zIndex: udItem.position.z,
        width: udItem.dimensions.width,
        height: udItem.dimensions.height,
        transform: isDragging ? 'scale(1.02)' : 'scale(1)',
        transition: isDragging ? 'none' : 'transform 0.2s ease'
    }), [udItem.position, udItem.dimensions, isDragging]);
    
    // μ8_ Base interaction handling
    const μ8_handleDragStart = useCallback((e: React.MouseEvent) => {
        setIsDragging(true);
        // Base drag initiation
    }, []);
    
    const μ8_handleDragEnd = useCallback(() => {
        setIsDragging(false);
        // Base drag completion
    }, []);
    
    return (
        <div 
            className="μ8-desktop-item"
            style={μ8_itemStyle}
            onMouseDown={μ8_handleDragStart}
            onMouseUp={μ8_handleDragEnd}
        >
            {children}
        </div>
    );
};

// Global Error Boundary (System foundation)
export class μ8_SystemErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean; error: Error | null }
> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    
    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }
    
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // μ8_ System-level error logging
        console.error('μ8_SystemErrorBoundary caught error:', error, errorInfo);
        
        // μ8_ Report to global error tracking
        this.μ8_reportSystemError(error, errorInfo);
    }
    
    μ8_reportSystemError = (error: Error, errorInfo: React.ErrorInfo) => {
        // μ8_ Foundation error reporting
        const μ8_errorReport = {
            timestamp: Date.now(),
            error: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            bagua_level: 'μ8_ERDE_SYSTEM'
        };
        
        // Store in global error log
        localStorage.setItem(`μ8_error_${Date.now()}`, JSON.stringify(μ8_errorReport));
    };
    
    render() {
        if (this.state.hasError) {
            return (
                <div className="μ8-system-error">
                    <h2>🚨 μ8_ERDE System Error</h2>
                    <p>A foundation-level error occurred in the Bagua system.</p>
                    <details>
                        <summary>Error Details</summary>
                        <pre>{this.state.error?.stack}</pre>
                    </details>
                    <button onClick={() => this.setState({ hasError: false, error: null })}>
                        Reset μ8_System
                    </button>
                </div>
            );
        }
        
        return this.props.children;
    }
}

// ❌ WRONG Examples (what NOT to do):

// Missing μ prefix:
export const useGlobalCanvasState = () => {}; // ❌ No Bagua identification

// Wrong prefix for global/base functionality:
export const μ2_useGlobalState = () => {}; // ❌ μ2 is for UI, not global state
export const μ6_SystemConfig = {};        // ❌ μ6 is for functions, not config

// Specific functionality in global module:
export const μ8_handleClick = () => {};        // ❌ Event handling is μ7, not μ8
export const μ8_calculateLayout = () => {};    // ❌ Calculations are μ6, not μ8
export const μ8_renderWindow = () => {};       // ❌ Rendering is μ2, not μ8

// Temporary or specific logic in foundation:
export const μ8_handleAIResponse = () => {};   // ❌ Too specific, should be μ6
export const μ8_toolPanelLogic = () => {};     // ❌ Too specific, should be μ2

/**
 * Key μ8_ERDE Principles:
 * 
 * 1. **Foundation Layer**: Core systems that everything else builds on
 * 2. **Global State**: System-wide data and configuration
 * 3. **Base Components**: Fundamental building blocks for other components
 * 4. **System Infrastructure**: Error handling, persistence, core services
 * 5. **Polar Relationship**: Works with μ1_HIMMEL (templates/classes)
 * 
 * Use μ8_ for:
 * - Global state management (canvas bounds, system state)
 * - Base components (BaseWindow, DesktopItem, foundation elements)
 * - System configuration (constants, default values, system settings)
 * - Core data persistence (save/load, localStorage, fundamental data)
 * - Error boundaries and system-level error handling
 * - Infrastructure that other μX components depend on
 */

// Type definitions for examples
interface μ8_BaseWindowProps {
    udItem: UDItem;
    children: React.ReactNode;
    onUDItemChange?: (item: UDItem, description: string) => void;
    onAddToContext?: (item: UDItem) => void;
}

interface μ8_DesktopItemProps {
    udItem: UDItem;
    onUDItemChange?: (item: UDItem, description: string) => void;
    onAddToContext?: (item: UDItem) => void;
    children: React.ReactNode;
}

interface UDBounds {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
}

// Helper functions (μ8_ as they're foundation utilities)
const μ8_serializeToBuffer = async (snapshot: any): Promise<ArrayBuffer> => {
    // Foundation serialization
    return new TextEncoder().encode(JSON.stringify(snapshot)).buffer;
};

const μ8_deserializeFromBuffer = async (buffer: ArrayBuffer): Promise<any> => {
    // Foundation deserialization
    const text = new TextDecoder().decode(buffer);
    return JSON.parse(text);
};

const μ8_saveToSupabase = async (buffer: ArrayBuffer): Promise<boolean> => {
    // Foundation Supabase persistence
    try {
        // Supabase save logic here
        return true;
    } catch (error) {
        return false;
    }
};

const μ8_loadFromSupabase = async (): Promise<ArrayBuffer | null> => {
    // Foundation Supabase loading
    try {
        // Supabase load logic here
        return null;
    } catch (error) {
        return null;
    }
};

const μ8_saveToLocalStorage = (buffer: ArrayBuffer): void => {
    // Foundation localStorage persistence
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    localStorage.setItem('μ8_workspace', base64);
};

const μ8_loadFromLocalStorage = (): ArrayBuffer | null => {
    // Foundation localStorage loading
    const base64 = localStorage.getItem('μ8_workspace');
    if (!base64) return null;
    
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
};