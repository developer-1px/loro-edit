import React from 'react';
import { SelectionOverlay } from './SelectionOverlay';
import { pluginManager } from '../../../plugins';
import type { SelectionState } from '../types';

interface SelectionOverlayManagerProps {
  selection: SelectionState;
}

export const SelectionOverlayManager: React.FC<SelectionOverlayManagerProps> = ({
  selection
}) => {
  if (!selection.selectedElementId || !selection.mode) return null;

  const plugin = pluginManager.getPluginById(selection.selectedElementId);
  if (!plugin) return null;

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
      />
    </div>
  );
};