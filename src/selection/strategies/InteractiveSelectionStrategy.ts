// Interactive Element Selection Strategy (buttons, links, inputs, etc.)

import { BaseSelectionStrategy } from './BaseSelectionStrategy';
import type { SelectionContext } from '../types';

export class InteractiveSelectionStrategy extends BaseSelectionStrategy {
  constructor() {
    super({
      basePriority: 80, // High priority for interactive elements
      supportedModes: ['block', 'text'],
      priorityModifiers: {
        directClick: 40,
        custom: (element, context) => {
          // Boost priority if element is focused
          if (document.activeElement === element) {
            return 20;
          }
          
          // Boost priority for form elements in edit mode
          if (context.isEditing && this.isFormElement(element)) {
            return 30;
          }
          
          return 0;
        }
      }
    });
  }
  
  private isFormElement(element: HTMLElement): boolean {
    const tagName = element.tagName.toLowerCase();
    return ['input', 'textarea', 'select'].includes(tagName);
  }
  
  protected determineMode(element: HTMLElement, context: SelectionContext): 'text' | 'block' {
    // Form elements support text mode when editing
    if (this.isFormElement(element) && context.isEditing) {
      return 'text';
    }
    
    // Buttons and links are typically block mode
    return 'block';
  }
}