import React, { useState, useEffect } from 'react';
import { SelectionOverlay } from './SelectionOverlay';
import { pluginManager } from '../../plugins';
import { useHoverState } from '../../hooks/useHoverState';
import type { ParsedElement } from '../../types';
import type { SelectableConfig } from '../../plugins/types';

interface OverlayData {
  id: string;
  element: ParsedElement;
  selectable: SelectableConfig;
  targetSelector: string;
  isSelected: boolean;
}

interface SelectionOverlayManagerProps {
  parsedElements: ParsedElement[];
  selectedElementId: string | null;
  selectedRepeatItemId: string | null;
  selectedRepeatContainerId: string | null;
  selectedTextElementId: string | null;
  selectionMode: 'block' | 'text';
  showHoverEffects?: boolean;
}

export const SelectionOverlayManager: React.FC<SelectionOverlayManagerProps> = ({
  parsedElements,
  selectedElementId,
  selectedRepeatItemId,
  selectedRepeatContainerId,
  selectedTextElementId,
  selectionMode,
  showHoverEffects = false,
}) => {
  const [overlays, setOverlays] = useState<OverlayData[]>([]);
  const { hoveredElementId } = useHoverState({ enabled: showHoverEffects });

  // Collect all selectable elements and their configurations
  const collectSelectableElements = (elements: ParsedElement[]): OverlayData[] => {
    const result: OverlayData[] = [];

    const processElement = (element: ParsedElement, context: string = '') => {
      // Create mock DOM element to find plugin - use proper tag name and attributes
      const tagName = 'tagName' in element ? element.tagName : 'div';
      const mockElement = document.createElement(tagName || 'div');
      
      // Set proper attributes for plugin matching
      if (element.id) {
        mockElement.id = element.id;
      }
      if ('className' in element && element.className) {
        mockElement.className = element.className;
      }
      
      // Set specific attributes for different element types
      if (element.type === 'database' && 'database' in element) {
        mockElement.setAttribute('data-database', element.database);
        mockElement.setAttribute('data-database-id', element.id);
      }
      if (element.type === 'repeat-container' && 'repeatContainer' in element) {
        mockElement.setAttribute('data-repeat-container', element.repeatContainer);
      }
      if (element.type === 'text') {
        mockElement.setAttribute('data-element-type', 'text');
      }

      const plugin = pluginManager.getPlugin(mockElement);
      if (plugin?.selectable?.enabled) {
        let targetSelector = '';
        let isSelected = false;

        // Determine target selector and selection state based on element type
        if (element.type === 'repeat-container' && 'items' in element) {
          // For repeat containers, create overlays for individual items
          element.items.forEach(item => {
            if (plugin.selectable) {
              const itemSelector = `[data-repeat-item-id="${item.id}"]`;
              const itemIsSelected = selectedRepeatItemId === item.id && 
                                   selectedRepeatContainerId === element.id;
              
              result.push({
                id: `repeat-item-${element.id}-${item.id}`,
                element: item,
                selectable: {
                  ...plugin.selectable,
                  name: `${plugin.selectable.name} Item`,
                },
                targetSelector: itemSelector,
                isSelected: itemIsSelected,
              });
            }
            
            // Also process children of repeat items
            if ('children' in item && item.children) {
              item.children.forEach(child => processElement(child, `repeat-item-${element.id}-${item.id}`));
            }
          });
        } else {
          // For regular elements
          if (selectionMode === 'text' && element.type === 'text') {
            targetSelector = `[data-text-element-id="${element.id}"]`;
            isSelected = selectedTextElementId === element.id;
          } else if (selectionMode === 'block') {
            targetSelector = `[data-block-element-id="${element.id}"]`;
            isSelected = selectedElementId === element.id;
          }

          if (targetSelector) {
            const uniqueId = context ? `${context}-${element.type}-${element.id}` : `${element.type}-${element.id}`;
            result.push({
              id: uniqueId,
              element,
              selectable: plugin.selectable,
              targetSelector,
              isSelected,
            });
          }
        }
      }

      // Process children recursively
      if ('children' in element && element.children) {
        const childContext = context ? `${context}-${element.type}-${element.id}` : `${element.type}-${element.id}`;
        element.children.forEach(child => processElement(child, childContext));
      }
      if ('items' in element && element.items) {
        const itemContext = context ? `${context}-${element.type}-${element.id}` : `${element.type}-${element.id}`;
        element.items.forEach(item => processElement(item, itemContext));
      }
    };

    elements.forEach(element => processElement(element));
    return result;
  };

  useEffect(() => {
    const newOverlays = collectSelectableElements(parsedElements);
    setOverlays(newOverlays);
  }, [
    parsedElements, 
    selectedElementId, 
    selectedRepeatItemId, 
    selectedRepeatContainerId, 
    selectedTextElementId, 
    selectionMode
  ]);


  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      {overlays.map(overlay => {
        // For repeat items, check if the hovered element matches the item ID
        const isHovered = overlay.targetSelector.includes('data-repeat-item-id') 
          ? hoveredElementId === overlay.element.id
          : hoveredElementId === overlay.element.id;
        
        return (
          <SelectionOverlay
            key={overlay.id}
            targetSelector={overlay.targetSelector}
            selectable={overlay.selectable}
            isSelected={overlay.isSelected}
            isHovered={isHovered}
            showHoverEffects={showHoverEffects}
          />
        );
      })}
    </div>
  );
};