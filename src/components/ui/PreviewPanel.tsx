// src/components/ui/PreviewPanel.tsx

import React from 'react';
import type { ParsedElement } from '../../types';

interface PreviewPanelProps {
  previewMode: 'mobile' | 'tablet' | 'desktop';
  parsedElements: ParsedElement[];
  renderElement: (element: ParsedElement) => React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
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
}) => {
  return (
    <div className="flex-1 flex justify-center items-start">
      <div
        className="bg-white rounded-lg shadow-lg border transition-all duration-300"
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
      </div>
    </div>
  );
};