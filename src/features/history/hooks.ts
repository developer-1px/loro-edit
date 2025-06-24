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
import { MoveSectionCommand } from './commands/MoveSectionCommand';
import { CopySectionCommand } from './commands/CopySectionCommand';
import { CutSectionCommand } from './commands/CutSectionCommand';
import { PasteSectionCommand } from './commands/PasteSectionCommand';
import { UniversalCopyCommand } from './commands/UniversalCopyCommand';
import { UniversalCutCommand } from './commands/UniversalCutCommand';
import { UniversalPasteCommand } from './commands/UniversalPasteCommand';
import { repeatItemClipboard } from './commands/RepeatItemClipboard';
import { sectionClipboard } from './commands/CopySectionCommand';
import { clipboardManager } from '../clipboard/ClipboardManager';
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

  // Section commands
  const executeMoveSection = useCallback((fromIndex: number, toIndex: number) => {
    const command = new MoveSectionCommand(fromIndex, toIndex, getCommandContext());
    return commandManager.execute(command);
  }, [getCommandContext]);

  const executeCopySection = useCallback((sectionId: string) => {
    const command = new CopySectionCommand(sectionId, getCommandContext());
    return commandManager.execute(command);
  }, [getCommandContext]);

  const executeCutSection = useCallback((sectionId: string) => {
    const command = new CutSectionCommand(sectionId, getCommandContext());
    return commandManager.execute(command);
  }, [getCommandContext]);

  const executePasteSection = useCallback((insertAfterIndex: number) => {
    const command = new PasteSectionCommand(insertAfterIndex, getCommandContext());
    return commandManager.execute(command);
  }, [getCommandContext]);

  // Universal clipboard commands
  const executeUniversalCopy = useCallback((elementId: string) => {
    const command = new UniversalCopyCommand(elementId, getCommandContext());
    return commandManager.execute(command);
  }, [getCommandContext]);

  const executeUniversalCut = useCallback((elementId: string) => {
    const command = new UniversalCutCommand(elementId, getCommandContext());
    return commandManager.execute(command);
  }, [getCommandContext]);

  const executeUniversalPaste = useCallback((targetElementId: string | null, insertIndex?: number) => {
    const command = new UniversalPasteCommand(targetElementId, getCommandContext(), insertIndex);
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

  // Section clipboard utilities
  const getSectionClipboardData = useCallback(() => {
    return sectionClipboard.getData();
  }, []);

  const hasSectionClipboardData = useCallback(() => {
    return sectionClipboard.hasData();
  }, []);

  const clearSectionClipboard = useCallback(() => {
    sectionClipboard.clear();
  }, []);

  // Universal clipboard utilities
  const getUniversalClipboardData = useCallback(() => {
    return clipboardManager.getData();
  }, []);

  const hasUniversalClipboardData = useCallback(() => {
    return clipboardManager.hasData();
  }, []);

  const clearUniversalClipboard = useCallback(() => {
    clipboardManager.clear();
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
    
    // Section commands
    executeMoveSection,
    executeCopySection,
    executeCutSection,
    executePasteSection,
    
    // Clipboard utilities
    getClipboardData,
    hasClipboardData,
    clearClipboard,
    
    // Section clipboard utilities
    getSectionClipboardData,
    hasSectionClipboardData,
    clearSectionClipboard,
    
    // Universal clipboard commands
    executeUniversalCopy,
    executeUniversalCut,
    executeUniversalPaste,
    
    // Universal clipboard utilities
    getUniversalClipboardData,
    hasUniversalClipboardData,
    clearUniversalClipboard,
    
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