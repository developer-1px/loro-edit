// src/features/clipboard/ClipboardManager.ts

import type { ClipboardManager, ClipboardHandler, ClipboardData } from './types';
import type { ParsedElement } from '../../types';

class ClipboardManagerImpl implements ClipboardManager {
  private handlers: Map<string, ClipboardHandler> = new Map();
  private clipboardData: ClipboardData | null = null;
  
  constructor() {
    // Listen for browser clipboard events (optional enhancement)
    if (typeof window !== 'undefined') {
      this.setupBrowserClipboard();
    }
  }
  
  registerHandler(handler: ClipboardHandler): void {
    if (this.handlers.has(handler.type)) {
      console.warn(`Clipboard handler for type "${handler.type}" already registered, overwriting...`);
    }
    this.handlers.set(handler.type, handler);
    console.log(`📋 Registered clipboard handler: ${handler.name} (${handler.type})`);
  }
  
  unregisterHandler(type: string): void {
    if (this.handlers.delete(type)) {
      console.log(`📋 Unregistered clipboard handler: ${type}`);
    }
  }
  
  getHandlers(): ClipboardHandler[] {
    return Array.from(this.handlers.values());
  }
  
  findHandler(element: ParsedElement): ClipboardHandler | null {
    // Try handlers in reverse order (last registered has priority)
    const handlers = Array.from(this.handlers.values()).reverse();
    
    for (const handler of handlers) {
      if (handler.canHandle(element)) {
        return handler;
      }
    }
    
    return null;
  }
  
  getData(): ClipboardData | null {
    return this.clipboardData;
  }
  
  setData(data: ClipboardData): void {
    this.clipboardData = data;
    
    // Optional: Also sync with browser clipboard
    if (typeof window !== 'undefined' && navigator.clipboard) {
      try {
        const jsonData = JSON.stringify(data);
        navigator.clipboard.writeText(jsonData).catch(err => {
          console.warn('Failed to sync with browser clipboard:', err);
        });
      } catch (err) {
        console.warn('Failed to serialize clipboard data:', err);
      }
    }
  }
  
  clear(): void {
    this.clipboardData = null;
  }
  
  hasData(): boolean {
    return this.clipboardData !== null;
  }
  
  private setupBrowserClipboard(): void {
    // Optional: Listen for paste events from outside the app
    document.addEventListener('paste', async (e) => {
      if (!e.clipboardData) return;
      
      try {
        const text = e.clipboardData.getData('text/plain');
        if (text && text.startsWith('{"type":')) {
          // Try to parse as our clipboard format
          const data = JSON.parse(text) as ClipboardData;
          if (data.type && data.data) {
            this.clipboardData = data;
            console.log('📋 Loaded clipboard data from browser:', data.type);
          }
        }
      } catch (err) {
        // Ignore parsing errors
      }
    });
  }
}

// Export singleton instance
export const clipboardManager = new ClipboardManagerImpl();