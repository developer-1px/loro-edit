// src/features/history/commands/CutRepeatItemCommand.ts

import { BaseCommand } from './BaseCommand';
import type { CommandContext } from './types';
import type { ParsedElement } from '../../../types';
import { repeatItemClipboard } from './RepeatItemClipboard';

export class CutRepeatItemCommand extends BaseCommand {
  private itemId: string;
  private previousElements: ParsedElement[] = [];
  private previousClipboardData: any = null;
  private cutItem: ParsedElement | null = null;
  private sourceContainerId: string = '';
  private sourceIndex: number = -1;

  constructor(
    itemId: string,
    context: CommandContext
  ) {
    super(
      'CutRepeatItem',
      `Cut repeat item`,
      context
    );
    this.itemId = itemId;
  }

  execute(): void {
    // Store current state for undo
    this.previousElements = JSON.parse(JSON.stringify(this.context.parsedElements));
    this.previousClipboardData = repeatItemClipboard.getData();

    // Find and remove the repeat item
    const result = this.findAndRemoveRepeatItem(this.context.parsedElements, this.itemId);
    
    if (!result.found) {
      throw new Error(`Repeat item ${this.itemId} not found`);
    }

    this.cutItem = result.item;
    this.sourceContainerId = result.containerId;
    this.sourceIndex = result.index;

    // Update elements
    this.context.setParsedElements([...result.updatedElements]);

    // Set clipboard data
    repeatItemClipboard.setData({
      item: JSON.parse(JSON.stringify(this.cutItem)), // Deep clone
      sourceContainerId: this.sourceContainerId,
      sourceIndex: this.sourceIndex,
      timestamp: Date.now(),
      operation: 'cut'
    });

    // Clear selection if cut item was selected
    if (this.context.selection.selectedElementId === this.itemId) {
      this.context.setSelection({ selectedElementId: null, mode: null });
    }

    this.markAsExecuted();
    console.log(`✂️ Cut repeat item: ${this.itemId}`);
  }

  undo(): void {
    // Restore previous state
    this.context.setParsedElements(this.previousElements);

    // Restore previous clipboard state
    if (this.previousClipboardData) {
      repeatItemClipboard.setData(this.previousClipboardData);
    } else {
      repeatItemClipboard.clear();
    }

    this.markAsUnexecuted();
    console.log(`↩️ Undid cut of repeat item: ${this.itemId}`);
  }

  private findAndRemoveRepeatItem(elements: ParsedElement[], targetId: string): {
    found: boolean;
    item: ParsedElement | null;
    containerId: string;
    index: number;
    updatedElements: ParsedElement[];
  } {
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];

      // Check if this element has children that might contain repeat items
      if ('children' in element && element.children) {
        // Look for the target repeat item in children
        const targetChildIndex = element.children.findIndex(child => 
          child.type === 'repeat-item' && child.id === targetId
        );
        
        if (targetChildIndex >= 0) {
          // Found the target repeat item, remove it
          const updatedChildren = [...element.children];
          const removedItem = updatedChildren.splice(targetChildIndex, 1)[0];
          
          // Get the index among only repeat items for proper restoration
          const repeatItems = element.children.filter(child => child.type === 'repeat-item');
          const repeatItemIndex = repeatItems.findIndex(item => item.id === targetId);
          
          const updatedElement = {
            ...element,
            children: updatedChildren
          } as ParsedElement;

          const updatedElements = [...elements];
          updatedElements[i] = updatedElement;

          return {
            found: true,
            item: removedItem,
            containerId: element.id,
            index: repeatItemIndex,
            updatedElements
          };
        }

        // Recursively search deeper in children
        const result = this.findAndRemoveRepeatItem(element.children, targetId);
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

      // Legacy: Check if this is a repeat container
      if (element.type === 'repeat-container' && 'items' in element && element.items) {
        for (let itemIndex = 0; itemIndex < element.items.length; itemIndex++) {
          const item = element.items[itemIndex];
          if (item.id === targetId) {
            // Found the target item, remove it
            const updatedItems = [...element.items];
            const removedItem = updatedItems.splice(itemIndex, 1)[0];
            
            const updatedElement = {
              ...element,
              items: updatedItems
            } as ParsedElement;

            const updatedElements = [...elements];
            updatedElements[i] = updatedElement;

            return {
              found: true,
              item: removedItem,
              containerId: element.id,
              index: itemIndex,
              updatedElements
            };
          }
        }
      }

      // Recursively search in items
      if ('items' in element && element.items) {
        const result = this.findAndRemoveRepeatItem(element.items, targetId);
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
      item: null,
      containerId: '',
      index: -1,
      updatedElements: elements
    };
  }
}