import { useState, useCallback } from 'react';
import { useEvent } from 'react-use';

interface MouseDragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  deltaX: number;
  deltaY: number;
}

interface UseMouseDragOptions {
  onDragStart?: (e: React.MouseEvent) => void;
  onDrag?: (state: MouseDragState, e: MouseEvent) => void;
  onDragEnd?: (state: MouseDragState) => void;
}

export const useMouseDrag = (options: UseMouseDragOptions = {}) => {
  const { onDragStart, onDrag, onDragEnd } = options;
  
  const [dragState, setDragState] = useState<MouseDragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    deltaX: 0,
    deltaY: 0,
  });

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragState.isDragging) return;

      const deltaX = e.clientX - dragState.startX;
      const deltaY = e.clientY - dragState.startY;
      
      const newState = {
        ...dragState,
        deltaX,
        deltaY,
      };

      setDragState(newState);
      onDrag?.(newState, e);
    },
    [dragState, onDrag]
  );

  const handleMouseUp = useCallback(() => {
    if (!dragState.isDragging) return;

    const finalState = { ...dragState, isDragging: false };
    setDragState(finalState);
    onDragEnd?.(finalState);

    // Reset cursor and user selection
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, [dragState, onDragEnd]);

  // Global event listeners when dragging
  useEvent('mousemove', dragState.isDragging ? handleMouseMove : null);
  useEvent('mouseup', dragState.isDragging ? handleMouseUp : null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const newState = {
        isDragging: true,
        startX: e.clientX,
        startY: e.clientY,
        deltaX: 0,
        deltaY: 0,
      };

      setDragState(newState);
      onDragStart?.(e);

      // Set cursor and prevent selection
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    },
    [onDragStart]
  );

  return {
    ...dragState,
    handleMouseDown,
  };
};