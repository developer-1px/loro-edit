// src/features/floating-ui/FloatingUIManager.tsx

import React, { useState, useEffect } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { pluginManager } from '../../plugins';
import type { ParsedElement } from '../../types';

interface FloatingUIManagerProps {
  selectedElementId: string | null;
}

export const FloatingUIManager: React.FC<FloatingUIManagerProps> = ({
  selectedElementId
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const parsedElements = useEditorStore(state => state.parsedElements);
  const updateElement = useEditorStore(state => state.updateElement);
  
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
  
  const selectedElement = selectedElementId ? findElement(parsedElements, selectedElementId) : null;
  const plugin = selectedElementId ? pluginManager.getPluginById(selectedElementId) : null;
  
  useEffect(() => {
    // Open floating UI when element is selected
    if (selectedElement && plugin?.floatingUI?.enabled) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [selectedElementId, selectedElement, plugin]);
  
  if (!selectedElement || !plugin?.floatingUI?.enabled || !isOpen) {
    return null;
  }
  
  const floatingUIConfig = plugin.floatingUI;
  const position = floatingUIConfig.position || 'top';
  const offset = floatingUIConfig.offset || 16;
  
  // Get the selected element's DOM position
  const targetElement = document.querySelector(`[data-element-id="${selectedElementId}"]`);
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
        element: selectedElement,
        isOpen,
        onClose: () => setIsOpen(false),
        updateElement
      })}
    </div>
  );
};