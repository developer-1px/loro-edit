// src/features/history/commands/CutSectionCommand.ts

import { BaseCommand } from './BaseCommand';
import type { CommandContext } from './types';
import type { ParsedElement } from '../../../types';
import { sectionClipboard } from './CopySectionCommand';

export class CutSectionCommand extends BaseCommand {
  private sectionId: string;
  private previousElements: ParsedElement[] = [];
  private previousClipboardData: any = null;
  private cutSection: ParsedElement | null = null;

  constructor(
    sectionId: string,
    context: CommandContext
  ) {
    super(
      'CutSection',
      'Cut section',
      context
    );
    this.sectionId = sectionId;
  }

  execute(): void {
    // Store current state for undo
    this.previousElements = JSON.parse(JSON.stringify(this.context.parsedElements));
    this.previousClipboardData = sectionClipboard.getData();

    // Find and remove the section
    const result = this.findAndRemoveSection(this.context.parsedElements, this.sectionId);
    
    if (!result.found) {
      throw new Error(`Section ${this.sectionId} not found`);
    }

    this.cutSection = result.section;

    // Update elements
    this.context.setParsedElements([...result.updatedElements]);

    // Set clipboard data
    if (this.cutSection) {
      sectionClipboard.setData(this.cutSection, 'cut');
    }

    // Clear selection if cut section was selected
    if (this.context.selection.selectedElementId === this.sectionId) {
      this.context.setSelection({ selectedElementId: null, mode: null });
    }

    this.markAsExecuted();
    console.log(`✂️ Cut section: ${this.sectionId}`);
  }

  undo(): void {
    // Restore previous state
    this.context.setParsedElements(this.previousElements);

    // Restore previous clipboard state
    if (this.previousClipboardData) {
      sectionClipboard.setData(this.previousClipboardData.section, this.previousClipboardData.operation);
    } else {
      sectionClipboard.clear();
    }

    this.markAsUnexecuted();
    console.log(`↩️ Undid cut of section: ${this.sectionId}`);
  }

  private findAndRemoveSection(elements: ParsedElement[], sectionId: string): {
    found: boolean;
    section: ParsedElement | null;
    index: number;
    updatedElements: ParsedElement[];
  } {
    // Create a recursive function to find and remove the section
    const removeRecursive = (elements: ParsedElement[]): ParsedElement[] => {
      return elements.map(element => {
        // If this is the section we're looking for, return null to mark for removal
        if (element.id === sectionId && 
            element.type === 'element' && 
            'tagName' in element && 
            element.tagName === 'section') {
          
          this.cutSection = element;
          return null; // Mark for removal
        }
        
        // If element has children, recursively process them
        if ('children' in element && element.children && Array.isArray(element.children)) {
          const updatedChildren = removeRecursive(element.children).filter(child => child !== null);
          return {
            ...element,
            children: updatedChildren
          };
        }
        
        return element;
      }).filter(element => element !== null) as ParsedElement[];
    };

    const updatedElements = removeRecursive(elements);
    
    return {
      found: this.cutSection !== null,
      section: this.cutSection,
      index: -1, // Not applicable for nested removal
      updatedElements
    };
  }
}