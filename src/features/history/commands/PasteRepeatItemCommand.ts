// src/features/history/commands/PasteRepeatItemCommand.ts

import { BaseCommand } from './BaseCommand';
import type { CommandContext } from './types';
import type { ParsedElement, RegularElement } from '../../../types';
import { repeatItemClipboard } from './RepeatItemClipboard';

export class PasteRepeatItemCommand extends BaseCommand {
  private targetContainerId: string;
  private insertAfterIndex: number;
  private previousElements: ParsedElement[] = [];
  private pastedItemId: string = '';
  private previousSelection: any = null;

  constructor(
    targetContainerId: string,
    insertAfterIndex: number, // Index of selected item to paste after (-1 for beginning)
    context: CommandContext
  ) {
    super(
      'PasteRepeatItem',
      `Paste repeat item after position ${insertAfterIndex + 1}`,
      context
    );
    this.targetContainerId = targetContainerId;
    this.insertAfterIndex = insertAfterIndex;
  }

  canExecute(): boolean {
    return repeatItemClipboard.hasData();
  }

  execute(): void {
    const clipboardData = repeatItemClipboard.getData();
    if (!clipboardData) {
      throw new Error('No repeat item in clipboard');
    }

    // Store current state for undo
    this.previousElements = JSON.parse(JSON.stringify(this.context.parsedElements));
    this.previousSelection = { ...this.context.selection };

    // Generate new IDs for the pasted item (deep clone with new IDs)
    const pastedItem = this.generateNewIds(JSON.parse(JSON.stringify(clipboardData.item))) as RegularElement;
    this.pastedItemId = pastedItem.id;

    // Find target container and insert the item
    const result = this.insertRepeatItem(this.context.parsedElements, this.targetContainerId, pastedItem, this.insertAfterIndex);
    
    if (!result.found) {
      throw new Error(`Target container ${this.targetContainerId} not found`);
    }

    // Update elements
    this.context.setParsedElements([...result.updatedElements]);

    // Set selection to the pasted item
    this.context.setSelection({
      selectedElementId: this.pastedItemId,
      mode: 'block'
    });

    // Note: Keep clipboard data even after cut operation
    // This allows multiple pastes after cut (like copy behavior)
    // Uncomment below to clear clipboard after cut (standard behavior)
    // if (clipboardData.operation === 'cut') {
    //   repeatItemClipboard.clear();
    // }

    this.markAsExecuted();
    console.log(`📌 Pasted repeat item: ${this.pastedItemId} after index ${this.insertAfterIndex}`);
  }

  undo(): void {
    // Restore previous state
    this.context.setParsedElements(this.previousElements);
    this.context.setSelection(this.previousSelection);

    this.markAsUnexecuted();
    console.log(`↩️ Undid paste of repeat item: ${this.pastedItemId}`);
  }

  private insertRepeatItem(elements: ParsedElement[], targetContainerId: string, item: RegularElement, afterIndex: number): {
    found: boolean;
    updatedElements: ParsedElement[];
  } {
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];

      // Check if this is the target container (parent of repeat items)
      if (element.id === targetContainerId && 'children' in element && element.children) {
        const updatedChildren = [...element.children];
        
        // Find the position to insert (after the specified repeat item index)
        const repeatItemChildren = updatedChildren.filter(child => child.type === 'repeat-item');
        
        if (afterIndex >= 0 && afterIndex < repeatItemChildren.length) {
          // Find the actual position in children array
          const targetRepeatItem = repeatItemChildren[afterIndex];
          const targetPosition = updatedChildren.findIndex(child => child.id === targetRepeatItem.id);
          
          // Insert after the target position
          updatedChildren.splice(targetPosition + 1, 0, item);
        } else {
          // Insert at the beginning or end based on afterIndex
          if (afterIndex === -1) {
            // Insert at beginning of repeat items
            const firstRepeatItemIndex = updatedChildren.findIndex(child => child.type === 'repeat-item');
            if (firstRepeatItemIndex >= 0) {
              updatedChildren.splice(firstRepeatItemIndex, 0, item);
            } else {
              updatedChildren.push(item);
            }
          } else {
            // Insert at end of repeat items
            let lastRepeatItemIndex = -1;
            for (let i = updatedChildren.length - 1; i >= 0; i--) {
              if (updatedChildren[i].type === 'repeat-item') {
                lastRepeatItemIndex = i;
                break;
              }
            }
            if (lastRepeatItemIndex >= 0) {
              updatedChildren.splice(lastRepeatItemIndex + 1, 0, item);
            } else {
              updatedChildren.push(item);
            }
          }
        }

        const updatedElement = {
          ...element,
          children: updatedChildren
        } as ParsedElement;

        const updatedElements = [...elements];
        updatedElements[i] = updatedElement;

        return {
          found: true,
          updatedElements
        };
      }

      // Check if this is the target repeat container (legacy structure)
      if (element.type === 'repeat-container' && element.id === targetContainerId && 'items' in element) {
        const updatedItems = [...element.items];
        
        // Insert after the specified index (or at beginning if -1)
        const insertIndex = afterIndex + 1;
        updatedItems.splice(insertIndex, 0, item);

        const updatedElement = {
          ...element,
          items: updatedItems
        } as ParsedElement;

        const updatedElements = [...elements];
        updatedElements[i] = updatedElement;

        return {
          found: true,
          updatedElements
        };
      }

      // Recursively search in children
      if ('children' in element && element.children) {
        const result = this.insertRepeatItem(element.children, targetContainerId, item, afterIndex);
        if (result.found) {
          const updatedElement = {
            ...element,
            children: result.updatedElements
          } as ParsedElement;

          const updatedElements = [...elements];
          updatedElements[i] = updatedElement;

          return {
            found: true,
            updatedElements
          };
        }
      }

      // Recursively search in items
      if ('items' in element && element.items) {
        const result = this.insertRepeatItem(element.items, targetContainerId, item, afterIndex);
        if (result.found) {
          const updatedElement = {
            ...element,
            items: result.updatedElements
          } as ParsedElement;

          const updatedElements = [...elements];
          updatedElements[i] = updatedElement;

          return {
            found: true,
            updatedElements
          };
        }
      }
    }

    return {
      found: false,
      updatedElements: elements
    };
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

  // Helper method to get the index of a specific repeat item within its container
  static getRepeatItemIndex(elements: ParsedElement[], itemId: string): { containerId: string; index: number } | null {
    // First, search the entire tree to find the element
    const targetElement = PasteRepeatItemCommand.findElementById(elements, itemId);
    
    if (targetElement && targetElement.type === 'repeat-item') {
      // Now find its parent container
      const parentContainerId = PasteRepeatItemCommand.findRepeatItemParent(elements, itemId);
      
      if (parentContainerId) {
        // Find the index among siblings
        const siblingIndex = PasteRepeatItemCommand.findRepeatItemSiblingIndex(elements, itemId);
        
        if (siblingIndex >= 0) {
          return {
            containerId: parentContainerId,
            index: siblingIndex
          };
        }
      }
      return null;
    }
    
    // Legacy search logic for backward compatibility
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];

      // Check if this is a repeat container
      if (element.type === 'repeat-container' && 'items' in element && element.items) {
        for (let j = 0; j < element.items.length; j++) {
          const item = element.items[j];
          if (item.id === itemId) {
            return {
              containerId: element.id,
              index: j
            };
          }
        }
      }

      // Recursively search in children
      if ('children' in element && element.children) {
        const found = PasteRepeatItemCommand.getRepeatItemIndex(element.children, itemId);
        if (found) return found;
      }

      // Recursively search in items
      if ('items' in element && element.items) {
        const found = PasteRepeatItemCommand.getRepeatItemIndex(element.items, itemId);
        if (found) return found;
      }
    }

    return null;
  }

  // Helper to find the parent container ID for a repeat item
  static findRepeatItemParent(elements: ParsedElement[], itemId: string): string | null {
    // For now, use a simple approach: find the parent section/container
    // This could be improved to be more sophisticated
    for (const element of elements) {
      if ('children' in element && element.children) {
        const hasTargetChild = PasteRepeatItemCommand.hasRepeatItemInChildren(element.children, itemId);
        
        if (hasTargetChild) {
          return element.id;
        }
        
        // Recursively search deeper
        const found = PasteRepeatItemCommand.findRepeatItemParent(element.children, itemId);
        if (found) return found;
      }
    }
    return null;
  }

  // Helper to check if children contain the target repeat item (direct children only)
  static hasRepeatItemInChildren(children: ParsedElement[], itemId: string): boolean {
    // Only check direct children, not nested
    return children.some(child => child.type === 'repeat-item' && child.id === itemId);
  }

  // Helper to find the index among sibling repeat items
  static findRepeatItemSiblingIndex(elements: ParsedElement[], itemId: string): number {
    // Find all repeat items with same data-repeat-item attribute
    const targetElement = PasteRepeatItemCommand.findElementById(elements, itemId);
    if (!targetElement || targetElement.type !== 'repeat-item') {
      return -1;
    }

    const parentId = PasteRepeatItemCommand.findRepeatItemParent(elements, itemId);
    if (!parentId) {
      return -1;
    }

    const parent = PasteRepeatItemCommand.findElementById(elements, parentId);
    if (!parent || !('children' in parent) || !parent.children) {
      return -1;
    }
    
    // Find all repeat items in the parent
    const repeatItems = parent.children.filter(child => child.type === 'repeat-item');
    const index = repeatItems.findIndex(item => item.id === itemId);
    
    return index;
  }

  // Helper to find element by ID in tree
  static findElementById(elements: ParsedElement[], targetId: string): ParsedElement | null {
    for (const element of elements) {
      if (element.id === targetId) {
        return element;
      }
      
      if ('children' in element && element.children) {
        const found = PasteRepeatItemCommand.findElementById(element.children, targetId);
        if (found) return found;
      }
      
      if ('items' in element && element.items) {
        const found = PasteRepeatItemCommand.findElementById(element.items, targetId);
        if (found) return found;
      }
    }
    return null;
  }
}