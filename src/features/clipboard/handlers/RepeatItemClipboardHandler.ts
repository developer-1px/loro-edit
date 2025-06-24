// src/features/clipboard/handlers/RepeatItemClipboardHandler.ts

import type { ClipboardHandler, ClipboardData, PasteContext, PasteResult } from '../types';
import type { ParsedElement, RegularElement } from '../../../types';

export class RepeatItemClipboardHandler implements ClipboardHandler {
  type = 'repeat-item';
  name = 'Repeat Item';
  
  canHandle(element: ParsedElement): boolean {
    const isRepeatItem = element.type === 'element' && 
                        'repeatItem' in element && 
                        (element as RegularElement).repeatItem !== undefined;
    
    if (isRepeatItem) {
      console.log('RepeatItemClipboardHandler can handle:', element);
    }
    
    return isRepeatItem;
  }
  
  canPaste(target: ParsedElement | null, clipboardData: ClipboardData): boolean {
    // Can only paste repeat items into repeat containers or after other repeat items
    if (clipboardData.type !== 'repeat-item') return false;
    
    if (!target) return false;
    
    // Check if target is a repeat item
    if (this.canHandle(target)) return true;
    
    // Check if target is a repeat container
    if (target.type === 'repeat-container') return true;
    
    return false;
  }
  
  copy(element: ParsedElement): ClipboardData | null {
    if (!this.canHandle(element)) return null;
    
    return {
      type: 'repeat-item',
      data: JSON.parse(JSON.stringify(element)), // Deep clone
      operation: 'copy',
      timestamp: Date.now()
    };
  }
  
  cut(element: ParsedElement): ClipboardData | null {
    return this.copy(element);
  }
  
  paste(target: ParsedElement | null, clipboardData: ClipboardData, context: PasteContext): PasteResult {
    if (!target || !this.canPaste(target, clipboardData)) {
      return { success: false, error: 'Cannot paste repeat item here' };
    }
    
    // Generate new IDs for pasted item
    const pastedItem = this.generateNewIds(JSON.parse(JSON.stringify(clipboardData.data)));
    
    // Ensure the pasted item is a RegularElement with repeatItem
    if (pastedItem.type !== 'element' || !pastedItem.repeatItem) {
      return { success: false, error: 'Invalid repeat item data' };
    }
    
    // Find the repeat container and insert position
    const containerInfo = this.findRepeatContainer(context.parsedElements, target.id);
    if (!containerInfo) {
      return { success: false, error: 'Cannot find repeat container' };
    }
    
    // Insert the item
    const updatedElements = this.insertRepeatItem(
      context.parsedElements,
      pastedItem as RegularElement,
      containerInfo.containerId,
      containerInfo.insertIndex
    );
    
    return {
      success: true,
      updatedElements,
      pastedElementId: pastedItem.id
    };
  }
  
  getPreview(_clipboardData: ClipboardData): string {
    return 'Repeat Item';
  }
  
  private generateNewIds(element: any): any {
    const newElement = {
      ...element,
      id: Math.random().toString(36).substr(2, 9),
      repeatItem: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
    };

    if (element.children && Array.isArray(element.children)) {
      newElement.children = element.children.map((child: any) => this.generateNewIds(child));
    }

    return newElement;
  }
  
  private findRepeatContainer(elements: ParsedElement[], targetId: string): { containerId: string; insertIndex: number } | null {
    for (const element of elements) {
      if (element.type === 'repeat-container' && element.items) {
        const itemIndex = element.items.findIndex(item => item.id === targetId);
        if (itemIndex !== -1) {
          return {
            containerId: element.id,
            insertIndex: itemIndex + 1
          };
        }
      }
      
      if ('children' in element && element.children) {
        const result = this.findRepeatContainer(element.children, targetId);
        if (result) return result;
      }
      
      if ('items' in element && element.items) {
        const result = this.findRepeatContainer(element.items, targetId);
        if (result) return result;
      }
    }
    
    return null;
  }
  
  private insertRepeatItem(elements: ParsedElement[], newItem: ParsedElement, containerId: string, insertIndex: number): ParsedElement[] {
    return elements.map(element => {
      if (element.type === 'repeat-container' && element.id === containerId) {
        const updatedItems = [...element.items];
        updatedItems.splice(insertIndex, 0, newItem as RegularElement);
        
        return {
          ...element,
          items: updatedItems
        };
      }
      
      if ('children' in element && element.children) {
        return {
          ...element,
          children: this.insertRepeatItem(element.children, newItem, containerId, insertIndex)
        };
      }
      
      if ('items' in element && element.items) {
        return {
          ...element,
          items: this.insertRepeatItem(element.items, newItem, containerId, insertIndex) as RegularElement[]
        };
      }
      
      return element;
    });
  }
}