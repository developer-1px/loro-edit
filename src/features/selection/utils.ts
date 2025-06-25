import type { ParsedElement } from '../../types';
import { pluginManager } from '../../plugins';

function isElementSelectable(element: ParsedElement): boolean {
  const typeMap: Record<string, string> = {
    text: 'text',
    img: 'image',
    picture: 'image',
    svg: 'svg',
    button: 'button',
    'repeat-item': 'repeat-item',
    database: 'database',
    'repeat-container': 'repeat-container'
  };
  
  const pluginName = typeMap[element.type] || 'element';
  const plugin = pluginManager.plugins.find(p => p.name === pluginName);
  return plugin?.selectable?.enabled || false;
}

export function getSelectableElements(elements: ParsedElement[]): string[] {
  const result: string[] = [];
  
  function collect(element: ParsedElement) {
    if (isElementSelectable(element)) {
      result.push(element.id);
    }
    if ('children' in element && element.children) {
      element.children.forEach(collect);
    }
    if ('items' in element && element.items) {
      element.items.forEach(collect);
    }
  }
  
  elements.forEach(collect);
  return result;
}

export function getElementAtPoint(x: number, y: number): string | null {
  const elementsAtPoint = document.elementsFromPoint(x, y);
  
  // Skip floating UI and overlay elements
  for (const element of elementsAtPoint) {
    const htmlEl = element as HTMLElement;
    
    // Skip if it's a floating UI element
    if (htmlEl.closest('[data-radix-popover-content]') ||
        htmlEl.closest('[data-radix-tabs-content]') ||
        htmlEl.closest('[data-radix-tabs-list]') ||
        htmlEl.closest('[data-radix-tabs-trigger]') ||
        htmlEl.closest('.floating-menu') ||
        htmlEl.closest('.popover-content') ||
        htmlEl.closest('[data-selection-overlay]') ||
        htmlEl.closest('[data-preview-controls]')) {
      continue;
    }
    
    const elementId = htmlEl.dataset?.elementId;
    if (elementId) return elementId;
  }
  
  return null;
}