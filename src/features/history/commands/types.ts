// src/commands/types.ts

import type { ParsedElement, SelectionState } from '../../../types';

export interface Command {
  readonly name: string;
  readonly description: string;
  execute(): void;
  undo(): void;
  canExecute?(): boolean;
  canUndo?(): boolean;
}

export interface CommandContext {
  parsedElements: ParsedElement[];
  selection: SelectionState;
  setParsedElements: (elements: ParsedElement[]) => void;
  setSelection: (selection: Partial<SelectionState>) => void;
  updateElement: (elementId: string, updates: Record<string, any>) => void;
}

export interface UndoRedoState {
  canUndo: boolean;
  canRedo: boolean;
  undoDescription?: string;
  redoDescription?: string;
}