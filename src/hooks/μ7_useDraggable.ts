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
  item: DraggableItem, 
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
    const canvasController = document.querySelector('.canvas-controller') as HTMLElement;
    if (!canvasController) return;
    const canvasRect = canvasController.getBoundingClientRect();
    const scale = canvasState.scale;
    const translateX = canvasState.position.x;
    const translateY = canvasState.position.y;
    const mouseX = e.clientX - canvasRect.left;
    const mouseY = e.clientY - canvasRect.top;
    const canvasX = (mouseX - translateX) / scale;
    const canvasY = (mouseY - translateY) / scale;

    dragOffsetRef.current = {
      x: canvasX - item.position.x,
      y: canvasY - item.position.y,
    };
    
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
    
    // Fenster nach vorne bringen
    if (itemRef.current) {
      itemRef.current.style.zIndex = '1000';
    }
  }, [item.position.x, item.position.y, canvasState.scale, canvasState.position.x, canvasState.position.y]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !itemRef.current) return;
      
      const canvasController = document.querySelector('.canvas-controller') as HTMLElement;
      if (!canvasController) return;
      
      const canvasRect = canvasController.getBoundingClientRect();
      
      const scale = canvasState.scale;
      const translateX = canvasState.position.x;
      const translateY = canvasState.position.y;
      
      const mouseX = e.clientX - canvasRect.left;
      const mouseY = e.clientY - canvasRect.top;
      
      const canvasX = (mouseX - translateX) / scale;
      const canvasY = (mouseY - translateY) / scale;
      
      const newX = canvasX - dragOffsetRef.current.x;
      const newY = canvasY - dragOffsetRef.current.y;
      
      let animationFrameId: number;

      const throttledUpdate = (newX: number, newY: number) => {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(() => {
          onUpdate(item.id, { 
            position: { 
              x: newX, 
              y: newY,
              z: 0
            } 
          });
        });
      };

      throttledUpdate(newX, newY);
    };

    const onMouseUp = () => {
      if (!isDraggingRef.current) return;
      
      isDraggingRef.current = false;
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
      
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
  }, [item.id, onUpdate, canvasState.scale, canvasState.position.x, canvasState.position.y]);

  return { 
    ref: itemRef, 
    onMouseDown,
    isDragging: isDraggingRef.current 
  };
};