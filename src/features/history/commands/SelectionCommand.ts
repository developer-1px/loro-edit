// src/commands/SelectionCommand.ts

import { BaseCommand } from './BaseCommand';
import type { CommandContext } from './types';
import type { SelectionState } from '../../../types';

export class SelectionCommand extends BaseCommand {
  private previousSelection: SelectionState;
  private newSelection: Partial<SelectionState>;

  constructor(
    newSelection: Partial<SelectionState>,
    context: CommandContext
  ) {
    const elementId = newSelection.selectedElementId;
    const mode = newSelection.mode;
    
    super(
      'Selection',
      `Select ${elementId ? `element ${elementId.substring(0, 8)}... in ${mode} mode` : 'nothing'}`,
      context
    );
    
    this.newSelection = newSelection;
    this.previousSelection = { ...context.selection };
  }

  execute(): void {
    this.context.setSelection(this.newSelection);
    this.markAsExecuted();
  }

  undo(): void {
    this.context.setSelection(this.previousSelection);
    this.markAsUnexecuted();
  }

  // Selection commands should not normally be undoable in most editors
  // but can be useful for certain workflows
  canUndo(): boolean {
    return false; // Disable undo for selection changes by default
  }
}