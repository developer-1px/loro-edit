import { useCallback } from 'react';

// Simple type helpers to make TypeScript happy
type AnyElement = any; // For now, use any to avoid complex type issues

type ElementPredicate = (element: any) => boolean;
type ElementUpdater = (element: any) => any;

export const useDeepTreeOperations = () => {
  
  const updateElementsWhere = useCallback((
    elements: any[],
    predicate: ElementPredicate,
    updater: ElementUpdater
  ): any[] => {
    return elements.map(element => {
      // Check if this element matches the predicate
      if (predicate(element)) {
        return updater(element);
      }

      // Create a copy of the element for immutable updates
      let updatedElement = { ...element };
      let hasChanges = false;

      // Process children if they exist
      if ('children' in element && element.children) {
        const updatedChildren = updateElementsWhere(element.children as AnyElement[], predicate, updater);
        if (updatedChildren !== element.children) {
          updatedElement = { ...updatedElement, children: updatedChildren } as AnyElement;
          hasChanges = true;
        }
      }

      // Process items if they exist (for repeat containers)
      if ('items' in element && element.items) {
        const updatedItems = updateElementsWhere(element.items as AnyElement[], predicate, updater);
        if (updatedItems !== element.items) {
          updatedElement = { ...updatedElement, items: updatedItems } as AnyElement;
          hasChanges = true;
        }
      }

      return hasChanges ? updatedElement : element;
    });
  }, []);

  const findElementWhere = useCallback((
    elements: any[],
    predicate: ElementPredicate
  ): any | null => {
    for (const element of elements) {
      if (predicate(element)) {
        return element;
      }

      // Search in children
      if ('children' in element && element.children) {
        const found = findElementWhere(element.children, predicate);
        if (found) return found;
      }

      // Search in items (for repeat containers)
      if ('items' in element && element.items) {
        const found = findElementWhere(element.items, predicate);
        if (found) return found;
      }
    }
    return null;
  }, []);

  const findAllElementsWhere = useCallback((
    elements: any[],
    predicate: ElementPredicate
  ): any[] => {
    const results: any[] = [];

    const traverse = (els: any[]) => {
      for (const element of els) {
        if (predicate(element)) {
          results.push(element);
        }

        // Search in children
        if ('children' in element && element.children) {
          traverse(element.children);
        }

        // Search in items (for repeat containers)
        if ('items' in element && element.items) {
          traverse(element.items);
        }
      }
    };

    traverse(elements);
    return results;
  }, []);

  const generateNewIds = useCallback((elements: any[]): any[] => {
    return updateElementsWhere(elements, () => true, (element) => ({
      ...element,
      id: crypto.randomUUID(),
    }));
  }, [updateElementsWhere]);

  const cloneElements = useCallback((elements: any[]): any[] => {
    return generateNewIds(JSON.parse(JSON.stringify(elements)));
  }, [generateNewIds]);

  const countElementsWhere = useCallback((
    elements: any[],
    predicate: ElementPredicate
  ): number => {
    return findAllElementsWhere(elements, predicate).length;
  }, [findAllElementsWhere]);

  const removeElementsWhere = useCallback((
    elements: any[],
    predicate: ElementPredicate
  ): any[] => {
    return elements
      .filter(element => !predicate(element))
      .map(element => {
        let updatedElement = { ...element };
        let hasChanges = false;

        // Process children if they exist
        if ('children' in element && element.children) {
          const updatedChildren = removeElementsWhere(element.children, predicate);
          if (updatedChildren.length !== element.children.length) {
            updatedElement = { ...updatedElement, children: updatedChildren };
            hasChanges = true;
          }
        }

        // Process items if they exist (for repeat containers)
        if ('items' in element && element.items) {
          const updatedItems = removeElementsWhere(element.items, predicate);
          if (updatedItems.length !== element.items.length) {
            updatedElement = { ...updatedElement, items: updatedItems };
            hasChanges = true;
          }
        }

        return hasChanges ? updatedElement : element;
      });
  }, []);

  return {
    updateElementsWhere,
    findElementWhere,
    findAllElementsWhere,
    generateNewIds,
    cloneElements,
    countElementsWhere,
    removeElementsWhere,
  };
};