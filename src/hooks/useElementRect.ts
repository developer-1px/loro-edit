import { useState, useCallback } from 'react';
import { useUpdateEffect, useEvent } from 'react-use';

interface BoundingRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface UseElementRectOptions {
  containerSelector?: string;
  enabled?: boolean;
}

export const useElementRect = (
  targetSelector: string,
  options: UseElementRectOptions = {}
) => {
  const { containerSelector = '[data-preview-container]', enabled = true } = options;
  const [boundingRect, setBoundingRect] = useState<BoundingRect | null>(null);

  const updateBoundingRect = useCallback(() => {
    if (!enabled || !targetSelector) {
      setBoundingRect(null);
      return;
    }

    const targetElement = document.querySelector(targetSelector);
    if (!targetElement) {
      setBoundingRect(null);
      return;
    }

    const rect = targetElement.getBoundingClientRect();
    const containerElement = targetElement.closest(containerSelector);
    
    if (!containerElement) {
      setBoundingRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
      return;
    }

    const containerRect = containerElement.getBoundingClientRect();
    setBoundingRect({
      top: rect.top - containerRect.top,
      left: rect.left - containerRect.left,
      width: rect.width,
      height: rect.height,
    });
  }, [targetSelector, containerSelector, enabled]);

  // Update on targetSelector change
  useUpdateEffect(() => {
    updateBoundingRect();
  }, [updateBoundingRect]);

  // Set up resize and scroll event listeners
  useEvent('resize', enabled ? updateBoundingRect : null);
  useEvent('scroll', enabled ? updateBoundingRect : null, document, { capture: true, passive: true });

  return {
    boundingRect,
    updateBoundingRect,
  };
};