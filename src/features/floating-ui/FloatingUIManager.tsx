// src/features/floating-ui/FloatingUIManager.tsx

import React, { useEffect } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { useFloatingUIStore } from '../../store/floatingUIStore';
import { pluginManager } from '../../plugins';
import type { ParsedElement } from '../../types';

interface FloatingUIManagerProps {
  selectedElementId: string | null;
}

export const FloatingUIManager: React.FC<FloatingUIManagerProps> = ({
  selectedElementId
}) => {
  const parsedElements = useEditorStore(state => state.parsedElements);
  const updateElement = useEditorStore(state => state.updateElement);
  const { activeElementId, isUIOpen, closeFloatingUI } = useFloatingUIStore();
  
  // Find the selected element
  const findElement = (elements: ParsedElement[], id: string): ParsedElement | null => {
    for (const element of elements) {
      if (element.id === id) return element;
      
      if ('children' in element && element.children) {
        const found = findElement(element.children, id);
        if (found) return found;
      }
      
      if ('items' in element && element.items) {
        const found = findElement(element.items, id);
        if (found) return found;
      }
    }
    return null;
  };
  
  const activeElement = activeElementId ? findElement(parsedElements, activeElementId) : null;
  const plugin = activeElementId ? pluginManager.getPluginById(activeElementId) : null;
  
  useEffect(() => {
    // Close floating UI when selection changes
    if (selectedElementId !== activeElementId && isUIOpen) {
      closeFloatingUI();
    }
  }, [selectedElementId, activeElementId, isUIOpen, closeFloatingUI]);
  
  if (!activeElementId || !activeElement || !plugin?.floatingUI?.enabled || !isUIOpen) {
    return null;
  }
  
  const floatingUIConfig = plugin.floatingUI;
  const position = floatingUIConfig.position || 'top';
  const offset = floatingUIConfig.offset || 16;
  
  // Get the active element's DOM position
  const targetElement = document.querySelector(`[data-element-id="${activeElementId}"]`);
  const previewContainer = document.querySelector('[data-preview-container]');
  
  if (!targetElement || !previewContainer) {
    return null;
  }
  
  const targetRect = targetElement.getBoundingClientRect();
  const containerRect = previewContainer.getBoundingClientRect();
  
  const relativePosition = {
    top: targetRect.top - containerRect.top,
    left: targetRect.left - containerRect.left,
    width: targetRect.width,
    height: targetRect.height
  };
  
  const getPositionForElement = () => {
    switch (position) {
      case 'top':
        return {
          position: 'absolute' as const,
          top: relativePosition.top - offset,
          left: relativePosition.left + relativePosition.width / 2,
          transform: 'translate(-50%, -100%)',
          zIndex: 1000
        };
      case 'bottom':
        return {
          position: 'absolute' as const,
          top: relativePosition.top + relativePosition.height + offset,
          left: relativePosition.left + relativePosition.width / 2,
          transform: 'translate(-50%, 0)',
          zIndex: 1000
        };
      case 'left':
        return {
          position: 'absolute' as const,
          top: relativePosition.top + relativePosition.height / 2,
          left: relativePosition.left - offset,
          transform: 'translate(-100%, -50%)',
          zIndex: 1000
        };
      case 'right':
        return {
          position: 'absolute' as const,
          top: relativePosition.top + relativePosition.height / 2,
          left: relativePosition.left + relativePosition.width + offset,
          transform: 'translate(0, -50%)',
          zIndex: 1000
        };
      default:
        return {
          position: 'absolute' as const,
          top: relativePosition.top - offset,
          left: relativePosition.left + relativePosition.width / 2,
          transform: 'translate(-50%, -100%)',
          zIndex: 1000
        };
    }
  };

  return (
    <div
      className="floating-ui-content"
      style={{
        ...getPositionForElement(),
        pointerEvents: 'auto'
      }}
      data-floating-ui
      onClick={(e) => e.stopPropagation()}
    >
      {React.createElement(floatingUIConfig.render, {
        element: activeElement,
        isOpen: isUIOpen,
        onClose: closeFloatingUI,
        updateElement
      })}
    </div>
  );
};