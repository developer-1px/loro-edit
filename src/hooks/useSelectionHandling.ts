// src/hooks/useSelectionHandling.ts

import { useCallback } from 'react';
import type { SelectionState } from '../types';

interface UseSelectionHandlingProps {
  selection: SelectionState;
  setSelection: (selection: Partial<SelectionState>) => void;
}

export const useSelectionHandling = ({ selection, setSelection }: UseSelectionHandlingProps) => {
  
  // Block 모드로 전환 (요소 선택)
  const handleBlockSelect = useCallback((elementId: string) => {
    setSelection({
      mode: 'block',
      selectedElementId: elementId,
      selectedTextElementId: null, // 텍스트 편집 해제
      selectedRepeatItemId: null,
      selectedRepeatContainerId: null,
    });
  }, [setSelection]);

  // 선택 해제
  const handleDeselect = useCallback(() => {
    setSelection({
      mode: 'block',
      selectedElementId: null,
      selectedTextElementId: null,
      selectedRepeatItemId: null,
      selectedRepeatContainerId: null,
    });
  }, [setSelection]);

  // Text 모드로 전환 (텍스트 편집)
  const handleTextSelect = useCallback((textElementId: string) => {
    setSelection({
      mode: 'text',
      selectedElementId: null, // 블록 선택 해제
      selectedTextElementId: textElementId,
      selectedRepeatItemId: null,
      selectedRepeatContainerId: null,
    });
  }, [setSelection]);

  // 반복 요소 선택
  const handleRepeatItemSelect = useCallback((itemId: string, containerId: string) => {
    setSelection({
      mode: 'block',
      selectedElementId: null,
      selectedTextElementId: null,
      selectedRepeatItemId: itemId,
      selectedRepeatContainerId: containerId,
    });
  }, [setSelection]);

  const handleDocumentClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    // 1. 반복 요소 클릭 확인 (최우선)
    const repeatItemElement = target.closest<HTMLElement>('[data-repeat-item-id]');
    if (repeatItemElement) {
      const itemId = repeatItemElement.dataset.repeatItemId!;
      const containerId = repeatItemElement.dataset.repeatContainerId!;
      
      // 반복 요소 선택
      handleRepeatItemSelect(itemId, containerId);
      return;
    }

    // 2. 텍스트 요소 클릭 확인
    const textElement = target.closest<HTMLElement>('[data-text-element-id]');
    if (textElement) {
      const textElementId = textElement.dataset.textElementId!;
      
      if (selection.mode === 'text' && selection.selectedTextElementId === textElementId) {
        // 이미 편집 중인 텍스트 요소 - 아무것도 하지 않음 (계속 편집)
        return;
      } else {
        // 다른 텍스트 요소 또는 블록 모드에서 텍스트 클릭 - 텍스트 모드로 전환
        handleTextSelect(textElementId);
        return;
      }
    }

    // 3. 블록(요소) 클릭 확인
    const blockElement = target.closest<HTMLElement>('[data-block-element-id]');
    if (blockElement) {
      const blockElementId = blockElement.dataset.blockElementId!;
      
      // 블록 요소 선택 - 텍스트 모드였다면 블록 모드로 전환
      handleBlockSelect(blockElementId);
      return;
    }

    // 4. 빈 공간 클릭 - 모든 선택 해제
    handleDeselect();
  }, [selection, handleBlockSelect, handleTextSelect, handleRepeatItemSelect, handleDeselect]);

  return {
    handleBlockSelect,
    handleTextSelect,
    handleRepeatItemSelect,
    handleDeselect,
    handleDocumentClick,
  };
};