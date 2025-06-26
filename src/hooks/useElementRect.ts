import { useState, useCallback, useEffect } from 'react';
import { useUpdateEffect, useEvent } from 'react-use';
import { log } from '../utils/logger';

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
    log.ui('info', `🔍 Updating bounding rect`, { 
      targetSelector, 
      enabled, 
      containerSelector 
    });
    
    if (!enabled || !targetSelector) {
      log.ui('info', `⏭️ Bounding rect update skipped`, { enabled, targetSelector });
      setBoundingRect(null);
      return;
    }

    // Find element within the preview container to avoid selecting preview renderer elements
    const previewContainer = document.querySelector(containerSelector);
    const targetElement = previewContainer 
      ? previewContainer.querySelector(targetSelector) as HTMLElement
      : document.querySelector(targetSelector) as HTMLElement;
    if (!targetElement) {
      log.ui('warn', `Target element not found`, { targetSelector });
      setBoundingRect(null);
      return;
    }

    log.ui('debug', `Target element found`, { 
      targetSelector,
      tagName: targetElement.tagName,
      id: targetElement.id,
      className: targetElement.className,
      textContent: targetElement.textContent?.substring(0, 30)
    });

    // Skip if element is inside section preview renderer (thumbnail previews in sidebar)
    // But allow main editor elements even if they have the same HTML structure
    const previewRenderer = targetElement.closest('[data-section-preview-renderer]');
    if (previewRenderer) {
      // Only skip if this is actually a scaled-down preview (not main editor)
      const previewElement = previewRenderer as HTMLElement;
      const isScaledPreview = previewElement.style.transform?.includes('scale');
      if (isScaledPreview) {
        log.ui('info', `⏭️ Element skipped - inside scaled section preview`, { targetSelector });
        setBoundingRect(null);
        return;
      }
    }

    const rect = targetElement.getBoundingClientRect();
    const containerElement = targetElement.closest(containerSelector);
    
    log.ui('info', `Element rect calculated`, { 
      targetSelector,
      rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
      hasContainer: !!containerElement,
      elementInfo: {
        tagName: targetElement.tagName,
        className: targetElement.className,
        textContent: targetElement.textContent?.substring(0, 50),
        offsetWidth: targetElement.offsetWidth,
        offsetHeight: targetElement.offsetHeight,
        clientWidth: targetElement.clientWidth,
        clientHeight: targetElement.clientHeight
      }
    });
    
    if (!containerElement) {
      const boundingRect = {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      };
      log.ui('info', `✅ Setting bounding rect (no container)`, { targetSelector, boundingRect });
      setBoundingRect(boundingRect);
      return;
    }

    const containerRect = containerElement.getBoundingClientRect();
    const boundingRect = {
      top: rect.top - containerRect.top,
      left: rect.left - containerRect.left,
      width: rect.width,
      height: rect.height,
    };
    log.ui('info', `Setting bounding rect (with container)`, { 
      targetSelector, 
      boundingRect,
      containerInfo: {
        containerRect: { top: containerRect.top, left: containerRect.left, width: containerRect.width, height: containerRect.height },
        containerSelector
      }
    });
    setBoundingRect(boundingRect);
  }, [targetSelector, containerSelector, enabled]);

  // Update on targetSelector change
  useUpdateEffect(() => {
    updateBoundingRect();
  }, [updateBoundingRect]);

  // Set up resize and scroll event listeners
  useEvent('resize', enabled ? updateBoundingRect : null);
  useEvent('scroll', enabled ? updateBoundingRect : null, document, { capture: true, passive: true });

  // Set up ResizeObserver to detect element size changes
  useEffect(() => {
    if (!enabled || !targetSelector) return;

    const targetElement = document.querySelector(targetSelector);
    if (!targetElement) return;

    const resizeObserver = new ResizeObserver(() => {
      updateBoundingRect();
    });

    resizeObserver.observe(targetElement);

    // Also observe mutations for text content changes
    const mutationObserver = new MutationObserver(() => {
      updateBoundingRect();
    });

    mutationObserver.observe(targetElement, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['style', 'class'],
    });

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [targetSelector, enabled, updateBoundingRect]);

  return {
    boundingRect,
    updateBoundingRect,
  };
};