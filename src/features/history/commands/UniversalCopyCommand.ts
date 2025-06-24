// src/features/history/commands/UniversalCopyCommand.ts

import { BaseCommand } from './BaseCommand';
import type { CommandContext } from './types';
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

    // Find and validate the element using base class utility
    const element = this.validateElement(this.elementId);

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
}