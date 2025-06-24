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

    // Validate element exists
    const element = this.validateElement(this.elementId);

    // Check if this is a collection type or non-collection type
    const isCollectionType = this.isCollectionElement(element);
    
    if (isCollectionType) {
      // For collection types, remove the element entirely
      const updatedElements = this.removeElement(this.elementId);
      this.context.setParsedElements(updatedElements);
      console.log(`🗑️ Deleted collection element: ${this.elementId}`);
      
      // Clear selection only for collection types since element is removed
      if (this.context.selection.selectedElementId === this.elementId) {
        this.context.setSelection({ selectedElementId: null, mode: null });
      }
    } else {
      // For non-collection types, clear content but keep structure
      const updatedElements = this.clearElementContent(this.context.parsedElements, this.elementId);
      this.context.setParsedElements(updatedElements);
      console.log(`🧹 Cleared content of element: ${this.elementId}`);
      
      // Keep selection for non-collection types since element still exists
      // This allows users to immediately paste new content or perform other operations
    }
    
    this.markAsExecuted();
  }

  undo(): void {
    // Restore previous state
    this.context.setParsedElements(this.previousElements);
    this.markAsUnexecuted();
    console.log(`↩️ Restored element: ${this.elementId}`);
  }

  private isCollectionElement(element: ParsedElement): boolean {
    // Collection types that should be fully deleted
    if (element.type === 'repeat-container') return true;
    if (element.type === 'repeat-item') return true;
    if (element.type === 'element' && 'tagName' in element && element.tagName === 'section') return true;
    
    // All other types (image, svg, button, text, etc.) are non-collection
    return false;
  }

  private clearElementContent(_elements: ParsedElement[], targetId: string): ParsedElement[] {
    return this.updateElement(targetId, (element) => {
      // Clear content based on element type
      if (element.type === 'img' || element.type === 'picture') {
        return {
          ...element,
          src: '',
          alt: ''
        } as ParsedElement;
      } else if (element.type === 'svg') {
        return {
          ...element,
          svgContent: ''
        } as ParsedElement;
      } else if (element.type === 'text') {
        return {
          ...element,
          content: ''
        } as ParsedElement;
      } else if (element.type === 'element') {
        // For regular elements like button, clear text content
        return {
          ...element,
          children: []
        } as ParsedElement;
      }
      return element;
    });
  }

}