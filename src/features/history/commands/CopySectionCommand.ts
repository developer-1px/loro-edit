// src/features/history/commands/CopySectionCommand.ts

import { BaseCommand } from './BaseCommand';
import type { CommandContext } from './types';
import type { ParsedElement } from '../../../types';

// Simple clipboard for sections
class SectionClipboard {
  private data: ParsedElement | null = null;
  private operation: 'copy' | 'cut' | null = null;

  setData(section: ParsedElement, operation: 'copy' | 'cut') {
    this.data = JSON.parse(JSON.stringify(section)); // Deep clone
    this.operation = operation;
  }

  getData(): { section: ParsedElement; operation: 'copy' | 'cut' } | null {
    if (!this.data || !this.operation) return null;
    return {
      section: this.data,
      operation: this.operation
    };
  }

  clear() {
    this.data = null;
    this.operation = null;
  }

  hasData(): boolean {
    return this.data !== null;
  }
}

export const sectionClipboard = new SectionClipboard();

export class CopySectionCommand extends BaseCommand {
  private sectionId: string;
  private previousClipboardData: any = null;

  constructor(
    sectionId: string,
    context: CommandContext
  ) {
    super(
      'CopySection',
      'Copy section',
      context
    );
    this.sectionId = sectionId;
  }

  execute(): void {
    // Store previous clipboard state for undo
    this.previousClipboardData = sectionClipboard.getData();

    // Find the section
    const section = this.findSectionById(this.context.parsedElements, this.sectionId);
    
    if (!section) {
      throw new Error(`Section ${this.sectionId} not found`);
    }

    // Set clipboard data
    sectionClipboard.setData(section, 'copy');

    this.markAsExecuted();
    console.log(`📋 Copied section: ${this.sectionId}`);
  }

  undo(): void {
    // Restore previous clipboard state
    if (this.previousClipboardData) {
      sectionClipboard.setData(this.previousClipboardData.section, this.previousClipboardData.operation);
    } else {
      sectionClipboard.clear();
    }

    this.markAsUnexecuted();
    console.log(`↩️ Undid copy of section: ${this.sectionId}`);
  }

  private findSectionById(elements: ParsedElement[], sectionId: string): ParsedElement | null {
    for (const element of elements) {
      if (element.id === sectionId && 
          element.type === 'element' && 
          'tagName' in element && 
          element.tagName === 'section') {
        return element;
      }
      
      // Search recursively in children
      if ('children' in element && element.children && Array.isArray(element.children)) {
        const found = this.findSectionById(element.children, sectionId);
        if (found) return found;
      }
    }
    return null;
  }
}