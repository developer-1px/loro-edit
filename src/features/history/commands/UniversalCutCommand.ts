// src/features/history/commands/UniversalCutCommand.ts

import { BaseCommand } from './BaseCommand';
import type { CommandContext } from './types';
import type { ParsedElement } from '../../../types';
import { clipboardManager } from '../../clipboard/ClipboardManager';

export class UniversalCutCommand extends BaseCommand {
  private elementId: string;
  private previousElements: ParsedElement[] = [];
  private previousClipboardData: any = null;

  constructor(
    elementId: string,
    context: CommandContext
  ) {
    super(
      'UniversalCut',
      'Cut element',
      context
    );
    this.elementId = elementId;
  }

  execute(): void {
    // Store current state for undo
    this.previousElements = JSON.parse(JSON.stringify(this.context.parsedElements));
    this.previousClipboardData = clipboardManager.getData();

    // Find and validate the element
    const element = this.validateElement(this.elementId);


    // Find handler for this element
    const handler = clipboardManager.findHandler(element);
    
    if (!handler) {
      throw new Error(`No clipboard handler found for element type`);
    }

    // Cut using handler (creates clipboard data)
    const clipboardData = handler.cut(element);
    
    if (!clipboardData) {
      throw new Error(`Failed to cut element`);
    }

    // Remove element from tree
    const updatedElements = this.removeElementFromTree(this.context.parsedElements, this.elementId);

    // Update elements
    this.context.setParsedElements(updatedElements);

    // Set clipboard data
    clipboardManager.setData(clipboardData);

    // Clear selection if cut element was selected
    if (this.context.selection.selectedElementId === this.elementId) {
      this.context.setSelection({ selectedElementId: null, mode: null });
    }

    this.markAsExecuted();
    console.log(`✂️ Cut ${handler.name}: ${this.elementId}`);
  }

  undo(): void {
    // Restore previous state
    this.context.setParsedElements(this.previousElements);

    // Restore previous clipboard state
    if (this.previousClipboardData) {
      clipboardManager.setData(this.previousClipboardData);
    } else {
      clipboardManager.clear();
    }

    this.markAsUnexecuted();
    console.log(`↩️ Undid cut: ${this.elementId}`);
  }


  private removeElementFromTree(elements: ParsedElement[], elementId: string): ParsedElement[] {
    return elements
      .map(element => {
        // If this is the element to remove, return null
        if (element.id === elementId) {
          return null;
        }
        
        // If element has children, recursively process them
        if ('children' in element && element.children && Array.isArray(element.children)) {
          const updatedChildren = this.removeElementFromTree(element.children, elementId);
          return {
            ...element,
            children: updatedChildren
          };
        }
        
        // If element has items, recursively process them
        if ('items' in element && element.items && Array.isArray(element.items)) {
          const updatedItems = this.removeElementFromTree(element.items, elementId);
          return {
            ...element,
            items: updatedItems
          };
        }
        
        return element;
      })
      .filter(element => element !== null) as ParsedElement[];
  }
}