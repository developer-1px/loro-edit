// Base Selection Strategy - Common selection behaviors

import type { SelectionStrategy, SelectionContext, SelectionCandidate } from '../types';

export interface BaseStrategyConfig {
  // Base priority for this element type
  basePriority: number;
  
  // Selection modes this element supports
  supportedModes: ('text' | 'block')[];
  
  // Whether this element is selectable
  selectable?: boolean;
  
  // Priority modifiers
  priorityModifiers?: {
    // Increase priority when element is directly clicked
    directClick?: number;
    
    // Increase priority when element contains current selection
    containsSelection?: number;
    
    // Increase priority when element is child of current selection
    childOfSelection?: number;
    
    // Custom modifier function
    custom?: (element: HTMLElement, context: SelectionContext) => number;
  };
}

export class BaseSelectionStrategy implements SelectionStrategy {
  protected config: BaseStrategyConfig;
  
  constructor(config: BaseStrategyConfig) {
    this.config = config;
  }
  
  evaluate(element: HTMLElement, context: SelectionContext): SelectionCandidate | null {
    // Skip if not selectable
    if (this.config.selectable === false) {
      return null;
    }
    
    const elementId = element.getAttribute('data-element-id');
    if (!elementId) return null;
    
    // Calculate priority
    let priority = this.config.basePriority;
    
    // Apply modifiers
    if (this.config.priorityModifiers) {
      const modifiers = this.config.priorityModifiers;
      
      // Direct click bonus
      if (modifiers.directClick && this.isDirectClick(element, context)) {
        priority += modifiers.directClick;
      }
      
      // Contains current selection bonus
      if (modifiers.containsSelection && context.currentSelection) {
        const currentElement = document.querySelector(
          `[data-element-id="${context.currentSelection.elementId}"]`
        );
        if (currentElement && element.contains(currentElement)) {
          priority += modifiers.containsSelection;
        }
      }
      
      // Child of current selection bonus
      if (modifiers.childOfSelection && context.currentSelection) {
        const currentElement = document.querySelector(
          `[data-element-id="${context.currentSelection.elementId}"]`
        );
        if (currentElement && currentElement.contains(element)) {
          priority += modifiers.childOfSelection;
        }
      }
      
      // Custom modifier
      if (modifiers.custom) {
        priority += modifiers.custom(element, context);
      }
    }
    
    // Determine selection mode
    const mode = this.determineMode(element, context);
    
    return {
      element,
      elementId,
      priority,
      mode,
      reason: this.getSelectionReason(element, context),
      pluginName: element.getAttribute('data-plugin-name') || 'unknown'
    };
  }
  
  protected isDirectClick(element: HTMLElement, context: SelectionContext): boolean {
    // Check if the click point is directly on this element
    // (not just within its bounds, but actually on its content)
    const firstElement = context.elementsAtPoint[0];
    
    // Direct click if this element is the topmost
    if (firstElement === element) return true;
    
    // Also consider direct click if only transparent overlays are above
    const index = context.elementsAtPoint.indexOf(element);
    if (index > 0) {
      // Check if all elements above are overlays or have pointer-events: none
      const elementsAbove = context.elementsAtPoint.slice(0, index);
      return elementsAbove.every(el => {
        const style = window.getComputedStyle(el);
        return style.pointerEvents === 'none' || 
               el.classList.contains('selection-overlay') ||
               el.hasAttribute('data-selection-overlay');
      });
    }
    
    return false;
  }
  
  protected determineMode(_element: HTMLElement, context: SelectionContext): 'text' | 'block' {
    // Default implementation - can be overridden
    const supportedModes = this.config.supportedModes;
    
    // If only one mode is supported, use it
    if (supportedModes.length === 1) {
      return supportedModes[0];
    }
    
    // If in text mode and element supports it, stay in text mode
    if (context.currentSelection?.mode === 'text' && supportedModes.includes('text')) {
      return 'text';
    }
    
    // Default to first supported mode
    return supportedModes[0];
  }
  
  protected getSelectionReason(element: HTMLElement, context: SelectionContext): string {
    if (this.isDirectClick(element, context)) {
      return 'Direct click on element';
    }
    
    if (context.currentSelection) {
      const currentElement = document.querySelector(
        `[data-element-id="${context.currentSelection.elementId}"]`
      );
      if (currentElement?.contains(element)) {
        return 'Child of current selection';
      }
      if (element.contains(currentElement)) {
        return 'Parent of current selection';
      }
    }
    
    return 'Element in click hierarchy';
  }
  
  compare(a: SelectionCandidate, b: SelectionCandidate, _context: SelectionContext): number {
    // Default comparison - by priority
    return a.priority - b.priority;
  }
}