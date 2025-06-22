// src/hooks/useSelectionHandling.ts

import { useCallback, useMemo } from 'react';
import type { SelectionState, ParsedElement } from '../types';
import { 
  buildSelectableTree, 
  analyzeClick,
  type SelectableElement 
} from '../utils/selectionUtils';

interface UseSelectionHandlingProps {
  selection: SelectionState;
  setSelection: (selection: Partial<SelectionState>) => void;
  parsedElements: ParsedElement[];
}

export const useSelectionHandling = ({ 
  selection, 
  setSelection, 
  parsedElements 
}: UseSelectionHandlingProps) => {
  
  // 선택 가능한 요소 트리 구축 (메모이제이션)
  const selectableTree = useMemo(() => {
    console.log('🔄 useSelectionHandling - Building selectable tree for:', parsedElements.length, 'elements');
    const tree = buildSelectableTree(parsedElements);
    console.log('📊 useSelectionHandling - Built tree with:', tree.length, 'selectable elements');
    return tree;
  }, [parsedElements]);

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

  // Figma 스타일 계층적 선택
  const handleSmartSelect = useCallback((elementId: string) => {
    const currentSelectedId = selection.selectedElementId || 
                             selection.selectedTextElementId || 
                             selection.selectedRepeatItemId;

    const result = analyzeClick(elementId, selectableTree, currentSelectedId);
    
    if (!result.target) {
      handleDeselect();
      return;
    }

    // inline 그룹이 있는 경우 특별 처리
    const inlineGroup = result.alternatives.filter(alt => 
      alt.selectable.elementType === 'inline'
    );

    if (inlineGroup.length > 1) {
      // inline 요소들이 여러 개 있으면 클릭된 요소를 선택
      const clickedInline = inlineGroup.find(el => el.id === elementId);
      if (clickedInline) {
        if (clickedInline.element.type === 'text') {
          handleTextSelect(clickedInline.id);
        } else {
          handleBlockSelect(clickedInline.id);
        }
        return;
      }
    }

    // 일반적인 선택 로직
    if (result.target.element.type === 'text' && 
        currentSelectedId !== result.target.id) {
      handleTextSelect(result.target.id);
    } else if (result.target.element.type === 'repeat-container' && 
               'items' in result.target.element && 
               result.target.element.items.length > 0) {
      // repeat container의 첫 번째 아이템 선택
      const firstItem = result.target.element.items[0];
      handleRepeatItemSelect(firstItem.id, result.target.id);
    } else {
      handleBlockSelect(result.target.id);
    }
  }, [selection, selectableTree, setSelection, handleBlockSelect, handleTextSelect, handleRepeatItemSelect, handleDeselect]);

  const handleDocumentClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const clientX = e.clientX;
    const clientY = e.clientY;
    
    console.log('🖱️ Click detected at:', { x: clientX, y: clientY }, 'on:', target.tagName, target.className);

    // document.elementsFromPoint를 사용해서 클릭 위치의 모든 요소들 가져오기
    const elementsAtPoint = document.elementsFromPoint(clientX, clientY);
    console.log('📍 Elements at point:', elementsAtPoint.map(el => ({
      tag: el.tagName,
      id: el.id,
      className: el.className,
      datasets: Object.keys(el.dataset)
    })));

    // 선택 가능한 요소들을 우선순위대로 찾기
    for (const element of elementsAtPoint) {
      const htmlElement = element as HTMLElement;
      
      // 1. 텍스트 요소 확인
      if (htmlElement.dataset.textElementId) {
        const textElementId = htmlElement.dataset.textElementId;
        console.log('📝 Text element found:', textElementId);
        
        if (selection.mode === 'text' && selection.selectedTextElementId === textElementId) {
          console.log('📝 Already editing this text element');
          return;
        }
        
        handleTextSelect(textElementId);
        return;
      }

      // 2. 반복 요소 확인
      if (htmlElement.dataset.repeatItemId && htmlElement.dataset.repeatContainerId) {
        const itemId = htmlElement.dataset.repeatItemId;
        const containerId = htmlElement.dataset.repeatContainerId;
        console.log('🔄 Repeat item found:', { itemId, containerId });
        
        handleRepeatItemSelect(itemId, containerId);
        return;
      }

      // 3. 블록 요소 확인
      if (htmlElement.dataset.blockElementId) {
        const blockElementId = htmlElement.dataset.blockElementId;
        console.log('🟦 Block element found:', blockElementId);
        
        // 선택 가능한 요소인지 확인
        const allSelectableElements = selectableTree.flatMap(function flatten(el): SelectableElement[] {
          return [el, ...el.children.flatMap(flatten)];
        });
        
        const selectableElement = allSelectableElements.find(el => el.id === blockElementId);
        if (selectableElement) {
          console.log('✅ Selectable element confirmed:', selectableElement.selectable.name);
          handleSmartSelect(blockElementId);
          return;
        } else {
          console.log('❌ Element not selectable, continuing search...');
        }
      }
    }

    // 4. 선택 가능한 요소를 찾지 못함 - 모든 선택 해제
    console.log('🚫 No selectable elements found - deselecting');
    handleDeselect();
  }, [selection, selectableTree, handleTextSelect, handleRepeatItemSelect, handleSmartSelect, handleDeselect]);

  // 선택된 요소의 정보 반환
  const getSelectedElementInfo = useCallback(() => {
    const currentSelectedId = selection.selectedElementId || 
                             selection.selectedTextElementId || 
                             selection.selectedRepeatItemId;

    if (!currentSelectedId) return null;

    const allElements = selectableTree.flatMap(function flatten(el): SelectableElement[] {
      return [el, ...el.children.flatMap(flatten)];
    });

    return allElements.find(el => el.id === currentSelectedId) || null;
  }, [selection, selectableTree]);

  return {
    handleBlockSelect,
    handleTextSelect,
    handleRepeatItemSelect,
    handleDeselect,
    handleDocumentClick,
    handleSmartSelect,
    getSelectedElementInfo,
    selectableTree,
  };
};