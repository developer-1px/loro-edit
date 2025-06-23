import React from 'react';
import { SelectionOverlay } from './SelectionOverlay';
import { pluginManager } from '../../plugins';
import type { SelectionState } from '../../types';

interface SelectionOverlayManagerProps {
  selection: SelectionState;
  showHoverEffects?: boolean;
}

export const SelectionOverlayManager: React.FC<SelectionOverlayManagerProps> = ({
  selection,
  showHoverEffects = false,
}) => {
  // If no element is selected, don't render anything
  if (!selection.selectedElementId || !selection.mode) {
    return null;
  }

  // Get element info from PluginManager
  const elementInfo = pluginManager.getElementInfo(selection.selectedElementId);
  if (!elementInfo) {
    return null;
  }

  // Create simple selector using data-element-id
  const targetSelector = `[data-element-id="${selection.selectedElementId}"]`;

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
        key={selection.selectedElementId}
        targetSelector={targetSelector}
        selectable={elementInfo.plugin.selectable || {
          enabled: true,
          name: elementInfo.plugin.name,
          color: "#3b82f6"
        }}
        isSelected={true}
        isHovered={false}
        showHoverEffects={showHoverEffects}
      />
    </div>
  );
};