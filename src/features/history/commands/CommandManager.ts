// src/commands/CommandManager.ts

import type { Command, UndoRedoState } from './types';

export class CommandManager {
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];
  private maxHistorySize = 50;

  execute(command: Command): boolean {
    if (command.canExecute && !command.canExecute()) {
      console.warn(`Command ${command.name} cannot be executed`);
      return false;
    }

    try {
      command.execute();
      
      // Clear redo stack when new command is executed
      this.redoStack.length = 0;
      
      // Add to undo stack
      this.undoStack.push(command);
      
      // Limit stack size
      if (this.undoStack.length > this.maxHistorySize) {
        this.undoStack.shift();
      }
      
      console.log(`✅ Executed command: ${command.name} - ${command.description}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to execute command ${command.name}:`, error);
      return false;
    }
  }

  undo(): boolean {
    const command = this.undoStack.pop();
    if (!command) {
      console.warn('Nothing to undo');
      return false;
    }

    if (command.canUndo && !command.canUndo()) {
      console.warn(`Command ${command.name} cannot be undone`);
      this.undoStack.push(command); // Put it back
      return false;
    }

    try {
      command.undo();
      this.redoStack.push(command);
      console.log(`↩️ Undid command: ${command.name} - ${command.description}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to undo command ${command.name}:`, error);
      this.undoStack.push(command); // Put it back
      return false;
    }
  }

  redo(): boolean {
    const command = this.redoStack.pop();
    if (!command) {
      console.warn('Nothing to redo');
      return false;
    }

    if (command.canExecute && !command.canExecute()) {
      console.warn(`Command ${command.name} cannot be redone`);
      this.redoStack.push(command); // Put it back
      return false;
    }

    try {
      command.execute();
      this.undoStack.push(command);
      console.log(`↪️ Redid command: ${command.name} - ${command.description}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to redo command ${command.name}:`, error);
      this.redoStack.push(command); // Put it back
      return false;
    }
  }

  getState(): UndoRedoState {
    const lastUndo = this.undoStack[this.undoStack.length - 1];
    const lastRedo = this.redoStack[this.redoStack.length - 1];

    return {
      canUndo: this.undoStack.length > 0,
      canRedo: this.redoStack.length > 0,
      undoDescription: lastUndo?.description,
      redoDescription: lastRedo?.description,
    };
  }

  clear(): void {
    this.undoStack.length = 0;
    this.redoStack.length = 0;
    console.log('🗑️ Command history cleared');
  }

  getUndoStackSize(): number {
    return this.undoStack.length;
  }

  getRedoStackSize(): number {
    return this.redoStack.length;
  }
}

// Global command manager instance
export const commandManager = new CommandManager();