// src/utils/selectionUtils.ts

import type { ParsedElement } from '../types';
import type { SelectableConfig } from '../plugins/types';
import { pluginManager } from '../plugins';

export interface SelectableElement {
  id: string;
  element: ParsedElement;
  path: number[]; // 경로 [parentIndex, childIndex, ...]
  level: number; // 깊이 레벨
  selectable: SelectableConfig;
  parent?: SelectableElement;
  children: SelectableElement[];
}

export interface SelectionResult {
  target: SelectableElement | null;
  alternatives: SelectableElement[]; // 같은 위치의 다른 레벨 후보들
}

/**
 * ParsedElement에서 플러그인의 selectable 설정을 가져옵니다
 */
function getSelectableConfig(element: ParsedElement): SelectableConfig | null {
  console.log('🔍 getSelectableConfig called with:', {
    type: element.type,
    id: element.id,
    tagName: 'tagName' in element ? element.tagName : 'N/A'
  });

  // 등록된 플러그인들 확인
  console.log('📦 Available plugins:', pluginManager.plugins.map(p => ({
    name: p.name,
    hasSelectable: !!p.selectable
  })));

  // 타입 기반으로 직접 플러그인 찾기
  const plugin = pluginManager.plugins.find(p => {
    // 간단한 타입 매칭
    switch (element.type) {
      case 'text':
        return p.name === 'text';
      case 'img':
      case 'picture':
        return p.name === 'image';
      case 'svg':
        return p.name === 'svg';
      case 'database':
        return p.name === 'database';
      case 'repeat-container':
        return p.name === 'repeat-container';
      case 'element':
        // section 플러그인인지 element 플러그인인지 확인
        if ('tagName' in element) {
          const tagName = element.tagName;
          if (['section', 'header', 'footer', 'nav'].includes(tagName)) {
            return p.name === 'section';
          }
        }
        return p.name === 'element';
      default:
        return false;
    }
  });

  console.log('🎯 Found plugin:', plugin?.name, 'selectable:', plugin?.selectable);

  // 플러그인이 없거나 selectable이 비활성화된 경우
  if (!plugin || !plugin.selectable?.enabled) {
    console.log('❌ Plugin not found or not selectable');
    return null;
  }

  return plugin.selectable;
}

/**
 * ParsedElement 트리를 SelectableElement 트리로 변환합니다
 */
export function buildSelectableTree(elements: ParsedElement[]): SelectableElement[] {
  console.log('🌳 buildSelectableTree called with elements:', elements.length);
  
  const result: SelectableElement[] = [];


  function collectSelectableElements(
    element: ParsedElement, 
    path: number[], 
    level: number, 
    parent?: SelectableElement
  ): SelectableElement[] {
    const selectable = getSelectableConfig(element);
    console.log(`📋 Element ${element.id} (${element.type}) selectable:`, !!selectable);
    
    const collected: SelectableElement[] = [];
    
    let selectableElement: SelectableElement | null = null;
    
    if (selectable) {
      selectableElement = {
        id: element.id,
        element,
        path,
        level,
        selectable,
        parent,
        children: []
      };
      console.log('✅ Created SelectableElement:', {
        id: selectableElement.id,
        type: element.type,
        level,
        selectableName: selectable.name
      });
      collected.push(selectableElement);
    }

    // 자식 요소들 처리
    if ('children' in element && element.children) {
      element.children.forEach((child, index) => {
        const childElements = collectSelectableElements(
          child, 
          [...path, index], 
          level + 1, 
          selectableElement || parent
        );
        if (selectableElement) {
          selectableElement.children.push(...childElements);
        } else {
          collected.push(...childElements);
        }
      });
    }

    // repeat-container의 items 처리
    if ('items' in element && element.items) {
      element.items.forEach((item, index) => {
        const itemElements = collectSelectableElements(
          item, 
          [...path, index], 
          level + 1, 
          selectableElement || parent
        );
        if (selectableElement) {
          selectableElement.children.push(...itemElements);
        } else {
          collected.push(...itemElements);
        }
      });
    }

    return collected;
  }

  elements.forEach((element, index) => {
    const selectableElements = collectSelectableElements(element, [index], 0);
    result.push(...selectableElements);
  });

  console.log('🎉 buildSelectableTree result:', {
    totalElements: result.length,
    elements: result.map(el => ({ id: el.id, type: el.element.type, name: el.selectable.name }))
  });

  return result;
}

/**
 * Figma 스타일의 계층적 선택을 위한 클릭 분석
 */
export function analyzeClick(
  clickedElementId: string,
  selectableTree: SelectableElement[],
  currentSelection: string | null
): SelectionResult {
  const allElements = flattenSelectableTree(selectableTree);
  
  // 클릭된 요소 찾기
  const clickedElement = allElements.find(el => el.id === clickedElementId);
  if (!clickedElement) {
    return { target: null, alternatives: [] };
  }

  // 현재 선택된 요소와 같은 요소를 클릭한 경우
  if (currentSelection === clickedElementId) {
    // 부모로 이동 (Figma 스타일)
    const parent = clickedElement.parent;
    if (parent) {
      return { target: parent, alternatives: getSelectableAlternatives(parent) };
    }
  }

  // 클릭 위치에서 선택 가능한 모든 대안들 수집
  const alternatives = getSelectableAlternatives(clickedElement);
  
  // inline 요소들의 경우 그룹으로 처리
  const inlineGroup = getInlineGroup(clickedElement, alternatives);
  if (inlineGroup.length > 1) {
    // inline 그룹이 있으면 가장 적절한 요소 선택
    const target = selectBestInlineElement(inlineGroup, clickedElement);
    return { target, alternatives: inlineGroup };
  }

  return { target: clickedElement, alternatives };
}

/**
 * 선택 가능한 대안들을 수집합니다 (같은 위치의 상위/하위 요소들)
 */
function getSelectableAlternatives(
  element: SelectableElement
): SelectableElement[] {
  const alternatives: SelectableElement[] = [element];
  
  // 부모들 추가
  let current = element.parent;
  while (current) {
    alternatives.push(current);
    current = current.parent;
  }
  
  // 자식들 추가 (첫 번째 레벨만)
  element.children.forEach(child => {
    alternatives.push(child);
  });

  return alternatives.sort((a, b) => a.level - b.level);
}

/**
 * inline 요소들의 그룹을 찾습니다
 */
function getInlineGroup(
  element: SelectableElement, 
  alternatives: SelectableElement[]
): SelectableElement[] {
  const inlineElements = alternatives.filter(el => 
    el.selectable.elementType === 'inline'
  );
  
  if (inlineElements.length <= 1) return [element];
  
  // 같은 부모를 가진 inline 요소들만 그룹화
  const sameParentInlines = inlineElements.filter(el => 
    el.parent?.id === element.parent?.id
  );
  
  return sameParentInlines.length > 1 ? sameParentInlines : [element];
}

/**
 * inline 그룹에서 최적의 요소를 선택합니다
 */
function selectBestInlineElement(
  inlineGroup: SelectableElement[], 
  clickedElement: SelectableElement
): SelectableElement {
  // 클릭된 요소가 inline 그룹에 있으면 그것을 선택
  if (inlineGroup.includes(clickedElement)) {
    return clickedElement;
  }
  
  // 그렇지 않으면 첫 번째 inline 요소 선택
  return inlineGroup[0];
}

/**
 * SelectableElement 트리를 평면 배열로 변환합니다
 */
function flattenSelectableTree(tree: SelectableElement[]): SelectableElement[] {
  const result: SelectableElement[] = [];
  
  function traverse(elements: SelectableElement[]) {
    elements.forEach(element => {
      result.push(element);
      traverse(element.children);
    });
  }
  
  traverse(tree);
  return result;
}

/**
 * 요소 ID로 DOM 셀렉터를 생성합니다
 */
export function generateSelector(elementId: string, mode: 'block' | 'text' = 'block'): string {
  if (mode === 'text') {
    return `[data-text-element-id="${elementId}"]`;
  }
  return `[data-block-element-id="${elementId}"]`;
}

/**
 * 주어진 좌표에서 선택 가능한 요소를 찾습니다
 */
export function getElementAtPoint(
  x: number, 
  y: number, 
  selectableTree: SelectableElement[]
): SelectableElement | null {
  const allElements = flattenSelectableTree(selectableTree);
  
  // DOM 요소들에서 좌표에 해당하는 요소 찾기
  const elementAtPoint = document.elementFromPoint(x, y);
  if (!elementAtPoint) return null;
  
  // 가장 가까운 선택 가능한 요소 찾기
  let currentElement: Element | null = elementAtPoint;
  while (currentElement) {
    const elementId = currentElement.getAttribute('data-block-element-id') ||
                     currentElement.getAttribute('data-text-element-id');
    
    if (elementId) {
      const selectableElement = allElements.find(el => el.id === elementId);
      if (selectableElement) return selectableElement;
    }
    
    currentElement = currentElement.parentElement;
  }
  
  return null;
}