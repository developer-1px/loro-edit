// src/commands/DeleteElementCommand.ts

import { BaseCommand } from './BaseCommand';
import type { CommandContext } from './types';
import type { ParsedElement, RegularElement } from '../../../types';

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

    // First, find the element to determine its type
    const elementInfo = this.findElement(this.context.parsedElements, this.elementId);
    
    if (!elementInfo.found || !elementInfo.element) {
      throw new Error(`Element ${this.elementId} not found`);
    }

    // Check if this is a collection type or non-collection type
    const isCollectionType = this.isCollectionElement(elementInfo.element);
    
    if (isCollectionType) {
      // For collection types, remove the element entirely
      const result = this.findAndRemoveElement(this.context.parsedElements, this.elementId);
      if (result.found) {
        this.context.setParsedElements([...result.updatedElements]);
        console.log(`🗑️ Deleted collection element: ${this.elementId}`);
      }
    } else {
      // For non-collection types, clear content but keep structure
      const result = this.clearElementContent(this.context.parsedElements, this.elementId);
      if (result.found) {
        this.context.setParsedElements([...result.updatedElements]);
        console.log(`🧹 Cleared content of element: ${this.elementId}`);
      }
    }
    
    // Clear selection if deleted element was selected
    if (this.context.selection.selectedElementId === this.elementId) {
      this.context.setSelection({ selectedElementId: null, mode: null });
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

  private findElement(elements: ParsedElement[], targetId: string): {
    found: boolean;
    element: ParsedElement | null;
  } {
    for (const element of elements) {
      if (element.id === targetId) {
        return { found: true, element };
      }

      // Search in children
      if ('children' in element && element.children) {
        const result = this.findElement(element.children, targetId);
        if (result.found) return result;
      }

      // Search in items
      if ('items' in element && element.items) {
        const result = this.findElement(element.items, targetId);
        if (result.found) return result;
      }
    }

    return { found: false, element: null };
  }

  private clearElementContent(elements: ParsedElement[], targetId: string): {
    found: boolean;
    updatedElements: ParsedElement[];
  } {
    const updatedElements = elements.map(element => {
      if (element.id === targetId) {
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
      }

      // Process children
      if ('children' in element && element.children) {
        const result = this.clearElementContent(element.children, targetId);
        if (result.found) {
          return {
            ...element,
            children: result.updatedElements
          } as ParsedElement;
        }
      }

      // Process items
      if ('items' in element && element.items) {
        const result = this.clearElementContent(element.items, targetId);
        if (result.found) {
          return {
            ...element,
            items: result.updatedElements as RegularElement[]
          } as ParsedElement;
        }
      }

      return element;
    });

    // Check if we found and updated the element
    const found = JSON.stringify(updatedElements) !== JSON.stringify(elements);
    return { found, updatedElements };
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