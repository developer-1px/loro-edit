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
  
  for (const element of elementsAtPoint) {
    const elementId = (element as HTMLElement).dataset?.elementId;
    if (elementId) return elementId;
  }
  
  return null;
}