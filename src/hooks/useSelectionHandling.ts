// src/hooks/useSelectionHandling.ts

import { useCallback, useMemo } from 'react';
import type { SelectionState, ParsedElement } from '../types';
import { 
  buildSelectableTree, 
  analyzeClick,
} from '../utils/selectionUtils';
import { pluginManager } from '../plugins';

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
    });
  }, [setSelection]);

  // 선택 해제
  const handleDeselect = useCallback(() => {
    setSelection({
      mode: null,
      selectedElementId: null,
    });
  }, [setSelection]);

  // Text 모드로 전환 (텍스트 편집)
  const handleTextSelect = useCallback((textElementId: string) => {
    setSelection({
      mode: 'text',
      selectedElementId: textElementId,
    });
  }, [setSelection]);

  // 반복 요소 선택 - simplified
  const handleRepeatItemSelect = useCallback((itemId: string, _containerId: string) => {
    setSelection({
      mode: 'block',
      selectedElementId: itemId, // Use itemId as the selected element
    });
  }, [setSelection]);

  // Figma 스타일 계층적 선택 - simplified
  const handleSmartSelect = useCallback((elementId: string) => {
    const currentSelectedId = selection.selectedElementId;

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
    const clientX = e.clientX;
    const clientY = e.clientY;
    
    console.log('🖱️ Click detected at:', { x: clientX, y: clientY });

    // Use PluginManager to find selectable element at point
    const result = pluginManager.findSelectableAtPoint(clientX, clientY);
    
    if (result) {
      console.log('✅ Found selectable element:', {
        elementId: result.elementId,
        plugin: result.plugin.name,
        mode: result.mode
      });

      // Check if we're already editing this element in text mode
      if (result.mode === 'text' && 
          selection.mode === 'text' && 
          selection.selectedElementId === result.elementId) {
        console.log('📝 Already editing this text element');
        return;
      }

      // Set selection using the unified system
      setSelection({
        mode: result.mode,
        selectedElementId: result.elementId,
      });
    } else {
      console.log('🚫 No selectable elements found - deselecting');
      setSelection({
        mode: null,
        selectedElementId: null,
      });
    }
  }, [selection, setSelection]);

  // 선택된 요소의 정보 반환
  const getSelectedElementInfo = useCallback(() => {
    if (!selection.selectedElementId) return null;
    
    // Use PluginManager to get element info
    return pluginManager.getElementInfo(selection.selectedElementId);
  }, [selection.selectedElementId]);

  return {
    handleBlockSelect,
    handleTextSelect,
    handleRepeatItemSelect,
    handleDeselect,
    handleDocumentClick,
    handleSmartSelect,
    getSelectedElementInfo,
    selectableTree, // Keep for compatibility, will remove later
  };
};