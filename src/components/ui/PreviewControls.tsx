// src/components/ui/PreviewControls.tsx

import React from 'react';
import { Smartphone, Tablet, Monitor, Eye, X, Undo2, Redo2 } from 'lucide-react';
import type { SelectionState } from '../../types';

interface PreviewControlsProps {
  previewMode: 'mobile' | 'tablet' | 'desktop';
  onPreviewModeChange: (mode: 'mobile' | 'tablet' | 'desktop') => void;
  selection: SelectionState;
  onClearSelection: () => void;
  onUndo: () => void;
  onRedo: () => void;
  pastStates?: number;
  futureStates?: number;
}

export const PreviewControls: React.FC<PreviewControlsProps> = ({
  previewMode,
  onPreviewModeChange,
  selection,
  onClearSelection,
  onUndo,
  onRedo,
  pastStates = 0,
  futureStates = 0,
}) => {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Eye className="w-5 h-5 text-gray-700" />
        <div className="flex gap-2">
          <button
            onClick={() => onPreviewModeChange('mobile')}
            className={`p-2 rounded transition-colors ${
              previewMode === 'mobile'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            title="Mobile view (375px)"
          >
            <Smartphone className="w-4 h-4" />
          </button>
          <button
            onClick={() => onPreviewModeChange('tablet')}
            className={`p-2 rounded transition-colors ${
              previewMode === 'tablet'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            title="Tablet view (768px)"
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            onClick={() => onPreviewModeChange('desktop')}
            className={`p-2 rounded transition-colors ${
              previewMode === 'desktop'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            title="Desktop view (100%)"
          >
            <Monitor className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            selection.mode === 'block'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-green-100 text-green-700'
          }`}
          title={`Current mode: ${
            selection.mode === 'block'
              ? 'Block Selection Mode'
              : 'Text Edit Mode'
          }`}
        >
          {selection.mode === 'block' ? 'B' : 'T'}
        </div>
        
        {(selection.selectedElementId || selection.selectedTextElementId) && (
          <button
            onClick={onClearSelection}
            className="p-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
            title="Clear selection (ESC)"
          >
            <X className="w-3 h-3" />
          </button>
        )}
        
        <button
          onClick={onUndo}
          className="p-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors disabled:opacity-50"
          disabled={pastStates === 0}
          title={`Undo (${pastStates} available)`}
        >
          <Undo2 className="w-4 h-4" />
        </button>
        
        <button
          onClick={onRedo}
          className="p-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors disabled:opacity-50"
          disabled={futureStates === 0}
          title={`Redo (${futureStates} available)`}
        >
          <Redo2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};