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
  const { isUIOpen, openFloatingUI, closeFloatingUI } = useFloatingUIStore();
  
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
    // Auto-open floating UI for elements that have it
    if (selectedElementId && selectedElement && plugin?.floatingUI?.enabled && !isUIOpen) {
      openFloatingUI(selectedElementId);
    }
    // Close when selection changes to element without floating UI
    else if (!plugin?.floatingUI?.enabled && isUIOpen) {
      closeFloatingUI();
    }
  }, [selectedElementId, selectedElement, plugin, isUIOpen, openFloatingUI, closeFloatingUI]);
  
  // Show floating UI if element has it enabled
  if (!selectedElement || !plugin?.floatingUI?.enabled) {
    return null;
  }
  
  const floatingUIConfig = plugin.floatingUI;
  const position = floatingUIConfig.position || 'top';
  const offset = floatingUIConfig.offset || 1; // Very close positioning
  const selectionColor = plugin.selectable?.color || '#3b82f6';
  
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
        pointerEvents: 'auto',
        backgroundColor: '#111827',
        borderRadius: '6px',
        padding: '4px 8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        border: `1px solid ${selectionColor}20`,
      }}
      data-floating-ui
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
        <span style={{ 
          color: selectionColor,
          fontSize: '10px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          borderRight: `1px solid ${selectionColor}30`,
          paddingRight: '3px',
          lineHeight: 1,
        }}>
          {plugin.selectable?.name || plugin.name}
        </span>
        {React.createElement(floatingUIConfig.render, {
          element: selectedElement,
          isOpen: true,
          onClose: closeFloatingUI,
          updateElement,
          selectionColor
        })}
      </div>
    </div>
  );
};