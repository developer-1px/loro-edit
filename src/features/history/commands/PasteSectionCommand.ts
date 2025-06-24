// src/features/history/commands/PasteSectionCommand.ts

import { BaseCommand } from './BaseCommand';
import type { CommandContext } from './types';
import type { ParsedElement } from '../../../types';
import { sectionClipboard } from './CopySectionCommand';

export class PasteSectionCommand extends BaseCommand {
  private insertAfterIndex: number;
  private previousElements: ParsedElement[] = [];
  private pastedSectionId: string = '';
  private previousSelection: any = null;

  constructor(
    insertAfterIndex: number, // -1 for beginning, or index to insert after
    context: CommandContext
  ) {
    super(
      'PasteSection',
      `Paste section after position ${insertAfterIndex + 1}`,
      context
    );
    this.insertAfterIndex = insertAfterIndex;
  }

  canExecute(): boolean {
    return sectionClipboard.hasData();
  }

  execute(): void {
    const clipboardData = sectionClipboard.getData();
    if (!clipboardData) {
      throw new Error('No section in clipboard');
    }

    // Store current state for undo
    this.previousElements = JSON.parse(JSON.stringify(this.context.parsedElements));
    this.previousSelection = { ...this.context.selection };

    // Generate new IDs for the pasted section (deep clone with new IDs)
    const pastedSection = this.generateNewIds(JSON.parse(JSON.stringify(clipboardData.section))) as ParsedElement;
    this.pastedSectionId = pastedSection.id;

    // Insert section in the DOM structure
    const insertSection = (elements: ParsedElement[]): ParsedElement[] => {
      return elements.map(element => {
        if ('children' in element && element.children && Array.isArray(element.children)) {
          const childSections = element.children.filter((child: ParsedElement) => 
            child.type === 'element' && 'tagName' in child && child.tagName === 'section'
          );
          const nonSectionChildren = element.children.filter((child: ParsedElement) => 
            !(child.type === 'element' && 'tagName' in child && child.tagName === 'section')
          );
          
          if (childSections.length > 0) {
            // Insert section at the specified position
            let insertIndex = this.insertAfterIndex + 1;
            if (insertIndex < 0) insertIndex = 0;
            if (insertIndex > childSections.length) insertIndex = childSections.length;
            
            childSections.splice(insertIndex, 0, pastedSection);
            
            return {
              ...element,
              children: [...nonSectionChildren, ...childSections]
            };
          }
          
          return {
            ...element,
            children: insertSection(element.children)
          };
        }
        return element;
      });
    };

    const updatedElements = insertSection(this.context.parsedElements);
    this.context.setParsedElements(updatedElements);

    // Set selection to the pasted section
    this.context.setSelection({
      selectedElementId: this.pastedSectionId,
      mode: 'block'
    });

    // Clear clipboard if this was a cut operation
    if (clipboardData.operation === 'cut') {
      sectionClipboard.clear();
    }

    this.markAsExecuted();
    console.log(`📌 Pasted section: ${this.pastedSectionId}`);
  }

  undo(): void {
    // Restore previous state
    this.context.setParsedElements(this.previousElements);
    this.context.setSelection(this.previousSelection);

    this.markAsUnexecuted();
    console.log(`↩️ Undid paste of section: ${this.pastedSectionId}`);
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
      newElement.items = newElement.items.map((item: ParsedElement) => this.generateNewIds(item) as any);
    }
    if ("repeatItem" in newElement && newElement.repeatItem) {
      (newElement as any).repeatItem = `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    }

    return newElement;
  }
}