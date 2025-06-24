// src/features/history/hooks.ts

import { useCallback } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { commandManager } from './commands/CommandManager';
import type { UndoRedoState, CommandContext } from './commands/types';
import { TextEditCommand } from './commands/TextEditCommand';
import { DeleteElementCommand } from './commands/DeleteElementCommand';
import { AddElementCommand } from './commands/AddElementCommand';
import { SelectionCommand } from './commands/SelectionCommand';
import { CopyRepeatItemCommand } from './commands/CopyRepeatItemCommand';
import { CutRepeatItemCommand } from './commands/CutRepeatItemCommand';
import { PasteRepeatItemCommand } from './commands/PasteRepeatItemCommand';
import { repeatItemClipboard } from './commands/RepeatItemClipboard';
import type { SelectionState } from '../../types';

/**
 * Hook for managing command execution and history
 */
export const useHistory = () => {
  const store = useEditorStore();

  // Create command context
  const getCommandContext = useCallback((): CommandContext => ({
    parsedElements: store.parsedElements,
    selection: store.selection,
    setParsedElements: store.setParsedElements,
    setSelection: store.setSelection,
    updateElement: store.updateElement,
  }), [store]);

  // Command execution methods
  const executeTextEdit = useCallback((elementId: string, newText: string) => {
    const command = new TextEditCommand(elementId, newText, getCommandContext());
    return commandManager.execute(command);
  }, [getCommandContext]);

  const executeDeleteElement = useCallback((elementId: string) => {
    const command = new DeleteElementCommand(elementId, getCommandContext());
    return commandManager.execute(command);
  }, [getCommandContext]);

  const executeAddElement = useCallback((containerId: string) => {
    const command = new AddElementCommand(containerId, getCommandContext());
    return commandManager.execute(command);
  }, [getCommandContext]);

  const executeSelection = useCallback((selection: Partial<SelectionState>) => {
    const command = new SelectionCommand(selection, getCommandContext());
    return commandManager.execute(command);
  }, [getCommandContext]);

  // Repeat item commands
  const executeCopyRepeatItem = useCallback((itemId: string) => {
    const command = new CopyRepeatItemCommand(itemId, getCommandContext());
    return commandManager.execute(command);
  }, [getCommandContext]);

  const executeCutRepeatItem = useCallback((itemId: string) => {
    const command = new CutRepeatItemCommand(itemId, getCommandContext());
    return commandManager.execute(command);
  }, [getCommandContext]);

  const executePasteRepeatItem = useCallback((targetContainerId: string, insertAfterIndex: number) => {
    const command = new PasteRepeatItemCommand(targetContainerId, insertAfterIndex, getCommandContext());
    return commandManager.execute(command);
  }, [getCommandContext]);

  // Clipboard utilities
  const getClipboardData = useCallback(() => {
    return repeatItemClipboard.getData();
  }, []);

  const hasClipboardData = useCallback(() => {
    return repeatItemClipboard.hasData();
  }, []);

  const clearClipboard = useCallback(() => {
    repeatItemClipboard.clear();
  }, []);

  // History management
  const undo = useCallback(() => {
    return commandManager.undo();
  }, []);

  const redo = useCallback(() => {
    return commandManager.redo();
  }, []);

  const getUndoRedoState = useCallback((): UndoRedoState => {
    return commandManager.getState();
  }, []);

  const clearHistory = useCallback(() => {
    commandManager.clear();
  }, []);

  return {
    // Command execution
    executeTextEdit,
    executeDeleteElement,
    executeAddElement,
    executeSelection,
    
    // Repeat item commands
    executeCopyRepeatItem,
    executeCutRepeatItem,
    executePasteRepeatItem,
    
    // Clipboard utilities
    getClipboardData,
    hasClipboardData,
    clearClipboard,
    
    // History management
    undo,
    redo,
    getUndoRedoState,
    clearHistory,
    
    // Direct access to manager for advanced use cases
    commandManager,
  };
};

/**
 * Hook for undo/redo keyboard shortcuts
 */
export const useHistoryHotkeys = () => {
  const { undo, redo, getUndoRedoState } = useHistory();
  
  return {
    undo,
    redo,
    getUndoRedoState,
  };
};