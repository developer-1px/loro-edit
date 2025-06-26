import { useCallback, useEffect } from 'react';
import type { ParsedElement } from '../../types';
import type { SelectionState } from './types';
import { pluginManager } from '../../plugins';
import { log } from '../../utils/logger';

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
    document.querySelectorAll('[data-element-id], [data-section-id]').forEach(el => {
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
    
    log.selection('debug', `Click detected at coordinates`, { x: clientX, y: clientY });
    log.selection('debug', `Current selection state`, { 
      mode: selection.mode,
      selectedElementId: selection.selectedElementId 
    });
    
    const elementsAtPoint = document.elementsFromPoint(clientX, clientY);
    const elementDetails = elementsAtPoint.map(el => ({
      tag: el.tagName,
      id: el.id,
      className: el.className,
      dataElementId: (el as HTMLElement).dataset?.elementId,
      dataSectionId: (el as HTMLElement).dataset?.sectionId,
      textContent: el.textContent?.substring(0, 20)
    }));
    
    log.selection('debug', `Elements at click point`, { 
      count: elementsAtPoint.length,
      elements: elementDetails
    });

    // First check if we clicked on a section wrapper
    const sectionElement = elementsAtPoint.find(el => 
      (el as HTMLElement).dataset?.sectionId
    ) as HTMLElement;
    
    if (sectionElement && event.target === sectionElement) {
      // Clicked directly on section wrapper (not on child elements)
      const sectionId = sectionElement.dataset.sectionId!;
      log.selection('info', `Section clicked directly`, { sectionId });
      setSelection({ mode: 'block', selectedElementId: sectionId });
      return;
    }

    // Otherwise, try to find a selectable element within
    const result = pluginManager.findSelectableAtPoint(
      clientX, 
      clientY, 
      selection.selectedElementId || undefined,
      selection.mode || undefined
    );
    
    log.selection('debug', `Plugin manager selection result`, result);
    
    if (!result) {
      // If no element found but we're inside a section, select the section
      if (sectionElement) {
        const sectionId = sectionElement.dataset.sectionId!;
        log.selection('info', `No element found, selecting parent section`, { sectionId });
        setSelection({ mode: 'block', selectedElementId: sectionId });
        return;
      }
      
      log.selection('warn', `No selectable element found at click point`);
      clearSelection();
      return;
    }

    const { elementId, mode } = result;
    log.selection('info', `Selection successful`, { elementId, mode });
    setSelection({ mode, selectedElementId: elementId });
  }, [setSelection, clearSelection, selection.selectedElementId, selection.mode]);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    clearHoverEffects();
    
    // First check for section hover
    const elementsAtPoint = document.elementsFromPoint(event.clientX, event.clientY);
    const sectionElement = elementsAtPoint.find(el => 
      (el as HTMLElement).dataset?.sectionId && 
      (el as HTMLElement).dataset?.elementId
    ) as HTMLElement;
    
    if (sectionElement && event.target === sectionElement) {
      // Hovering directly on section wrapper
      sectionElement.style.outline = '1px dashed rgba(59, 130, 246, 0.4)';
      return;
    }
    
    // Otherwise check for element hover
    const result = pluginManager.findSelectableAtPoint(event.clientX, event.clientY);
    
    if (result) {
      // Add subtle hover effect
      const targetElement = document.querySelector(`[data-element-id="${result.elementId}"]`) as HTMLElement;
      if (targetElement) {
        targetElement.style.outline = '1px dashed rgba(59, 130, 246, 0.4)';
      }
    } else if (sectionElement) {
      // If no element but we're in a section, show section hover
      sectionElement.style.outline = '1px dashed rgba(59, 130, 246, 0.2)';
    }
  }, [clearHoverEffects]);

  return {
    handleClick,
    handleMouseMove,
    clearSelection,
    clearHoverEffects,
  };
};