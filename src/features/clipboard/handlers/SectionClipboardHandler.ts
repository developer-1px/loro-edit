// src/features/clipboard/handlers/SectionClipboardHandler.ts

import type { ClipboardHandler, ClipboardData, PasteContext, PasteResult } from '../types';
import type { ParsedElement } from '../../../types';

export class SectionClipboardHandler implements ClipboardHandler {
  type = 'section';
  name = 'Section';
  
  canHandle(element: ParsedElement): boolean {
    return element.type === 'element' && 
           'tagName' in element && 
           element.tagName === 'section';
  }
  
  canPaste(_target: ParsedElement | null, clipboardData: ClipboardData): boolean {
    // Can paste sections at root level or after another section
    return clipboardData.type === 'section';
  }
  
  copy(element: ParsedElement): ClipboardData | null {
    if (!this.canHandle(element)) return null;
    
    return {
      type: 'section',
      data: JSON.parse(JSON.stringify(element)), // Deep clone
      operation: 'copy',
      timestamp: Date.now()
    };
  }
  
  cut(element: ParsedElement): ClipboardData | null {
    // Cut is same as copy, removal is handled by the command system
    return this.copy(element);
  }
  
  paste(target: ParsedElement | null, clipboardData: ClipboardData, context: PasteContext): PasteResult {
    if (!this.canPaste(target, clipboardData)) {
      return { success: false, error: 'Cannot paste here' };
    }
    
    // Generate new IDs for pasted section
    const pastedSection = this.generateNewIds(JSON.parse(JSON.stringify(clipboardData.data)));
    
    // Find where to insert the section
    const updatedElements = this.insertSection(
      context.parsedElements,
      pastedSection,
      target,
      context.insertIndex
    );
    
    return {
      success: true,
      updatedElements,
      pastedElementId: pastedSection.id
    };
  }
  
  getPreview(clipboardData: ClipboardData): string {
    const section = clipboardData.data;
    const title = this.findSectionTitle(section);
    return `Section: ${title}`;
  }
  
  private generateNewIds(element: any): any {
    const newElement = {
      ...element,
      id: Math.random().toString(36).substr(2, 9),
    };

    if (element.children && Array.isArray(element.children)) {
      newElement.children = element.children.map((child: any) => this.generateNewIds(child));
    }
    if (element.items && Array.isArray(element.items)) {
      newElement.items = element.items.map((item: any) => this.generateNewIds(item));
    }
    if (element.repeatItem) {
      newElement.repeatItem = `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    }

    return newElement;
  }
  
  private insertSection(elements: ParsedElement[], newSection: ParsedElement, target: ParsedElement | null, insertIndex?: number): ParsedElement[] {
    // If no target, try to find the container with sections
    if (!target) {
      return this.insertInFirstContainer(elements, newSection, insertIndex);
    }
    
    // If target is a section, insert after it
    if (this.canHandle(target)) {
      return this.insertAfterTarget(elements, newSection, target.id);
    }
    
    return elements;
  }
  
  private insertInFirstContainer(elements: ParsedElement[], newSection: ParsedElement, insertIndex?: number): ParsedElement[] {
    return elements.map(element => {
      if ('children' in element && element.children && Array.isArray(element.children)) {
        const childSections = element.children.filter((child: ParsedElement) => 
          child.type === 'element' && 'tagName' in child && child.tagName === 'section'
        );
        
        if (childSections.length > 0) {
          // Found container with sections, insert here
          const index = insertIndex ?? childSections.length;
          const updatedChildren = [...element.children];
          updatedChildren.splice(index, 0, newSection);
          
          return {
            ...element,
            children: updatedChildren
          };
        }
        
        // Recursively check children
        return {
          ...element,
          children: this.insertInFirstContainer(element.children, newSection, insertIndex)
        };
      }
      return element;
    });
  }
  
  private insertAfterTarget(elements: ParsedElement[], newSection: ParsedElement, targetId: string): ParsedElement[] {
    return elements.map(element => {
      if ('children' in element && element.children && Array.isArray(element.children)) {
        const targetIndex = element.children.findIndex(child => child.id === targetId);
        
        if (targetIndex !== -1) {
          const updatedChildren = [...element.children];
          updatedChildren.splice(targetIndex + 1, 0, newSection);
          
          return {
            ...element,
            children: updatedChildren
          };
        }
        
        // Recursively check children
        return {
          ...element,
          children: this.insertAfterTarget(element.children, newSection, targetId)
        };
      }
      return element;
    });
  }
  
  private findSectionTitle(element: ParsedElement): string {
    if ('children' in element && element.children) {
      for (const child of element.children) {
        if ('tagName' in child && ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(child.tagName)) {
          return this.extractTextContent(child);
        }
        const nestedTitle = this.findSectionTitle(child);
        if (nestedTitle) return nestedTitle;
      }
    }
    return 'Untitled Section';
  }
  
  private extractTextContent(element: ParsedElement): string {
    if (element.type === 'text') {
      return element.content || '';
    }
    if ('children' in element && element.children) {
      return element.children
        .map(child => this.extractTextContent(child))
        .join('')
        .trim();
    }
    return '';
  }
}