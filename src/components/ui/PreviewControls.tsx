// src/components/ui/PreviewControls.tsx

import React from 'react';
import { Smartphone, Tablet, Monitor, Eye, X, Undo2, Redo2 } from 'lucide-react';
import type { SelectionState } from '../../types';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';

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
    <div className="mb-4 flex items-center justify-between border-b pb-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Eye className="w-5 h-5" />
          <span className="text-sm font-medium">Preview</span>
        </div>
        
        <ToggleGroup 
          type="single" 
          value={previewMode} 
          onValueChange={(value) => value && onPreviewModeChange(value as 'mobile' | 'tablet' | 'desktop')}
          className="gap-1"
        >
          <ToggleGroupItem value="mobile" aria-label="Mobile view" size="sm">
            <Smartphone className="w-4 h-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="tablet" aria-label="Tablet view" size="sm">
            <Tablet className="w-4 h-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="desktop" aria-label="Desktop view" size="sm">
            <Monitor className="w-4 h-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "px-3 py-1 rounded-full text-xs font-medium",
            selection.mode === 'block'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
              : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
          )}
          title={`Current mode: ${
            selection.mode === 'block'
              ? 'Block Selection Mode'
              : 'Text Edit Mode'
          }`}
        >
          {selection.mode === 'block' ? 'Block' : 'Text'}
        </div>
        
        {(selection.selectedElementId || selection.selectedTextElementId) && (
          <Button
            variant="destructive"
            size="sm"
            onClick={onClearSelection}
            className="h-8 w-8 p-0"
            title="Clear selection (ESC)"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={onUndo}
          disabled={pastStates === 0}
          title={`Undo (${pastStates} available)`}
          className="h-8 w-8 p-0"
        >
          <Undo2 className="w-4 h-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onRedo}
          disabled={futureStates === 0}
          title={`Redo (${futureStates} available)`}
          className="h-8 w-8 p-0"
        >
          <Redo2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};