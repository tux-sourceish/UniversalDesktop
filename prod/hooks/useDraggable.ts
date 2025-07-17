import { useRef, useCallback, useEffect } from 'react';

interface Position {
  x: number;
  y: number;
  z: number;
}

interface DraggableItem {
  id: string;
  position: Position;
  width?: number;
  height?: number;
}

export const useDraggable = (
  id: string, 
  onUpdate: (id: string, updates: Partial<DraggableItem>) => void
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
      
      // Simplified dragging - get canvas transform from CSS variables or data attributes
      const canvas = document.querySelector('.infinite-canvas') as HTMLElement;
      if (!canvas) return;
      
      const canvasRect = canvas.getBoundingClientRect();
      
      // Get scale and position from CSS custom properties or calculate from transform
      const canvasStyle = window.getComputedStyle(canvas);
      const transform = canvasStyle.transform;
      
      let scale = 1;
      let translateX = 0;
      let translateY = 0;
      
      if (transform && transform !== 'none') {
        const matrix = transform.match(/matrix\(([^)]+)\)/);
        if (matrix) {
          const values = matrix[1].split(',').map(v => parseFloat(v.trim()));
          scale = values[0] || 1; // scaleX
          translateX = values[4] || 0; // translateX
          translateY = values[5] || 0; // translateY
        }
      }
      
      // Calculate mouse position relative to canvas with inverse transform
      const mouseX = e.clientX - canvasRect.left;
      const mouseY = e.clientY - canvasRect.top;
      
      // Apply inverse transform to get canvas coordinates
      const canvasX = (mouseX - translateX) / scale;
      const canvasY = (mouseY - translateY) / scale;
      
      // Calculate new position with drag offset
      const newX = canvasX - (dragOffsetRef.current.x / scale);
      const newY = canvasY - (dragOffsetRef.current.y / scale);
      
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
  }, [id, onUpdate]);

  return { 
    ref: itemRef, 
    onMouseDown,
    isDragging: isDraggingRef.current 
  };
};