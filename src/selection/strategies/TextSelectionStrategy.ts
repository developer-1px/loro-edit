// Text Selection Strategy

import { BaseSelectionStrategy } from './BaseSelectionStrategy';
import type { SelectionContext, SelectionCandidate } from '../types';

export class TextSelectionStrategy extends BaseSelectionStrategy {
  constructor() {
    super({
      basePriority: 100, // High priority for text
      supportedModes: ['text'],
      priorityModifiers: {
        directClick: 50,
        custom: (_element, context) => {
          // Boost priority if we're already in text mode
          if (context.currentSelection?.mode === 'text') {
            return 20;
          }
          
          // Boost priority for double-click (text selection)
          if (context.clickType === 'double') {
            return 30;
          }
          
          return 0;
        }
      }
    });
  }
  
  evaluate(element: HTMLElement, context: SelectionContext): SelectionCandidate | null {
    const candidate = super.evaluate(element, context);
    if (!candidate) return null;
    
    // Text elements are always selectable
    return {
      ...candidate,
      reason: this.getTextSelectionReason(element, context)
    };
  }
  
  private getTextSelectionReason(_element: HTMLElement, context: SelectionContext): string {
    if (context.clickType === 'double') {
      return 'Double-click for text selection';
    }
    
    if (context.currentSelection?.mode === 'text') {
      return 'Continuing text selection';
    }
    
    if (this.isDirectClick(_element, context)) {
      return 'Direct click on text';
    }
    
    return 'Text element in hierarchy';
  }
}