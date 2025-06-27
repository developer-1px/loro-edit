// Container Selection Strategy (for sections, divs, etc.)

import { BaseSelectionStrategy } from './BaseSelectionStrategy';
import type { SelectionContext, SelectionCandidate } from '../types';

export class ContainerSelectionStrategy extends BaseSelectionStrategy {
  constructor(priority: number = 10) {
    super({
      basePriority: priority, // Low base priority for containers
      supportedModes: ['block'],
      priorityModifiers: {
        directClick: 20,
        containsSelection: -10, // Lower priority if it contains current selection
        custom: (element, context) => {
          // Boost priority if clicking on empty space
          if (this.isEmptySpaceClick(element, context)) {
            return 50;
          }
          
          // Lower priority if has many children (prefer specific elements)
          const childCount = element.querySelectorAll('[data-element-id]').length;
          if (childCount > 3) {
            return -10;
          }
          
          return 0;
        }
      }
    });
  }
  
  private isEmptySpaceClick(element: HTMLElement, context: SelectionContext): boolean {
    // Check if we're clicking on the element itself, not its children
    const firstElement = context.elementsAtPoint[0];
    
    // If the first element is this container, it's likely empty space
    if (firstElement === element) {
      return true;
    }
    
    // Check if click is on padding/margin area
    const rect = element.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(element);
    const paddingTop = parseFloat(computedStyle.paddingTop);
    const paddingLeft = parseFloat(computedStyle.paddingLeft);
    const paddingRight = parseFloat(computedStyle.paddingRight);
    const paddingBottom = parseFloat(computedStyle.paddingBottom);
    
    const contentBox = {
      left: rect.left + paddingLeft,
      top: rect.top + paddingTop,
      right: rect.right - paddingRight,
      bottom: rect.bottom - paddingBottom
    };
    
    // If click is outside content box, it's on padding
    const { x, y } = context.point;
    if (x < contentBox.left || x > contentBox.right || 
        y < contentBox.top || y > contentBox.bottom) {
      return true;
    }
    
    return false;
  }
  
  compare(a: SelectionCandidate, b: SelectionCandidate, context: SelectionContext): number {
    // For containers, prefer the smallest container that contains the click
    if (a.pluginName === 'section' && b.pluginName === 'section') {
      const aElement = a.element;
      const bElement = b.element;
      
      // If one contains the other, prefer the inner one
      if (aElement.contains(bElement)) return -1;
      if (bElement.contains(aElement)) return 1;
    }
    
    return super.compare(a, b, context);
  }
}