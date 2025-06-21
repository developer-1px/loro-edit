// src/components/ui/ResizeHandle.tsx

import React from 'react';

interface ResizeHandleProps {
  isResizing: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({
  isResizing,
  onMouseDown,
}) => {
  return (
    <div
      className={`w-1 bg-gray-300 hover:bg-blue-500 cursor-col-resize transition-colors duration-150 flex-shrink-0 ${
        isResizing ? 'bg-blue-500' : ''
      }`}
      onMouseDown={onMouseDown}
      title="Drag to resize panels"
    >
      <div className="w-full h-full relative">
        <div className="absolute inset-y-0 left-1/2 transform -translate-x-1/2 w-0.5 bg-white opacity-50"></div>
      </div>
    </div>
  );
};