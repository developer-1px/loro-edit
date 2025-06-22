import React, { useState, useEffect } from 'react';
import { SelectionOverlay } from './SelectionOverlay';
import { useHoverState } from '../../hooks/useHoverState';
import type { ParsedElement } from '../../types';
import type { SelectableElement } from '../../utils/selectionUtils';

interface OverlayData {
  id: string;
  element: ParsedElement;
  selectable: SelectableElement['selectable'];
  targetSelector: string;
  isSelected: boolean;
}

interface SelectionOverlayManagerProps {
  selectableTree: SelectableElement[];
  selectedElementId: string | null;
  selectedRepeatItemId: string | null;
  selectedRepeatContainerId: string | null;
  selectedTextElementId: string | null;
  selectionMode: 'block' | 'text';
  showHoverEffects?: boolean;
}

export const SelectionOverlayManager: React.FC<SelectionOverlayManagerProps> = ({
  selectableTree,
  selectedElementId,
  selectedRepeatItemId,
  selectedRepeatContainerId,
  selectedTextElementId,
  selectionMode,
  showHoverEffects = false,
}) => {
  const [overlays, setOverlays] = useState<OverlayData[]>([]);
  const { hoveredElementId } = useHoverState({ enabled: showHoverEffects });

  // Convert SelectableElement tree to overlay data
  const collectSelectableElements = (selectableElements: SelectableElement[]): OverlayData[] => {
    const result: OverlayData[] = [];

    const processElement = (selectableElement: SelectableElement) => {
      const { element, selectable, id } = selectableElement;
      let targetSelector = '';
      let isSelected = false;

      // Determine target selector and selection state
      if (element.type === 'repeat-container' && 'items' in element) {
        // For repeat containers, create overlays for individual items
        element.items.forEach(item => {
          const itemSelector = `[data-repeat-item-id="${item.id}"]`;
          const itemIsSelected = selectedRepeatItemId === item.id && 
                               selectedRepeatContainerId === element.id;
          
          result.push({
            id: `repeat-item-${element.id}-${item.id}`,
            element: item,
            selectable: {
              ...selectable,
              name: `${selectable.name} Item`,
            },
            targetSelector: itemSelector,
            isSelected: itemIsSelected,
          });
        });
      } else {
        // For regular elements
        if (selectionMode === 'text' && element.type === 'text') {
          targetSelector = `[data-text-element-id="${element.id}"]`;
          isSelected = selectedTextElementId === element.id;
        } else {
          targetSelector = `[data-block-element-id="${element.id}"]`;
          isSelected = selectedElementId === element.id;
        }

        if (targetSelector) {
          result.push({
            id,
            element,
            selectable,
            targetSelector,
            isSelected,
          });
        }
      }

      // Process children recursively
      selectableElement.children.forEach(child => processElement(child));
    };

    selectableElements.forEach(element => processElement(element));
    return result;
  };

  useEffect(() => {
    const newOverlays = collectSelectableElements(selectableTree);
    setOverlays(newOverlays);
  }, [
    selectableTree, 
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