import type { ParsedElement } from '../types';
import { pluginManager } from '../plugins';

function isElementSelectable(element: ParsedElement): boolean {
  const typeMap: Record<string, string> = {
    text: 'text',
    img: 'image',
    picture: 'image',
    svg: 'svg',
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
  const elementAtPoint = document.elementFromPoint(x, y);
  if (!elementAtPoint) return null;
  
  let currentElement: Element | null = elementAtPoint;
  while (currentElement) {
    const elementId = (currentElement as HTMLElement).dataset?.elementId;
    if (elementId) return elementId;
    currentElement = currentElement.parentElement;
  }
  return null;
}