// src/commands/BaseCommand.ts

import type { Command, CommandContext } from './types';

export abstract class BaseCommand implements Command {
  public readonly name: string;
  public readonly description: string;
  protected context: CommandContext;
  protected executed = false;

  constructor(
    name: string,
    description: string,
    context: CommandContext
  ) {
    this.name = name;
    this.description = description;
    this.context = context;
  }

  abstract execute(): void;
  abstract undo(): void;

  canExecute(): boolean {
    return !this.executed;
  }

  canUndo(): boolean {
    return this.executed;
  }

  protected markAsExecuted(): void {
    this.executed = true;
  }

  protected markAsUnexecuted(): void {
    this.executed = false;
  }
}