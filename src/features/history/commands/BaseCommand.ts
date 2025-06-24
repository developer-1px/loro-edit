// src/commands/BaseCommand.ts

import type { Command, CommandContext } from './types';
import type { ParsedElement } from '../../../types';
import { findElementById, removeElement, updateElement } from '../../../utils/elementUtils';

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

  // Common utilities for element operations
  protected findElement(elementId: string): ParsedElement | null {
    return findElementById(this.context.parsedElements, elementId);
  }

  protected removeElement(elementId: string): ParsedElement[] {
    return removeElement(this.context.parsedElements, elementId);
  }

  protected updateElement(elementId: string, updater: (element: ParsedElement) => ParsedElement): ParsedElement[] {
    return updateElement(this.context.parsedElements, elementId, updater);
  }

  protected validateElement(elementId: string): ParsedElement {
    const element = this.findElement(elementId);
    if (!element) {
      throw new Error(`Element ${elementId} not found`);
    }
    return element;
  }

  protected markAsExecuted(): void {
    this.executed = true;
  }

  protected markAsUnexecuted(): void {
    this.executed = false;
  }
}