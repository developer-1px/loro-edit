// src/components/ui/PreviewControls.tsx

import React from 'react';
import { Smartphone, Tablet, Monitor, X, Undo2, Redo2 } from 'lucide-react';
import type { SelectionState } from '../../types';
import { Button } from './button';
import { ToggleGroup, ToggleGroupItem } from './toggle-group';
import { cn } from '../../lib/utils';

interface PreviewControlsProps {
  previewMode: 'mobile' | 'tablet' | 'desktop';
  onPreviewModeChange: (mode: 'mobile' | 'tablet' | 'desktop') => void;
  selection: SelectionState;
  onClearSelection: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  undoDescription?: string;
  redoDescription?: string;
}

export const PreviewControls: React.FC<PreviewControlsProps> = ({
  previewMode,
  onPreviewModeChange,
  selection,
  onClearSelection,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  undoDescription,
  redoDescription,
}) => {
  return (
    <div className="mb-2 flex items-center justify-between border-b pb-2">
      <div className="flex items-center gap-2">
        <ToggleGroup 
          type="single" 
          value={previewMode} 
          onValueChange={(value) => value && onPreviewModeChange(value as 'mobile' | 'tablet' | 'desktop')}
          className="gap-0"
        >
          <ToggleGroupItem value="mobile" aria-label="Mobile view" size="sm" className="h-7 w-7 p-0">
            <Smartphone className="w-3 h-3" />
          </ToggleGroupItem>
          <ToggleGroupItem value="tablet" aria-label="Tablet view" size="sm" className="h-7 w-7 p-0">
            <Tablet className="w-3 h-3" />
          </ToggleGroupItem>
          <ToggleGroupItem value="desktop" aria-label="Desktop view" size="sm" className="h-7 w-7 p-0">
            <Monitor className="w-3 h-3" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      <div className="flex items-center gap-1">
        <div
          className={cn(
            "px-2 py-0.5 rounded text-xs font-medium",
            selection.mode === 'block'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-green-100 text-green-700'
          )}
          title={`${selection.mode === 'block' ? 'Block' : 'Text'} mode`}
        >
          {selection.mode === 'block' ? 'B' : 'T'}
        </div>
        
        {selection.selectedElementId && (
          <Button
            variant="destructive"
            size="sm"
            onClick={onClearSelection}
            className="h-6 w-6 p-0"
            title="Clear selection (ESC)"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={onUndo}
          disabled={!canUndo}
          title={canUndo ? `Undo: ${undoDescription || 'Previous action'} (Ctrl+Z)` : 'Nothing to undo'}
          className="h-6 w-6 p-0"
        >
          <Undo2 className="w-3 h-3" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onRedo}
          disabled={!canRedo}
          title={canRedo ? `Redo: ${redoDescription || 'Next action'} (Ctrl+Y)` : 'Nothing to redo'}
          className="h-6 w-6 p-0"
        >
          <Redo2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};