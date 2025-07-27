import { useRef, useCallback, useEffect } from 'react';

interface ResizableItem {
  id: string;
  width?: number;
  height?: number;
}

interface CanvasState {
  position: { x: number; y: number; z: number };
  scale: number;
  velocity: { x: number; y: number; z: number };
  isDragging: boolean;
  momentum: { x: number; y: number };
}

export const μ7_useResizable = (
  id: string,
  onUpdate: (id: string, updates: Partial<ResizableItem>) => void,
  canvasState: CanvasState,
  minWidth: number = 200,
  minHeight: number = 150
) => {
  const isResizingRef = useRef(false);
  const resizeTypeRef = useRef<'se' | 's' | 'e' | null>(null);
  const startSizeRef = useRef({ width: 0, height: 0 });
  const startPosRef = useRef({ x: 0, y: 0 });
  const itemRef = useRef<HTMLDivElement>(null);

  const onResizeStart = useCallback((e: React.MouseEvent, type: 'se' | 's' | 'e') => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!itemRef.current) return;
    
    isResizingRef.current = true;
    resizeTypeRef.current = type;
    
    const rect = itemRef.current.getBoundingClientRect();
    startSizeRef.current = {
      width: rect.width,
      height: rect.height
    };
    startPosRef.current = {
      x: e.clientX,
      y: e.clientY
    };
    
    document.body.style.cursor = type === 'se' ? 'nw-resize' : 
                                  type === 's' ? 'ns-resize' : 
                                  'ew-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current || !resizeTypeRef.current) return;
      
      // FIXED: Use canvas-controller for consistent coordinate system
      const canvasController = document.querySelector('.canvas-controller') as HTMLElement;
      if (!canvasController) return;
      
      const canvasRect = canvasController.getBoundingClientRect();
      const scale = canvasState.scale;
      
      // Calculate current mouse position in canvas coordinates
      const currentMouseX = (e.clientX - canvasRect.left - canvasState.position.x) / scale;
      const currentMouseY = (e.clientY - canvasRect.top - canvasState.position.y) / scale;
      
      // Calculate start mouse position in canvas coordinates (convert from screen coordinates)
      const startMouseX = (startPosRef.current.x - canvasRect.left - canvasState.position.x) / scale;
      const startMouseY = (startPosRef.current.y - canvasRect.top - canvasState.position.y) / scale;
      
      // Calculate delta in canvas coordinates
      const deltaX = (currentMouseX - startMouseX) * scale;
      const deltaY = (currentMouseY - startMouseY) * scale;
      
      let newWidth = startSizeRef.current.width;
      let newHeight = startSizeRef.current.height;
      
      if (resizeTypeRef.current === 'se' || resizeTypeRef.current === 'e') {
        newWidth = Math.max(minWidth, startSizeRef.current.width + deltaX);
      }
      
      if (resizeTypeRef.current === 'se' || resizeTypeRef.current === 's') {
        newHeight = Math.max(minHeight, startSizeRef.current.height + deltaY);
      }
      
      onUpdate(id, { width: newWidth, height: newHeight });
    };

    const onMouseUp = () => {
      if (!isResizingRef.current) return;
      
      isResizingRef.current = false;
      resizeTypeRef.current = null;
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [id, onUpdate, minWidth, minHeight, canvasState.scale, canvasState.position.x, canvasState.position.y]);

  return { 
    ref: itemRef, 
    onResizeStart,
    isResizing: isResizingRef.current 
  };
};