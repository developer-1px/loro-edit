// src/hooks/useSelectionHandling.ts

import { useCallback } from 'react';
import type { SelectionState } from '../types';

interface UseSelectionHandlingProps {
  selection: SelectionState;
  setSelection: (selection: Partial<SelectionState>) => void;
}

export const useSelectionHandling = ({ selection, setSelection }: UseSelectionHandlingProps) => {
  const handleContainerSelect = useCallback((
    containerId: string,
    containerType: 'repeat-container' | 'regular'
  ) => {
    setSelection({
      mode: 'container',
      selectedContainerId: containerId,
      selectedContainerType: containerType,
      selectedRepeatItemId: null,
      selectedRepeatContainerId: null,
    });
  }, [setSelection]);

  const handleContainerDeselect = useCallback(() => {
    setSelection({
      mode: 'container',
      selectedContainerId: null,
      selectedContainerType: null,
      selectedRepeatItemId: null,
      selectedRepeatContainerId: null,
    });
  }, [setSelection]);

  const handleRepeatItemSelect = useCallback((containerId: string, itemId: string) => {
    setSelection({
      mode: 'repeat-item',
      selectedContainerId: containerId,
      selectedContainerType: 'repeat-container',
      selectedRepeatItemId: itemId,
      selectedRepeatContainerId: containerId,
    });
  }, [setSelection]);

  const handleTextSelect = useCallback(() => {
    setSelection({
      ...selection,
      mode: 'text',
      selectedRepeatItemId: null,
      selectedRepeatContainerId: null,
    });
  }, [selection, setSelection]);

  const handleDocumentClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    const containerEl = target.closest<HTMLElement>('[data-container-id]');
    const repeatItemEl = target.closest<HTMLElement>('[data-repeat-item-id]');

    // 1. Clicked outside any container, deselect all.
    if (!containerEl) {
      handleContainerDeselect();
      return;
    }

    const clickedContainerId = containerEl.dataset.containerId!;
    const clickedContainerType = containerEl.dataset.containerType as
      | 'repeat-container'
      | 'regular';
    const clickedRepeatItemId = repeatItemEl?.dataset.repeatItemId || null;

    const { mode, selectedContainerId } = selection;

    // 2. A different container is clicked, select it and reset.
    if (selectedContainerId && selectedContainerId !== clickedContainerId) {
      handleContainerSelect(clickedContainerId, clickedContainerType);
      return;
    }

    // 3. No container is selected yet, select the clicked one.
    if (!selectedContainerId) {
      handleContainerSelect(clickedContainerId, clickedContainerType);
      return;
    }

    // 4. From here, a container is selected and the click is within it.
    // The logic now follows the mode priority.

    if (mode === 'container') {
      // In container mode, we prioritize sub-selections based on what was clicked.
      if (clickedRepeatItemId) {
        handleRepeatItemSelect(clickedContainerId, clickedRepeatItemId);
      } else {
        handleTextSelect();
      }
    } else if (mode === 'repeat-item') {
      // In repeat-item mode, we prioritize repeat-items.
      if (clickedRepeatItemId) {
        handleRepeatItemSelect(clickedContainerId, clickedRepeatItemId);
      } else {
        handleTextSelect(); // Fallback to text selection.
      }
    } else if (mode === 'text') {
      // In text mode, text is priority, but repeat-items can override.
      if (clickedRepeatItemId) {
        handleRepeatItemSelect(clickedContainerId, clickedRepeatItemId);
      } else {
        // Check if the clicked target is a text element or its descendant
        const isTextElement =
          target.hasAttribute('contenteditable') ||
          target.hasAttribute('data-element-id');
        const isWithinTextElement =
          target.closest('[contenteditable]') ||
          target.closest('[data-element-id]');

        const isTextClick = isTextElement || isWithinTextElement;

        if (isTextClick) {
          // Already in text mode, no state change needed. Let browser handle focus.
        } else {
          // Clicked on non-text area, exit text mode back to container mode
          setSelection({
            ...selection,
            mode: 'container',
          });
        }
      }
    }
  }, [selection, handleContainerSelect, handleContainerDeselect, handleRepeatItemSelect, handleTextSelect, setSelection]);

  return {
    handleContainerSelect,
    handleContainerDeselect,
    handleRepeatItemSelect,
    handleTextSelect,
    handleDocumentClick,
  };
};