import { useRef, useCallback, useEffect } from 'react';

interface Position {
  x: number;
  y: number;
  z: number;
}

interface CanvasState {
  position: Position;
  scale: number;
  velocity: Position;
  isDragging: boolean;
  momentum: { x: number; y: number };
}

interface DraggableItem {
  id: string;
  position: Position;
  width?: number;
  height?: number;
}

export const μ7_useDraggable = (
  id: string, 
  onUpdate: (id: string, updates: Partial<DraggableItem>) => void,
  canvasState: CanvasState
) => {
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const itemRef = useRef<HTMLDivElement>(null);

  const onMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Nur bei Klick auf Header-Bereich, nicht auf Buttons oder Inhalte
    const target = e.target as HTMLElement;
    if (!itemRef.current || 
        target.tagName === 'BUTTON' || 
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' ||
        target.closest('.item-controls') ||
        target.closest('.item-content')) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    
    isDraggingRef.current = true;
    const rect = itemRef.current.getBoundingClientRect();
    dragOffsetRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
    
    // Fenster nach vorne bringen
    if (itemRef.current) {
      itemRef.current.style.zIndex = '1000';
    }
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !itemRef.current) return;
      
      // FIXED: Use canvas-controller (parent) instead of transformed canvas-content
      const canvasController = document.querySelector('.canvas-controller') as HTMLElement;
      if (!canvasController) return;
      
      const canvasRect = canvasController.getBoundingClientRect();
      
      // Use current canvas state (scale, position) directly
      const scale = canvasState.scale;
      const translateX = canvasState.position.x;
      const translateY = canvasState.position.y;
      
      // Calculate mouse position relative to canvas controller (not transformed content)
      const mouseX = e.clientX - canvasRect.left;
      const mouseY = e.clientY - canvasRect.top;
      
      // FIXED: Apply correct inverse transform to get canvas coordinates
      // CSS transform is: translate(x, y) scale(s), so inverse is: (screen - translate) / scale
      // When CSS translates canvas +X (right), mouse coordinates need to subtract that offset
      const canvasX = (mouseX - translateX) / scale;
      const canvasY = (mouseY - translateY) / scale;
      
      // Calculate new position with drag offset (also scale drag offset)
      const newX = canvasX - (dragOffsetRef.current.x / scale);
      const newY = canvasY - (dragOffsetRef.current.y / scale);
      
      // DEBUG: Log drag calculation
      // console.log('🪟 Window Drag:', {
      //   id,
      //   mouseX, mouseY, 
      //   canvasX, canvasY,
      //   newX, newY,
      //   scale, translateX, translateY,
      //   dragOffset: dragOffsetRef.current,
      //   canvasRect: { left: canvasRect.left, top: canvasRect.top },
      //   rawMousePos: { clientX: e.clientX, clientY: e.clientY }
      // });
      
      onUpdate(id, { 
        position: { 
          x: newX, 
          y: newY,
          z: 0
        } 
      });
    };

    const onMouseUp = () => {
      if (!isDraggingRef.current) return;
      
      isDraggingRef.current = false;
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
      
      // Z-Index zurücksetzen
      if (itemRef.current) {
        itemRef.current.style.zIndex = '';
      }
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [id, onUpdate, canvasState.scale, canvasState.position.x, canvasState.position.y]);

  return { 
    ref: itemRef, 
    onMouseDown,
    isDragging: isDraggingRef.current 
  };
};