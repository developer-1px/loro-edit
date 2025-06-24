// src/hooks/useResizeHandling.ts

import { useState } from 'react';
import { useMouseDrag } from './useMouseDrag';

export const useResizeHandling = (initialWidth = 80) => {
  const [leftPanelWidth, setLeftPanelWidth] = useState(initialWidth);
  const [startWidth, setStartWidth] = useState(initialWidth);

  const { isDragging, handleMouseDown } = useMouseDrag({
    onDragStart: () => {
      setStartWidth(leftPanelWidth);
    },
    onDrag: ({ deltaX }) => {
      const containerWidth = window.innerWidth;
      const deltaPercent = (deltaX / containerWidth) * 100;
      const newWidth = Math.min(Math.max(startWidth + deltaPercent, 15), 75);
      setLeftPanelWidth(newWidth);
    },
  });

  return {
    leftPanelWidth,
    isResizing: isDragging,
    handleMouseDown,
  };
};