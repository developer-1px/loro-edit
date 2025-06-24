// src/components/ui/HistoryInspector.tsx

import React from 'react';
import { Undo2, Redo2, History, RotateCcw } from 'lucide-react';
import { useHistory } from '../../features/history';
import { Button } from './button';

export const HistoryInspector: React.FC = () => {
  const { 
    undo, 
    redo, 
    getUndoRedoState, 
    clearHistory,
    commandManager 
  } = useHistory();

  const undoRedoState = getUndoRedoState();
  const undoStackSize = commandManager.getUndoStackSize();
  const redoStackSize = commandManager.getRedoStackSize();

  const handleUndo = () => {
    const success = undo();
    if (success) {
      console.log('✅ Undo executed');
    }
  };

  const handleRedo = () => {
    const success = redo();
    if (success) {
      console.log('✅ Redo executed');
    }
  };

  const handleClearHistory = () => {
    clearHistory();
    console.log('🗑️ History cleared');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b">
        <History className="w-5 h-5 text-gray-600" />
        <h3 className="font-semibold text-gray-900">History</h3>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-gray-500">
            {undoStackSize + redoStackSize} actions
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearHistory}
            disabled={undoStackSize === 0 && redoStackSize === 0}
            className="h-7 w-7 p-0"
            title="Clear history"
          >
            <RotateCcw className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleUndo}
            disabled={!undoRedoState.canUndo}
            className="flex-1 flex items-center gap-2"
          >
            <Undo2 className="w-4 h-4" />
            Undo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRedo}
            disabled={!undoRedoState.canRedo}
            className="flex-1 flex items-center gap-2"
          >
            <Redo2 className="w-4 h-4" />
            Redo
          </Button>
        </div>
        
        {/* Status */}
        <div className="mt-2 text-xs text-gray-600">
          {undoRedoState.canUndo && (
            <div className="truncate">
              <span className="font-medium">Next undo:</span> {undoRedoState.undoDescription}
            </div>
          )}
          {undoRedoState.canRedo && (
            <div className="truncate">
              <span className="font-medium">Next redo:</span> {undoRedoState.redoDescription}
            </div>
          )}
          {!undoRedoState.canUndo && !undoRedoState.canRedo && (
            <div className="text-gray-400">No actions available</div>
          )}
        </div>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto p-4">
        <HistoryList />
      </div>
    </div>
  );
};

const HistoryList: React.FC = () => {
  const { commandManager } = useHistory();
  
  // Get actual command information from the manager
  const undoStackSize = commandManager.getUndoStackSize();
  const redoStackSize = commandManager.getRedoStackSize();
  
  // Create a representation based on current state
  const undoActions = [...Array(undoStackSize)].map((_, i) => ({
    id: `undo-${i}`,
    type: 'executed' as const,
    description: `Command ${undoStackSize - i}`,
    index: undoStackSize - i - 1,
    canUndo: i === 0, // Only the most recent can be undone
  }));

  const redoActions = [...Array(redoStackSize)].map((_, i) => ({
    id: `redo-${i}`,
    type: 'undone' as const,
    description: `Command ${undoStackSize + i + 1}`,
    index: undoStackSize + i,
    canRedo: i === 0, // Only the next can be redone
  }));

  const allActions = [...undoActions.reverse(), ...redoActions];
  
  // Get current state for descriptions
  const { getUndoRedoState } = useHistory();
  const undoRedoState = getUndoRedoState();

  if (allActions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-400">
        <History className="w-8 h-8 mb-2" />
        <p className="text-sm">No history yet</p>
        <p className="text-xs">Actions will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-gray-500 mb-2">Command Timeline</div>
      
      {/* Timeline visualization */}
      {allActions.length > 0 && (
        <div className="mb-4">
          {/* Position indicator */}
          <div className="flex items-center gap-2 mb-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span className="text-sm text-blue-800">
              Position: {undoStackSize} / {undoStackSize + redoStackSize}
            </span>
          </div>
          
          {/* Timeline bar */}
          <div className="relative bg-gray-100 h-2 rounded-full overflow-hidden">
            {/* Executed portion */}
            <div 
              className="absolute left-0 top-0 h-full bg-green-400 transition-all duration-300"
              style={{ 
                width: `${(undoStackSize / (undoStackSize + redoStackSize)) * 100}%` 
              }}
            />
            {/* Current position marker */}
            <div 
              className="absolute top-0 w-1 h-full bg-blue-600 transition-all duration-300"
              style={{ 
                left: `${(undoStackSize / (undoStackSize + redoStackSize)) * 100}%` 
              }}
            />
          </div>
          
          {/* Timeline labels */}
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>Start</span>
            <span>{undoStackSize + redoStackSize} commands</span>
          </div>
        </div>
      )}
      
      {allActions.map((action) => {
        const isNext = (action.type === 'executed' && action.canUndo) || 
                      (action.type === 'undone' && action.canRedo);
        
        return (
          <div
            key={action.id}
            className={`flex items-center gap-2 p-2 rounded-md text-sm transition-colors ${
              action.type === 'executed'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-gray-50 text-gray-500 border border-gray-200'
            } ${
              isNext ? 'ring-2 ring-blue-300 ring-opacity-50' : ''
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${
              action.type === 'executed' ? 'bg-green-500' : 'bg-gray-300'
            }`} />
            <span className="flex-1 truncate">
              {action.type === 'executed' && action.canUndo && undoRedoState.undoDescription
                ? undoRedoState.undoDescription
                : action.type === 'undone' && action.canRedo && undoRedoState.redoDescription
                ? undoRedoState.redoDescription
                : action.description
              }
            </span>
            <div className="flex items-center gap-1">
              {isNext && (
                <span className="text-xs px-1 bg-blue-100 text-blue-700 rounded">
                  {action.type === 'executed' ? 'Next undo' : 'Next redo'}
                </span>
              )}
              <span className="text-xs opacity-60">
                #{action.index + 1}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};