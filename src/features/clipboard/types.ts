// src/features/clipboard/types.ts

import type { ParsedElement } from '../../types';

/**
 * Clipboard data with type information
 */
export interface ClipboardData {
  type: string; // 'section', 'repeat-item', 'text', etc.
  data: any;
  operation: 'copy' | 'cut';
  timestamp: number;
}

/**
 * Clipboard handler for specific element types
 */
export interface ClipboardHandler {
  /** Unique type identifier for this handler */
  type: string;
  
  /** Display name for UI */
  name: string;
  
  /** Check if this handler can handle the selected element */
  canHandle: (element: ParsedElement) => boolean;
  
  /** Check if this handler can paste to the target element */
  canPaste: (target: ParsedElement | null, clipboardData: ClipboardData) => boolean;
  
  /** Copy the element to clipboard */
  copy: (element: ParsedElement) => ClipboardData | null;
  
  /** Cut the element (copy + prepare for removal) */
  cut: (element: ParsedElement) => ClipboardData | null;
  
  /** Paste clipboard data at the target location */
  paste: (target: ParsedElement | null, clipboardData: ClipboardData, context: PasteContext) => PasteResult;
  
  /** Optional: Get a preview of what will be pasted */
  getPreview?: (clipboardData: ClipboardData) => string;
}

/**
 * Context provided during paste operations
 */
export interface PasteContext {
  /** All parsed elements in the editor */
  parsedElements: ParsedElement[];
  
  /** Current selection state */
  selection: {
    selectedElementId: string | null;
    mode: 'block' | 'text' | null;
  };
  
  /** Optional: Index to insert at (for ordered collections) */
  insertIndex?: number;
}

/**
 * Result of a paste operation
 */
export interface PasteResult {
  /** Whether the paste was successful */
  success: boolean;
  
  /** Updated elements after paste */
  updatedElements?: ParsedElement[];
  
  /** ID of the newly pasted element */
  pastedElementId?: string;
  
  /** Error message if paste failed */
  error?: string;
}

/**
 * Global clipboard manager interface
 */
export interface ClipboardManager {
  /** Register a clipboard handler */
  registerHandler(handler: ClipboardHandler): void;
  
  /** Unregister a clipboard handler */
  unregisterHandler(type: string): void;
  
  /** Get all registered handlers */
  getHandlers(): ClipboardHandler[];
  
  /** Find handler for an element */
  findHandler(element: ParsedElement): ClipboardHandler | null;
  
  /** Get current clipboard data */
  getData(): ClipboardData | null;
  
  /** Set clipboard data */
  setData(data: ClipboardData): void;
  
  /** Clear clipboard */
  clear(): void;
  
  /** Check if clipboard has data */
  hasData(): boolean;
}