// src/utils/parentElementUtils.ts

import { pluginManager } from '../plugins';
import type { ParsedElement } from '../types';

/**
 * 주어진 요소의 상위 요소들 중에서 특정 플러그인에 해당하는 요소를 찾습니다
 */
export function findParentWithPlugin(
  elementId: string, 
  pluginName: string,
  parsedElements: ParsedElement[]
): ParsedElement | null {
  
  // DOM에서 현재 요소 찾기
  const currentElement = document.querySelector(`[data-element-id="${elementId}"]`);
  if (!currentElement) return null;

  // 상위 DOM 요소들을 순회하면서 링크 찾기
  let parentElement = currentElement.parentElement;
  
  while (parentElement) {
    const parentElementId = parentElement.getAttribute('data-element-id');
    if (parentElementId) {
      const plugin = pluginManager.getPluginById(parentElementId);
      if (plugin && plugin.name === pluginName) {
        // 해당 플러그인의 요소를 찾았으면 ParsedElement 반환
        return findParsedElementById(parentElementId, parsedElements);
      }
    }
    parentElement = parentElement.parentElement;
  }
  
  return null;
}

/**
 * ParsedElement 트리에서 ID로 요소를 찾습니다
 */
function findParsedElementById(
  elementId: string, 
  elements: ParsedElement[]
): ParsedElement | null {
  for (const element of elements) {
    if (element.id === elementId) {
      return element;
    }
    
    if ('children' in element && element.children) {
      const found = findParsedElementById(elementId, element.children);
      if (found) return found;
    }
    
    if ('items' in element && element.items) {
      const found = findParsedElementById(elementId, element.items);
      if (found) return found;
    }
  }
  
  return null;
}

/**
 * 요소가 링크 안에 있는지 확인하고 링크 정보를 반환합니다
 */
export function getParentLinkInfo(
  elementId: string,
  parsedElements: ParsedElement[]
): ParsedElement | null {
  return findParentWithPlugin(elementId, 'link', parsedElements);
}