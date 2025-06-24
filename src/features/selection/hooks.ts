import { useCallback, useEffect } from 'react';
import type { ParsedElement } from '../../types';
import type { SelectionState } from './types';
import { pluginManager } from '../../plugins';

interface UseSelectionHandlingProps {
  selection: SelectionState;
  setSelection: (selection: Partial<SelectionState>) => void;
  parsedElements: ParsedElement[];
}

export const useSelectionHandling = ({ 
  selection,
  setSelection
}: UseSelectionHandlingProps) => {
  const clearSelection = useCallback(() => {
    setSelection({ mode: null, selectedElementId: null });
  }, [setSelection]);

  const clearHoverEffects = useCallback(() => {
    document.querySelectorAll('[data-element-id]').forEach(el => {
      (el as HTMLElement).style.removeProperty('outline');
    });
  }, []);

  // Validate selection after element changes (HMR support)
  useEffect(() => {
    if (selection.selectedElementId) {
      const element = document.querySelector(`[data-element-id="${selection.selectedElementId}"]`);
      if (!element) {
        // Selected element no longer exists, clear selection
        clearSelection();
      }
    }
  }, [selection.selectedElementId, clearSelection]);

  const handleClick = useCallback((event: React.MouseEvent) => {
    const { clientX, clientY } = event;
    
    console.log('🖱️ Click at:', { x: clientX, y: clientY });
    console.log('🎯 Current selection:', selection.selectedElementId);
    
    const elementsAtPoint = document.elementsFromPoint(clientX, clientY);
    console.log('📍 Elements at point:', elementsAtPoint.map(el => ({
      tag: el.tagName,
      id: el.id,
      className: el.className,
      dataElementId: (el as HTMLElement).dataset?.elementId,
      textContent: el.textContent?.substring(0, 20)
    })));

    // Pass current selection and mode for hierarchical selection
    const result = pluginManager.findSelectableAtPoint(
      clientX, 
      clientY, 
      selection.selectedElementId || undefined,
      selection.mode || undefined
    );
    
    console.log('🔍 Selection result:', result);
    
    if (!result) {
      console.log('❌ No selectable element found');
      clearSelection();
      return;
    }

    const { elementId, mode } = result;
    console.log('✅ Setting selection:', { elementId, mode });
    setSelection({ mode, selectedElementId: elementId });
  }, [setSelection, clearSelection, selection.selectedElementId]);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    const result = pluginManager.findSelectableAtPoint(event.clientX, event.clientY);
    
    clearHoverEffects();
    
    if (result) {
      // Add subtle hover effect
      const targetElement = document.querySelector(`[data-element-id="${result.elementId}"]`) as HTMLElement;
      if (targetElement) {
        targetElement.style.outline = '1px dashed rgba(59, 130, 246, 0.4)';
      }
    }
  }, [clearHoverEffects]);

  return {
    handleClick,
    handleMouseMove,
    clearSelection,
    clearHoverEffects,
  };
};