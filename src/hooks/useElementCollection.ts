import { useMemo } from 'react';
import type { ParsedElement } from '../types';

interface ElementFilter {
  type?: string | string[];
  hasAttribute?: string | string[];
  hasProperty?: string | string[];
  custom?: (element: ParsedElement) => boolean;
  includeChildren?: boolean;
  includeItems?: boolean;
}

interface CollectionOptions {
  recursive?: boolean;
  flatten?: boolean;
  deduplicate?: boolean;
  sort?: (a: ParsedElement, b: ParsedElement) => number;
}

interface ElementCollectionResult {
  elements: ParsedElement[];
  count: number;
  byType: Record<string, ParsedElement[]>;
  byId: Record<string, ParsedElement>;
  isEmpty: boolean;
}

export const useElementCollection = (
  elements: ParsedElement[],
  filters: ElementFilter[] = [],
  options: CollectionOptions = {}
): ElementCollectionResult => {
  const {
    recursive = true,
    flatten = true,
    deduplicate = true,
    sort,
  } = options;

  return useMemo(() => {
    const collectElements = (
      elementsToProcess: ParsedElement[],
      shouldRecurse = recursive
    ): ParsedElement[] => {
      const collected: ParsedElement[] = [];

      const processElement = (element: ParsedElement) => {
        // Apply filters
        const passesFilters = filters.length === 0 || filters.some(filter => {
          // Type filter
          if (filter.type) {
            const types = Array.isArray(filter.type) ? filter.type : [filter.type];
            if (!types.includes(element.type)) return false;
          }

          // Attribute filter
          if (filter.hasAttribute) {
            const attributes = Array.isArray(filter.hasAttribute) 
              ? filter.hasAttribute 
              : [filter.hasAttribute];
            
            const hasAllAttributes = attributes.every(attr => {
              return attr in element || 
                     ((element as any).attributes && typeof (element as any).attributes === 'object' && attr in (element as any).attributes);
            });
            
            if (!hasAllAttributes) return false;
          }

          // Property filter
          if (filter.hasProperty) {
            const properties = Array.isArray(filter.hasProperty) 
              ? filter.hasProperty 
              : [filter.hasProperty];
            
            const hasAllProperties = properties.every(prop => prop in element);
            if (!hasAllProperties) return false;
          }

          // Custom filter
          if (filter.custom && !filter.custom(element)) {
            return false;
          }

          return true;
        });

        if (passesFilters) {
          collected.push(element);
        }

        // Process children if recursive
        if (shouldRecurse) {
          if ('children' in element && element.children && 
              (!filters.length || filters.some(f => f.includeChildren !== false))) {
            element.children.forEach(processElement);
          }

          if ('items' in element && element.items && 
              (!filters.length || filters.some(f => f.includeItems !== false))) {
            element.items.forEach(processElement);
          }
        }
      };

      elementsToProcess.forEach(processElement);
      return collected;
    };

    let result = collectElements(elements);

    // Deduplicate by ID if requested
    if (deduplicate) {
      const seen = new Set<string>();
      result = result.filter(element => {
        if (seen.has(element.id)) return false;
        seen.add(element.id);
        return true;
      });
    }

    // Sort if comparator provided
    if (sort) {
      result.sort(sort);
    }

    // Create grouped results
    const byType = result.reduce((acc, element) => {
      if (!acc[element.type]) acc[element.type] = [];
      acc[element.type].push(element);
      return acc;
    }, {} as Record<string, ParsedElement[]>);

    const byId = result.reduce((acc, element) => {
      acc[element.id] = element;
      return acc;
    }, {} as Record<string, ParsedElement>);

    return {
      elements: result,
      count: result.length,
      byType,
      byId,
      isEmpty: result.length === 0,
    };
  }, [elements, filters, recursive, flatten, deduplicate, sort]);
};

// Specialized hooks for common collection patterns
export const useTextElements = (elements: ParsedElement[]) => {
  return useElementCollection(elements, [{ type: 'text' }]);
};

export const useImageElements = (elements: ParsedElement[]) => {
  return useElementCollection(elements, [{ type: 'image' }]);
};

export const useSelectableElements = (elements: ParsedElement[]) => {
  return useElementCollection(elements, [
    { hasProperty: 'selectable' },
    { custom: (el) => 'selectable' in el && !!el.selectable }
  ]);
};

export const useRepeatElements = (elements: ParsedElement[]) => {
  return useElementCollection(elements, [
    { type: 'repeat-container' },
    { hasProperty: 'items' }
  ]);
};

export const useDatabaseElements = (elements: ParsedElement[]) => {
  return useElementCollection(elements, [{ type: 'database' }]);
};

// Advanced collection hook with caching
export const useElementCollectionWithCache = (
  elements: ParsedElement[],
  filters: ElementFilter[] = [],
  options: CollectionOptions = {},
  cacheKey?: string
) => {
  const cacheKeyFinal = cacheKey || JSON.stringify({ filters, options });
  
  return useMemo(() => {
    return useElementCollection(elements, filters, options);
  }, [elements, cacheKeyFinal]);
};