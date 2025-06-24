// src/features/history/commands/MoveSectionCommand.ts

import { BaseCommand } from './BaseCommand';
import type { CommandContext } from './types';
import type { ParsedElement } from '../../../types';

export class MoveSectionCommand extends BaseCommand {
  private fromIndex: number;
  private toIndex: number;
  private previousElements: ParsedElement[] = [];

  constructor(
    fromIndex: number,
    toIndex: number,
    context: CommandContext
  ) {
    super(
      'MoveSection',
      `Move section from ${fromIndex + 1} to ${toIndex + 1}`,
      context
    );
    this.fromIndex = fromIndex;
    this.toIndex = toIndex;
  }

  execute(): void {
    // Store current state for undo
    this.previousElements = JSON.parse(JSON.stringify(this.context.parsedElements));

    // Find sections recursively (same logic as SectionSidebar)
    const findSections = (elements: any[]): any[] => {
      const sections: any[] = [];
      
      const searchInElement = (element: any) => {
        if (element.type === 'element' && 'tagName' in element && element.tagName === 'section') {
          sections.push(element);
        }
        
        if (element.children && Array.isArray(element.children)) {
          element.children.forEach(searchInElement);
        }
      };
      
      elements.forEach(searchInElement);
      return sections;
    };

    const sections = findSections(this.context.parsedElements);

    if (this.fromIndex < 0 || this.fromIndex >= sections.length ||
        this.toIndex < 0 || this.toIndex >= sections.length) {
      throw new Error('Invalid section index for move operation');
    }

    // For now, just rearrange sections within the parent container
    // This is a simplified implementation - find the parent container and reorder sections
    const rearrangeSections = (elements: any[]): any[] => {
      return elements.map(element => {
        if (element.children && Array.isArray(element.children)) {
          const childSections = element.children.filter((child: any) => 
            child.type === 'element' && child.tagName === 'section'
          );
          const nonSectionChildren = element.children.filter((child: any) => 
            !(child.type === 'element' && child.tagName === 'section')
          );
          
          if (childSections.length > 0) {
            // Reorder sections
            const [movedSection] = childSections.splice(this.fromIndex, 1);
            childSections.splice(this.toIndex, 0, movedSection);
            
            return {
              ...element,
              children: [...nonSectionChildren, ...childSections]
            };
          }
          
          return {
            ...element,
            children: rearrangeSections(element.children)
          };
        }
        return element;
      });
    };

    const updatedElements = rearrangeSections(this.context.parsedElements);
    this.context.setParsedElements(updatedElements);
    this.markAsExecuted();
    
    console.log(`📦 Moved section from position ${this.fromIndex + 1} to ${this.toIndex + 1}`);
  }

  undo(): void {
    // Restore previous state
    this.context.setParsedElements(this.previousElements);
    this.markAsUnexecuted();
    
    console.log(`↩️ Undid move of section from ${this.fromIndex + 1} to ${this.toIndex + 1}`);
  }
}