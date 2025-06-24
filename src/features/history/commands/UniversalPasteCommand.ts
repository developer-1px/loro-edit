// src/features/history/commands/UniversalPasteCommand.ts

import { BaseCommand } from './BaseCommand';
import type { CommandContext } from './types';
import type { ParsedElement } from '../../../types';
import { clipboardManager } from '../../clipboard/ClipboardManager';

export class UniversalPasteCommand extends BaseCommand {
  private targetElementId: string | null;
  private insertIndex?: number;
  private previousElements: ParsedElement[] = [];
  private previousSelection: any = null;
  private pastedElementId: string = '';

  constructor(
    targetElementId: string | null, // null for root level paste
    context: CommandContext,
    insertIndex?: number
  ) {
    super(
      'UniversalPaste',
      'Paste element',
      context
    );
    this.targetElementId = targetElementId;
    this.insertIndex = insertIndex;
  }

  canExecute(): boolean {
    return clipboardManager.hasData();
  }

  execute(): void {
    const clipboardData = clipboardManager.getData();
    if (!clipboardData) {
      throw new Error('No data in clipboard');
    }

    // Store current state for undo
    this.previousElements = JSON.parse(JSON.stringify(this.context.parsedElements));
    this.previousSelection = { ...this.context.selection };

    // Find target element if specified
    let targetElement: ParsedElement | null = null;
    if (this.targetElementId) {
      targetElement = this.findElementById(this.context.parsedElements, this.targetElementId);
    }

    // Find handler for clipboard data
    const handlers = clipboardManager.getHandlers();
    console.log('Available handlers:', handlers.map(h => h.type));
    console.log('Looking for handler for clipboard type:', clipboardData.type);
    console.log('Clipboard data:', clipboardData);
    
    // First try to find handler by exact type match
    let handler = handlers.find(h => h.type === clipboardData.type);
    
    // If no exact match, find handler that can paste this data
    if (!handler) {
      handler = handlers.find(h => h.canPaste(targetElement, clipboardData));
    }
    
    if (!handler) {
      throw new Error(`No handler found for clipboard type: ${clipboardData.type}`);
    }

    // Check if paste is allowed (redundant if we found handler via canPaste)
    if (!handler.canPaste(targetElement, clipboardData)) {
      throw new Error(`Cannot paste ${clipboardData.type} here`);
    }

    // Perform paste
    const pasteResult = handler.paste(targetElement, clipboardData, {
      parsedElements: this.context.parsedElements,
      selection: this.context.selection,
      insertIndex: this.insertIndex
    });

    if (!pasteResult.success) {
      throw new Error(pasteResult.error || 'Paste failed');
    }

    // Update elements if provided
    if (pasteResult.updatedElements) {
      this.context.setParsedElements(pasteResult.updatedElements);
    }

    // Set selection to pasted element
    if (pasteResult.pastedElementId) {
      this.pastedElementId = pasteResult.pastedElementId;
      this.context.setSelection({
        selectedElementId: this.pastedElementId,
        mode: 'block'
      });
    }

    // Clear clipboard if this was a cut operation
    if (clipboardData.operation === 'cut') {
      clipboardManager.clear();
    }

    this.markAsExecuted();
    console.log(`📌 Pasted ${handler.name}: ${this.pastedElementId}`);
  }

  undo(): void {
    // Restore previous state
    this.context.setParsedElements(this.previousElements);
    this.context.setSelection(this.previousSelection);

    this.markAsUnexecuted();
    console.log(`↩️ Undid paste: ${this.pastedElementId}`);
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