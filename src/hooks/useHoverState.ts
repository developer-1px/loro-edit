import { useState, useCallback } from 'react';
import { useEvent } from 'react-use';

interface UseHoverStateOptions {
  containerSelector?: string;
  enabled?: boolean;
}

export const useHoverState = (options: UseHoverStateOptions = {}) => {
  const { containerSelector = '[data-preview-container]', enabled = true } = options;
  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null);

  const handleMouseEnter = useCallback((event: Event) => {
    if (!enabled) return;

    const target = event.target as HTMLElement;
    const blockElementId = target.getAttribute('data-block-element-id');
    const textElementId = target.getAttribute('data-text-element-id');
    const repeatItemId = target.getAttribute('data-repeat-item-id');
    
    // Priority: repeat-item > text > block
    if (repeatItemId) {
      setHoveredElementId(repeatItemId);
    } else if (textElementId) {
      setHoveredElementId(textElementId);
    } else if (blockElementId) {
      setHoveredElementId(blockElementId);
    }
  }, [enabled]);

  const handleMouseLeave = useCallback(() => {
    if (!enabled) return;
    setHoveredElementId(null);
  }, [enabled]);

  // Attach event listeners to container
  const container = enabled ? document.querySelector(containerSelector) : null;
  useEvent('mouseover', enabled ? handleMouseEnter : null, container, { capture: true });
  useEvent('mouseleave', enabled ? handleMouseLeave : null, container, { capture: true });

  return {
    hoveredElementId,
    setHoveredElementId,
  };
};