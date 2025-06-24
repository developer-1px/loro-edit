// src/features/history/commands/UniversalCopyCommand.ts

import { BaseCommand } from './BaseCommand';
import type { CommandContext } from './types';
import type { ParsedElement } from '../../../types';
import { clipboardManager } from '../../clipboard/ClipboardManager';

export class UniversalCopyCommand extends BaseCommand {
  private elementId: string;
  private previousClipboardData: any = null;

  constructor(
    elementId: string,
    context: CommandContext
  ) {
    super(
      'UniversalCopy',
      'Copy element',
      context
    );
    this.elementId = elementId;
  }

  execute(): void {
    // Store previous clipboard state for undo
    this.previousClipboardData = clipboardManager.getData();

    // Find the element
    const element = this.findElementById(this.context.parsedElements, this.elementId);
    
    if (!element) {
      throw new Error(`Element ${this.elementId} not found`);
    }

    // Find handler for this element
    const handler = clipboardManager.findHandler(element);
    
    if (!handler) {
      throw new Error(`No clipboard handler found for element type`);
    }

    // Copy using handler
    const clipboardData = handler.copy(element);
    
    if (!clipboardData) {
      throw new Error(`Failed to copy element`);
    }

    // Set clipboard data
    clipboardManager.setData(clipboardData);

    this.markAsExecuted();
    console.log(`📋 Copied ${handler.name}: ${this.elementId}`);
  }

  undo(): void {
    // Restore previous clipboard state
    if (this.previousClipboardData) {
      clipboardManager.setData(this.previousClipboardData);
    } else {
      clipboardManager.clear();
    }

    this.markAsUnexecuted();
    console.log(`↩️ Undid copy: ${this.elementId}`);
  }

  private findElementById(elements: ParsedElement[], elementId: string): ParsedElement | null {
    for (const element of elements) {
      if (element.id === elementId) {
        return element;
      }
      
      // Search recursively in children
      if ('children' in element && element.children && Array.isArray(element.children)) {
        const found = this.findElementById(element.children, elementId);
        if (found) return found;
      }
      
      // Search in items (for repeat containers)
      if ('items' in element && element.items && Array.isArray(element.items)) {
        const found = this.findElementById(element.items, elementId);
        if (found) return found;
      }
    }
    return null;
  }
}