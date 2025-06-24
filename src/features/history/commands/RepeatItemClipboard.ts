// src/features/history/commands/RepeatItemClipboard.ts

import type { ParsedElement } from '../../../types';

export interface RepeatItemClipboardData {
  item: ParsedElement;
  sourceContainerId: string;
  sourceIndex: number;
  timestamp: number;
  operation: 'copy' | 'cut';
}

/**
 * Global clipboard for repeat items
 * This maintains the copied/cut repeat item data across the application
 */
class RepeatItemClipboard {
  private data: RepeatItemClipboardData | null = null;

  setData(data: RepeatItemClipboardData): void {
    this.data = data;
    console.log(`📋 Clipboard: ${data.operation} repeat-item`, {
      itemId: data.item.id,
      containerId: data.sourceContainerId,
      index: data.sourceIndex
    });
  }

  getData(): RepeatItemClipboardData | null {
    return this.data;
  }

  hasData(): boolean {
    return this.data !== null;
  }

  clear(): void {
    if (this.data) {
      console.log('🗑️ Clipboard: cleared');
      this.data = null;
    }
  }

  isCut(): boolean {
    return this.data?.operation === 'cut';
  }

  isCopy(): boolean {
    return this.data?.operation === 'copy';
  }
}

export const repeatItemClipboard = new RepeatItemClipboard();