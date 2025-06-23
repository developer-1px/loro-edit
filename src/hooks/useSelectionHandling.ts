import { useCallback } from 'react';
import type { SelectionState, ParsedElement } from '../types';
import { pluginManager } from '../plugins';

interface UseSelectionHandlingProps {
  selection: SelectionState;
  setSelection: (selection: Partial<SelectionState>) => void;
  parsedElements: ParsedElement[];
}

export const useSelectionHandling = ({ 
  setSelection
}: UseSelectionHandlingProps) => {
  const clearSelection = useCallback(() => {
    setSelection({ mode: null, selectedElementId: null });
  }, [setSelection]);

  const handleClick = useCallback((event: React.MouseEvent) => {
    const target = event.target as HTMLElement;

    // Skip control elements
    if (
      target.closest('[data-selection-overlay]') ||
      target.closest('[data-preview-controls]') ||
      target.closest('button')
    ) {
      return;
    }

    // Find element ID
    let elementId: string | null = null;
    let currentElement: HTMLElement | null = target;
    
    while (currentElement && !elementId) {
      elementId = currentElement.dataset?.elementId || null;
      if (!elementId) {
        currentElement = currentElement.parentElement;
      }
    }

    if (!elementId) {
      clearSelection();
      return;
    }

    // Get plugin info
    const plugin = pluginManager.getPluginById(elementId);
    if (!plugin?.selectable?.enabled) {
      clearSelection();
      return;
    }

    const mode = plugin.name === 'text' ? 'text' : 'block';
    setSelection({ mode, selectedElementId: elementId });
  }, [setSelection, clearSelection]);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    const result = pluginManager.findSelectableAtPoint(event.clientX, event.clientY);
    if (result) {
      // Could add hover effects here if needed
    }
  }, []);

  return {
    handleClick,
    handleMouseMove,
    clearSelection,
  };
};