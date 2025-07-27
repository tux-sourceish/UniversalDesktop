/**
 * μ2_WIND (☴) - Views/UI Examples  
 * ===============================
 * 
 * "Sichtbare Schnittstellen, sanft wie Wind" - Raimund Welsch
 * 
 * WIND represents the visual interface aspect - everything users see and interact with.
 * UI components, visual rendering, display logic, and user interface elements.
 */

import React, { useCallback, useMemo } from 'react';
import { UDFormat } from '../../core/UDFormat';

// ✅ CORRECT μ2_ Examples:

// Window Components (Visual interfaces)
export const μ2_NoteWindow: React.FC<μ2_WindowProps> = ({ udItem, onUDItemChange }) => {
    // μ2_ Visual rendering responsibility
    const μ2_renderContent = useMemo(() => {
        return udItem.content.text || "Enter your thoughts...";
    }, [udItem.content]);

    const μ2_windowStyle = useMemo(() => ({
        width: udItem.dimensions.width,
        height: udItem.dimensions.height,
        position: 'absolute' as const,
        left: udItem.position.x,
        top: udItem.position.y,
        zIndex: udItem.position.z
    }), [udItem.dimensions, udItem.position]);

    return (
        <div style={μ2_windowStyle} className="μ2-note-window">
            <div className="μ2-window-header">
                <span className="μ2-title">{udItem.title}</span>
                <button className="μ2-context-pin">📌</button>
            </div>
            <textarea 
                className="μ2-content-area"
                value={μ2_renderContent}
                onChange={(e) => onUDItemChange?.({
                    ...udItem,
                    content: { ...udItem.content, text: e.target.value }
                }, "Content updated")}
            />
        </div>
    );
};

// Panel Components (UI interfaces)
export const μ2_ToolPanel: React.FC<μ2_ToolPanelProps> = ({ onCreateUDItem, isVisible }) => {
    // μ2_ UI visibility control  
    const μ2_panelVisibility = UDFormat.transistor(isVisible);
    const μ2_panelOpacity = μ2_panelVisibility * 0.95 + 0.05;

    // μ2_ Visual tool rendering
    const μ2_renderTools = useMemo(() => {
        return TOOL_REGISTRY.map(tool => (
            <button 
                key={tool.id}
                className="μ2-tool-button"
                onClick={() => μ2_handleToolClick(tool)}
            >
                <span className="μ2-tool-icon">{tool.icon}</span>
                <span className="μ2-tool-label">{tool.displayName}</span>
            </button>
        ));
    }, []);

    const μ2_handleToolClick = useCallback((tool: ToolDefinition) => {
        const udItem = μ1_WindowFactory.createUDItem({
            type: tool.windowType,
            position: μ2_findSafePosition(),
            origin: 'human-tool'
        });
        onCreateUDItem?.(udItem);
    }, [onCreateUDItem]);

    // μ2_ UI layout and positioning
    const μ2_panelStyle = {
        opacity: μ2_panelOpacity,
        transform: `translateX(${μ2_panelVisibility * 0 - (1 - μ2_panelVisibility) * 300}px)`
    };

    return (
        <div className="μ2-tool-panel" style={μ2_panelStyle}>
            <div className="μ2-panel-header">
                <h3 className="μ2-panel-title">Tools</h3>
            </div>
            <div className="μ2-tools-grid">
                {μ2_renderTools}
            </div>
        </div>
    );
};

// Minimap UI Component
export const μ2_MinimapOverlay: React.FC<μ2_MinimapProps> = ({ items, viewport, onNavigate }) => {
    // μ2_ Visual representation of spatial data
    const μ2_renderItems = useMemo(() => {
        return items.map(item => {
            const μ2_itemColor = μ2_getBaguaColor(item.bagua_descriptor);
            const μ2_itemPosition = μ2_worldToMinimapCoords(item.position);
            
            return (
                <div 
                    key={item.id}
                    className="μ2-minimap-item"
                    style={{
                        left: μ2_itemPosition.x,
                        top: μ2_itemPosition.y,
                        backgroundColor: μ2_itemColor
                    }}
                    onClick={() => onNavigate?.(item.position)}
                />
            );
        });
    }, [items, onNavigate]);

    // μ2_ Viewport visualization
    const μ2_viewportStyle = {
        left: viewport.x * 0.2,
        top: viewport.y * 0.2,
        width: viewport.width * 0.2,
        height: viewport.height * 0.2
    };

    return (
        <div className="μ2-minimap-container">
            <svg className="μ2-minimap-background" viewBox="0 0 800 600">
                {μ2_renderItems}
                <rect 
                    className="μ2-viewport-indicator"
                    style={μ2_viewportStyle}
                />
            </svg>
        </div>
    );
};

// UI Helper Functions
export const μ2_getBaguaColor = (bagua: number): string => {
    // μ2_ Visual color mapping for Bagua types
    const colorMap = {
        [UDFormat.BAGUA.HIMMEL]: '#87CEEB',  // Sky blue
        [UDFormat.BAGUA.WIND]:   '#98FB98',  // Pale green  
        [UDFormat.BAGUA.WASSER]: '#4682B4',  // Steel blue
        [UDFormat.BAGUA.BERG]:   '#8B4513',  // Saddle brown
        [UDFormat.BAGUA.SEE]:    '#20B2AA',  // Light sea green
        [UDFormat.BAGUA.FEUER]:  '#FF6347',  // Tomato red
        [UDFormat.BAGUA.DONNER]: '#FFD700',  // Gold
        [UDFormat.BAGUA.ERDE]:   '#DEB887',  // Burlywood
        [UDFormat.BAGUA.TAIJI]:  '#DDA0DD'   // Plum
    };
    return colorMap[bagua] || '#CCCCCC';
};

export const μ2_worldToMinimapCoords = (worldPos: UDPosition): { x: number; y: number } => {
    // μ2_ Coordinate transformation for visual display
    return {
        x: (worldPos.x + 4000) * 0.1,  // Scale world coords to minimap
        y: (worldPos.y + 4000) * 0.1
    };
};

export const μ2_findSafePosition = (): UDPosition => {
    // μ2_ Visual collision avoidance for new windows
    const safeX = 100 + Math.random() * 200;
    const safeY = 100 + Math.random() * 200;
    return { x: safeX, y: safeY, z: 10 };
};

// ❌ WRONG Examples (what NOT to do):

// Missing μ prefix:
export const NoteWindow = () => {}; // ❌ No Bagua identification

// Wrong prefix for UI functionality:
export const μ6_NoteWindow = () => {}; // ❌ μ6 is for functions, not UI
export const μ1_ToolPanel = () => {};  // ❌ μ1 is for templates, not UI

// Backend logic in UI components:
export const μ2_calculateData = () => {}; // ❌ Calculation is μ6, not μ2
export const μ2_saveToDatabase = () => {}; // ❌ Persistence is μ8, not μ2

// Mixed responsibilities:
export const μ2_WindowWithDatabase = () => {
    // ❌ UI component shouldn't handle database directly
    const saveData = async () => { /* database logic */ };
    return <div>{/* UI */}</div>;
};

/**
 * Key μ2_WIND Principles:
 * 
 * 1. **Visual Interface**: Everything users see and interact with
 * 2. **Gentle Rendering**: Smooth, flowing UI like wind  
 * 3. **Display Logic**: How data appears visually
 * 4. **User Interaction**: Click handlers, input fields, buttons
 * 5. **Polar Relationship**: Works with μ7_DONNER (events/reactions)
 * 
 * Use μ2_ for:
 * - React components (Windows, Panels, Widgets)
 * - Visual rendering logic (renderX, displayY, showZ)
 * - UI state management (visibility, positioning, styling)
 * - Visual transformations (coordinate mapping, color schemes)
 * - Layout and positioning logic (panels, windows, overlays)
 */

// Type definitions for examples
interface μ2_WindowProps {
    udItem: UDItem;
    onUDItemChange?: (item: UDItem, description: string) => void;
}

interface μ2_ToolPanelProps {
    onCreateUDItem?: (item: UDItem) => void;
    isVisible: boolean;
}

interface μ2_MinimapProps {
    items: UDItem[];
    viewport: { x: number; y: number; width: number; height: number; };
    onNavigate?: (position: UDPosition) => void;
}