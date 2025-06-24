// src/features/history/commands/CopyRepeatItemCommand.ts

import { BaseCommand } from './BaseCommand';
import type { CommandContext } from './types';
import type { ParsedElement } from '../../../types';
import { repeatItemClipboard } from './RepeatItemClipboard';

export class CopyRepeatItemCommand extends BaseCommand {
  private itemId: string;
  private previousClipboardData: any = null;

  constructor(
    itemId: string,
    context: CommandContext
  ) {
    super(
      'CopyRepeatItem',
      `Copy repeat item`,
      context
    );
    this.itemId = itemId;
  }

  execute(): void {
    // Store previous clipboard state for undo
    this.previousClipboardData = repeatItemClipboard.getData();

    // Find the repeat item and its container
    const result = this.findRepeatItem(this.context.parsedElements, this.itemId);
    
    if (!result) {
      throw new Error(`Repeat item ${this.itemId} not found`);
    }

    const { item, containerId, index } = result;

    // Set clipboard data
    repeatItemClipboard.setData({
      item: JSON.parse(JSON.stringify(item)), // Deep clone
      sourceContainerId: containerId,
      sourceIndex: index,
      timestamp: Date.now(),
      operation: 'copy'
    });

    this.markAsExecuted();
    console.log(`📋 Copied repeat item: ${this.itemId}`);
  }

  undo(): void {
    // Restore previous clipboard state
    if (this.previousClipboardData) {
      repeatItemClipboard.setData(this.previousClipboardData);
    } else {
      repeatItemClipboard.clear();
    }

    this.markAsUnexecuted();
    console.log(`↩️ Undid copy of repeat item: ${this.itemId}`);
  }

  private findRepeatItem(elements: ParsedElement[], targetId: string): {
    item: ParsedElement;
    containerId: string;
    index: number;
  } | null {
    // First, try to find the repeat item directly
    const targetItem = this.findElementById(elements, targetId);
    if (targetItem && targetItem.type === 'repeat-item') {
      // Find its parent container
      const parentId = this.findRepeatItemParent(elements, targetId);
      if (parentId) {
        const parent = this.findElementById(elements, parentId);
        if (parent && 'children' in parent && parent.children) {
          // Find index among sibling repeat items
          const repeatItems = parent.children.filter(child => child.type === 'repeat-item');
          const index = repeatItems.findIndex(item => item.id === targetId);
          
          if (index >= 0) {
            return {
              item: targetItem,
              containerId: parentId,
              index: index
            };
          }
        }
      }
    }

    // Legacy: Check if this is within a repeat container
    for (const element of elements) {
      if (element.type === 'repeat-container' && 'items' in element && element.items) {
        for (let i = 0; i < element.items.length; i++) {
          const item = element.items[i];
          if (item.id === targetId) {
            return {
              item,
              containerId: element.id,
              index: i
            };
          }
        }
      }

      // Recursively search in children
      if ('children' in element && element.children) {
        const found = this.findRepeatItem(element.children, targetId);
        if (found) return found;
      }

      // Recursively search in items
      if ('items' in element && element.items) {
        const found = this.findRepeatItem(element.items, targetId);
        if (found) return found;
      }
    }

    return null;
  }

  // Helper methods (shared with PasteRepeatItemCommand)
  private findElementById(elements: ParsedElement[], targetId: string): ParsedElement | null {
    for (const element of elements) {
      if (element.id === targetId) {
        return element;
      }
      
      if ('children' in element && element.children) {
        const found = this.findElementById(element.children, targetId);
        if (found) return found;
      }
      
      if ('items' in element && element.items) {
        const found = this.findElementById(element.items, targetId);
        if (found) return found;
      }
    }
    return null;
  }

  private findRepeatItemParent(elements: ParsedElement[], itemId: string): string | null {
    for (const element of elements) {
      if ('children' in element && element.children) {
        const hasTargetChild = this.hasRepeatItemInChildren(element.children, itemId);
        if (hasTargetChild) {
          return element.id;
        }
        
        const found = this.findRepeatItemParent(element.children, itemId);
        if (found) return found;
      }
    }
    return null;
  }

  private hasRepeatItemInChildren(children: ParsedElement[], itemId: string): boolean {
    return children.some(child => {
      if (child.type === 'repeat-item' && child.id === itemId) {
        return true;
      }
      if ('children' in child && child.children) {
        return this.hasRepeatItemInChildren(child.children, itemId);
      }
      return false;
    });
  }
}