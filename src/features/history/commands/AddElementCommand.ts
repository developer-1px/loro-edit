// src/commands/AddElementCommand.ts

import { BaseCommand } from './BaseCommand';
import type { CommandContext } from './types';
import type { ParsedElement, RegularElement } from '../../../types';

export class AddElementCommand extends BaseCommand {
  private containerId: string;
  private previousElements: ParsedElement[] = [];

  constructor(
    containerId: string,
    context: CommandContext
  ) {
    super(
      'AddElement',
      `Add item to container`,
      context
    );
    this.containerId = containerId;
  }

  execute(): void {
    // Store current state for undo
    this.previousElements = JSON.parse(JSON.stringify(this.context.parsedElements));

    // Find the container and add new item
    const updatedElements = this.addItemToContainer(this.context.parsedElements, this.containerId);
    
    if (updatedElements) {
      this.context.setParsedElements(updatedElements);
      this.markAsExecuted();
      console.log(`➕ Added item to container: ${this.containerId}`);
    } else {
      throw new Error(`Container ${this.containerId} not found`);
    }
  }

  undo(): void {
    // Restore previous state
    this.context.setParsedElements(this.previousElements);
    this.markAsUnexecuted();
    console.log(`↩️ Removed added item from container: ${this.containerId}`);
  }

  private addItemToContainer(elements: ParsedElement[], containerId: string): ParsedElement[] | null {
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      
      if (element.type === "repeat-container" && element.id === containerId) {
        if (element.items.length === 0) return elements;
        
        const template = element.items[0];
        const newItem = this.generateNewIds(JSON.parse(JSON.stringify(template))) as RegularElement;
        
        const updatedElement = {
          ...element,
          items: [...element.items, newItem]
        } as ParsedElement;
        
        const updatedElements = [...elements];
        updatedElements[i] = updatedElement;
        return updatedElements;
      }

      // Search in children
      if ('children' in element && element.children) {
        const result = this.addItemToContainer(element.children, containerId);
        if (result) {
          const updatedElement = { ...element, children: result } as ParsedElement;
          const updatedElements = [...elements];
          updatedElements[i] = updatedElement;
          return updatedElements;
        }
      }

      // Search in items
      if ('items' in element && element.items) {
        const result = this.addItemToContainer(element.items, containerId);
        if (result) {
          const updatedElement = { ...element, items: result } as ParsedElement;
          const updatedElements = [...elements];
          updatedElements[i] = updatedElement;
          return updatedElements;
        }
      }
    }

    return null;
  }

  private generateNewIds(element: ParsedElement): ParsedElement {
    const newElement = {
      ...element,
      id: Math.random().toString(36).substr(2, 9),
    };

    if ("children" in newElement && newElement.children) {
      newElement.children = newElement.children.map((child: ParsedElement) => this.generateNewIds(child));
    }
    if ("items" in newElement && newElement.items) {
      newElement.items = newElement.items.map((item: ParsedElement) => this.generateNewIds(item) as RegularElement);
    }
    if ("repeatItem" in newElement && newElement.repeatItem) {
      (newElement as RegularElement).repeatItem = `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    }

    return newElement;
  }
}