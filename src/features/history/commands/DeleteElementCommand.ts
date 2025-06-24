// src/commands/DeleteElementCommand.ts

import { BaseCommand } from './BaseCommand';
import type { CommandContext } from './types';
import type { ParsedElement } from '../../../types';

export class DeleteElementCommand extends BaseCommand {
  private elementId: string;
  private previousElements: ParsedElement[] = [];

  constructor(
    elementId: string,
    context: CommandContext
  ) {
    super(
      'DeleteElement',
      `Delete element`,
      context
    );
    this.elementId = elementId;
  }

  execute(): void {
    // Store current state for undo
    this.previousElements = JSON.parse(JSON.stringify(this.context.parsedElements));

    // Find and remove the element
    const result = this.findAndRemoveElement(this.context.parsedElements, this.elementId);
    
    if (result.found) {
      this.context.setParsedElements([...result.updatedElements]);
      
      // Clear selection if deleted element was selected
      if (this.context.selection.selectedElementId === this.elementId) {
        this.context.setSelection({ selectedElementId: null, mode: null });
      }
      
      this.markAsExecuted();
      console.log(`🗑️ Deleted element: ${this.elementId}`);
    } else {
      throw new Error(`Element ${this.elementId} not found`);
    }
  }

  undo(): void {
    // Restore previous state
    this.context.setParsedElements(this.previousElements);
    this.markAsUnexecuted();
    console.log(`↩️ Restored element: ${this.elementId}`);
  }

  private findAndRemoveElement(elements: ParsedElement[], targetId: string, parentId: string | null = null): {
    found: boolean;
    element: ParsedElement | null;
    parentId: string | null;
    index: number;
    updatedElements: ParsedElement[];
  } {
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      
      if (element.id === targetId) {
        const updatedElements = [...elements];
        updatedElements.splice(i, 1);
        return {
          found: true,
          element,
          parentId,
          index: i,
          updatedElements
        };
      }

      // Search in children
      if ('children' in element && element.children) {
        const result = this.findAndRemoveElement(element.children, targetId, element.id);
        if (result.found) {
          const updatedElement = {
            ...element,
            children: result.updatedElements
          } as ParsedElement;
          const updatedElements = [...elements];
          updatedElements[i] = updatedElement;
          return {
            ...result,
            updatedElements
          };
        }
      }

      // Search in items
      if ('items' in element && element.items) {
        const result = this.findAndRemoveElement(element.items, targetId, element.id);
        if (result.found) {
          const updatedElement = {
            ...element,
            items: result.updatedElements
          } as ParsedElement;
          const updatedElements = [...elements];
          updatedElements[i] = updatedElement;
          return {
            ...result,
            updatedElements
          };
        }
      }
    }

    return {
      found: false,
      element: null,
      parentId: null,
      index: -1,
      updatedElements: elements
    };
  }
}