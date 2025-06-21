// src/utils/selectionUtils.ts

import type { ParsedElement, SelectionState } from '../types';

export const isElementInSelectedContainer = (
  element: ParsedElement,
  selectionState: SelectionState,
  parsedElements: ParsedElement[]
): boolean => {
  const findInTree = (root: ParsedElement, targetId: string): boolean => {
    if (root.id === targetId) return true;
    if ('children' in root && root.children) {
      if (root.children.some((child) => findInTree(child, targetId)))
        return true;
    }
    if ('items' in root && root.items) {
      if (root.items.some((item) => findInTree(item, targetId))) return true;
    }
    return false;
  };

  if (selectionState.mode === 'text' && selectionState.selectedContainerId) {
    const findContainer = (
      elements: ParsedElement[]
    ): ParsedElement | null => {
      for (const el of elements) {
        if (el.id === selectionState.selectedContainerId) return el;
        if ('children' in el && el.children) {
          const found = findContainer(el.children);
          if (found) return found;
        }
        if ('items' in el && el.items) {
          const found = findContainer(el.items);
          if (found) return found;
        }
      }
      return null;
    };
    const container = findContainer(parsedElements);
    return container ? findInTree(container, element.id) : false;
  }

  if (
    selectionState.mode === 'repeat-item' &&
    selectionState.selectedRepeatItemId
  ) {
    const findItem = (elements: ParsedElement[]): ParsedElement | null => {
      for (const el of elements) {
        if (el.id === selectionState.selectedRepeatItemId) return el;
        if ('children' in el && el.children) {
          const found = findItem(el.children);
          if (found) return found;
        }
        if ('items' in el && el.items) {
          const found = findItem(el.items);
          if (found) return found;
        }
      }
      return null;
    };
    const item = findItem(parsedElements);
    return item ? findInTree(item, element.id) : false;
  }

  return false;
};