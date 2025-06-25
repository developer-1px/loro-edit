import React from 'react';
import { SelectionOverlay } from './SelectionOverlay';
import { pluginManager } from '../../../plugins';
import type { SelectionState } from '../types';
import { useEditorStore } from '../../../store/editorStore';

interface SelectionOverlayManagerProps {
  selection: SelectionState;
}

export const SelectionOverlayManager: React.FC<SelectionOverlayManagerProps> = ({
  selection
}) => {
  const parsedElements = useEditorStore(state => state.parsedElements);
  
  if (!selection.selectedElementId || !selection.mode) return null;

  const plugin = pluginManager.getPluginById(selection.selectedElementId);
  if (!plugin) return null;

  // Find the selected element to get its attributes
  let selectedElement: any = null;
  const findElement = (elements: any[]): any => {
    for (const el of elements) {
      if (el.id === selection.selectedElementId) return el;
      if (el.children) {
        const found = findElement(el.children);
        if (found) return found;
      }
      if (el.items) {
        const found = findElement(el.items);
        if (found) return found;
      }
    }
    return null;
  };
  
  selectedElement = findElement(parsedElements);

  return (
    <div style={{ 
      position: 'absolute', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%', 
      pointerEvents: 'none' 
    }}>
      <SelectionOverlay
        targetSelector={`[data-element-id="${selection.selectedElementId}"]`}
        elementName={plugin.selectable?.name || plugin.name}
        color={plugin.selectable?.color || "#3b82f6"}
        elementData={selectedElement}
        pluginName={plugin.name}
        elementId={selection.selectedElementId}
      />
    </div>
  );
};