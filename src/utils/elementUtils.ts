// src/utils/elementUtils.ts

import type { ParsedElement, RegularElement } from '../types';

/**
 * Recursively find an element by ID in a parsed element tree
 */
export function findElementById(elements: ParsedElement[], elementId: string): ParsedElement | null {
  for (const element of elements) {
    if (element.id === elementId) {
      return element;
    }
    
    // Search in children
    if ('children' in element && element.children && Array.isArray(element.children)) {
      const found = findElementById(element.children, elementId);
      if (found) return found;
    }
    
    // Search in items (for repeat containers)
    if ('items' in element && element.items && Array.isArray(element.items)) {
      const found = findElementById(element.items, elementId);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Find the parent element of a target element
 */
export function findParentElement(elements: ParsedElement[], targetId: string): ParsedElement | null {
  for (const element of elements) {
    // Check children
    if ('children' in element && element.children) {
      const childIds = element.children.map(child => child.id);
      if (childIds.includes(targetId)) {
        return element;
      }
      
      const found = findParentElement(element.children, targetId);
      if (found) return found;
    }
    
    // Check items
    if ('items' in element && element.items) {
      const itemIds = element.items.map(item => item.id);
      if (itemIds.includes(targetId)) {
        return element;
      }
      
      const found = findParentElement(element.items, targetId);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Remove an element from the tree and return updated tree
 */
export function removeElement(elements: ParsedElement[], elementId: string): ParsedElement[] {
  return elements
    .map(element => {
      // If this is the element to remove, return null
      if (element.id === elementId) {
        return null;
      }
      
      // If element has children, recursively process them
      if ('children' in element && element.children && Array.isArray(element.children)) {
        const updatedChildren = removeElement(element.children, elementId);
        return {
          ...element,
          children: updatedChildren
        };
      }
      
      // If element has items, recursively process them
      if ('items' in element && element.items && Array.isArray(element.items)) {
        const updatedItems = removeElement(element.items, elementId);
        return {
          ...element,
          items: updatedItems as RegularElement[]
        };
      }
      
      return element;
    })
    .filter(element => element !== null) as ParsedElement[];
}

/**
 * Update an element in the tree
 */
export function updateElement(
  elements: ParsedElement[], 
  elementId: string, 
  updater: (element: ParsedElement) => ParsedElement
): ParsedElement[] {
  return elements.map(element => {
    if (element.id === elementId) {
      return updater(element);
    }
    
    // Process children
    if ('children' in element && element.children) {
      return {
        ...element,
        children: updateElement(element.children, elementId, updater)
      };
    }
    
    // Process items
    if ('items' in element && element.items) {
      return {
        ...element,
        items: updateElement(element.items, elementId, updater) as RegularElement[]
      };
    }
    
    return element;
  });
}

/**
 * Generate a unique element ID
 */
export function generateElementId(): string {
  return Math.random().toString(36).substr(2, 9);
}