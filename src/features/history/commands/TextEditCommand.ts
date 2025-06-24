// src/commands/TextEditCommand.ts

import { BaseCommand } from './BaseCommand';
import type { CommandContext } from './types';

export class TextEditCommand extends BaseCommand {
  private previousText: string = '';
  private elementId: string;
  private newText: string;

  constructor(
    elementId: string,
    newText: string,
    context: CommandContext
  ) {
    super(
      'TextEdit',
      `Edit text: "${newText.substring(0, 30)}${newText.length > 30 ? '...' : ''}"`,
      context
    );
    this.elementId = elementId;
    this.newText = newText;
  }

  execute(): void {
    // Store previous text for undo
    const element = this.findElement(this.context.parsedElements, this.elementId);
    if (element && element.type === 'text') {
      this.previousText = (element as any).content || '';
    }

    // Execute the text change
    this.context.updateElement(this.elementId, { content: this.newText });
    this.markAsExecuted();
  }

  undo(): void {
    // Restore previous text
    this.context.updateElement(this.elementId, { content: this.previousText });
    this.markAsUnexecuted();
  }

  private findElement(elements: any[], id: string): any {
    for (const element of elements) {
      if (element.id === id) return element;
      if (element.children) {
        const found = this.findElement(element.children, id);
        if (found) return found;
      }
      if (element.items) {
        const found = this.findElement(element.items, id);
        if (found) return found;
      }
    }
    return null;
  }
}