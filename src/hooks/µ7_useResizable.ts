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

export const µ7_useResizable = (
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
    
    // FIXED: Get actual CSS width/height, not scaled getBoundingClientRect
    const computedStyle = window.getComputedStyle(itemRef.current);
    const actualWidth = parseFloat(computedStyle.width) || itemRef.current.offsetWidth;
    const actualHeight = parseFloat(computedStyle.height) || itemRef.current.offsetHeight;
    
    startSizeRef.current = {
      width: actualWidth,
      height: actualHeight
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
      
      // FIXED: Simplified coordinate transformation - direct screen pixel delta
      const scale = canvasState.scale;
      
      // Calculate raw pixel delta from start position
      const deltaX = e.clientX - startPosRef.current.x;
      const deltaY = e.clientY - startPosRef.current.y;
      
      // Apply zoom compensation to delta (scale down the delta for high zoom)
      const scaledDeltaX = deltaX / scale;
      const scaledDeltaY = deltaY / scale;
      
      let newWidth = startSizeRef.current.width;
      let newHeight = startSizeRef.current.height;
      
      if (resizeTypeRef.current === 'se' || resizeTypeRef.current === 'e') {
        newWidth = Math.max(minWidth, startSizeRef.current.width + scaledDeltaX);
      }
      
      if (resizeTypeRef.current === 'se' || resizeTypeRef.current === 's') {
        newHeight = Math.max(minHeight, startSizeRef.current.height + scaledDeltaY);
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
  }, [id, onUpdate, minWidth, minHeight, canvasState.scale]);

  return { 
    ref: itemRef, 
    onResizeStart,
    isResizing: isResizingRef.current 
  };
};