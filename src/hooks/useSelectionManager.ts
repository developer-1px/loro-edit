import { useCallback } from 'react';
import { useMethods } from 'react-use';
import type { SelectionState } from '../types';

interface SelectionActions {
  selectBlock: (elementId: string) => void;
  selectText: (textElementId: string) => void;
  selectRepeatItem: (itemId: string, containerId: string) => void;
  clearSelection: () => void;
  setMode: (mode: 'block' | 'text') => void;
}

const createInitialState = (): SelectionState => ({
  mode: 'block',
  selectedElementId: null,
  selectedTextElementId: null,
  selectedRepeatItemId: null,
  selectedRepeatContainerId: null,
});

const selectionMethods = (state: SelectionState) => ({
  selectBlock: (elementId: string) => ({
    ...state,
    mode: 'block' as const,
    selectedElementId: elementId,
    selectedTextElementId: null,
    selectedRepeatItemId: null,
    selectedRepeatContainerId: null,
  }),

  selectText: (textElementId: string) => ({
    ...state,
    mode: 'text' as const,
    selectedElementId: null,
    selectedTextElementId: textElementId,
    selectedRepeatItemId: null,
    selectedRepeatContainerId: null,
  }),

  selectRepeatItem: ({ itemId, containerId }: { itemId: string; containerId: string }) => ({
    ...state,
    mode: 'block' as const,
    selectedElementId: null,
    selectedTextElementId: null,
    selectedRepeatItemId: itemId,
    selectedRepeatContainerId: containerId,
  }),

  clearSelection: () => ({
    ...state,
    mode: 'block' as const,
    selectedElementId: null,
    selectedTextElementId: null,
    selectedRepeatItemId: null,
    selectedRepeatContainerId: null,
  }),

  setMode: (mode: 'block' | 'text') => ({
    ...state,
    mode,
  }),

  setState: (newState: Partial<SelectionState>) => ({
    ...state,
    ...newState,
  }),
});

export const useSelectionManager = (initialState?: Partial<SelectionState>) => {
  const [selection, actions] = useMethods(
    selectionMethods,
    { ...createInitialState(), ...initialState }
  );

  const handleDocumentClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    // 1. Check for text element click (highest priority)
    const textElement = target.closest<HTMLElement>('[data-text-element-id]');
    if (textElement) {
      const textElementId = textElement.dataset.textElementId!;
      
      if (selection.mode === 'text' && selection.selectedTextElementId === textElementId) {
        // Already editing this text element - continue editing
        return;
      } else {
        // Switch to text mode for this element
        actions.selectText(textElementId);
        return;
      }
    }

    // 2. Check for repeat item click
    const repeatItemElement = target.closest<HTMLElement>('[data-repeat-item-id]');
    if (repeatItemElement) {
      const itemId = repeatItemElement.dataset.repeatItemId!;
      const containerId = repeatItemElement.dataset.repeatContainerId!;
      
      actions.selectRepeatItem({ itemId, containerId });
      return;
    }

    // 3. Check for block element click
    const blockElement = target.closest<HTMLElement>('[data-block-element-id]');
    if (blockElement) {
      const blockElementId = blockElement.dataset.blockElementId!;
      
      actions.selectBlock(blockElementId);
      return;
    }

    // 4. Empty space click - clear selection
    actions.clearSelection();
  }, [selection, actions]);

  return {
    selection,
    actions: actions as SelectionActions & { setState: (newState: Partial<SelectionState>) => void },
    handleDocumentClick,
  };
};