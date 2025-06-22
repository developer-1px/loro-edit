// src/components/ui/PreviewPanel.tsx

import React from 'react';
import type { ParsedElement, SelectionState } from '../../types';
import type { SelectableElement } from '../../utils/selectionUtils';
import { SelectionOverlayManager } from './SelectionOverlayManager';

interface PreviewPanelProps {
  previewMode: 'mobile' | 'tablet' | 'desktop';
  parsedElements: ParsedElement[];
  renderElement: (element: ParsedElement) => React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  selection: SelectionState;
  selectableTree: SelectableElement[];
}

const previewWidths = {
  mobile: '375px',
  tablet: '768px',
  desktop: '100%',
};

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  previewMode,
  parsedElements,
  renderElement,
  onClick,
  selection,
  selectableTree,
}) => {
  return (
    <div className="flex-1 flex justify-center items-start">
      <div
        className="bg-white rounded-lg shadow-lg border transition-all duration-300 relative"
        style={{
          width: previewWidths[previewMode],
          maxWidth: '100%',
          minHeight:
            previewMode === 'mobile'
              ? '667px'
              : previewMode === 'tablet'
              ? '1024px'
              : '600px',
        }}
        onClick={onClick}
        data-preview-container
      >
        <div className="p-4 h-full overflow-y-auto">
          {parsedElements.map((element, index) => {
            const rendered = renderElement(element);
            if (!rendered) {
              return null;
            }
            return <div key={element.id || index}>{rendered}</div>;
          })}
        </div>
        
        {/* Selection Overlay Manager */}
        <SelectionOverlayManager
          selectableTree={selectableTree}
          selectedElementId={selection.selectedElementId}
          selectedRepeatItemId={selection.selectedRepeatItemId}
          selectedRepeatContainerId={selection.selectedRepeatContainerId}
          selectedTextElementId={selection.selectedTextElementId}
          selectionMode={selection.mode}
          showHoverEffects={selection.mode === 'block'}
        />
      </div>
    </div>
  );
};