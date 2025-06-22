import { useCallback, useState } from 'react';

interface ClipboardItem<T> {
  id: string;
  data: T;
  timestamp: number;
  operation: 'copy' | 'cut';
}

interface UseClipboardOperationsOptions<T> {
  maxItems?: number;
  onCopy?: (item: T) => void;
  onCut?: (item: T) => void;
  onPaste?: (item: T, targetId: string) => void;
  deepClone?: boolean;
}

export const useClipboardOperations = <T extends { id: string }>(
  findItem: (id: string) => T | null,
  addItem: (item: T, targetId: string) => void,
  removeItem: (id: string) => void,
  options: UseClipboardOperationsOptions<T> = {}
) => {
  const {
    maxItems = 10,
    onCopy,
    onCut,
    onPaste,
    deepClone = true,
  } = options;

  const [clipboard, setClipboard] = useState<ClipboardItem<T>[]>([]);
  // const { cloneElements } = useDeepTreeOperations(); // Unused for now

  const deepCloneItem = useCallback((item: T): T => {
    if (!deepClone) return item;
    
    // Use JSON clone for simple objects or custom clone for complex ones
    try {
      return JSON.parse(JSON.stringify(item));
    } catch {
      // Fallback to shallow clone if JSON fails
      return { ...item };
    }
  }, [deepClone]);

  const copyItem = useCallback((itemId: string): boolean => {
    const item = findItem(itemId);
    if (!item) return false;

    const clonedItem = deepCloneItem(item);
    const clipboardItem: ClipboardItem<T> = {
      id: crypto.randomUUID(),
      data: clonedItem,
      timestamp: Date.now(),
      operation: 'copy',
    };

    setClipboard(prev => {
      const newClipboard = [clipboardItem, ...prev];
      return newClipboard.slice(0, maxItems);
    });

    onCopy?.(clonedItem);
    return true;
  }, [findItem, deepCloneItem, maxItems, onCopy]);

  const cutItem = useCallback((itemId: string): boolean => {
    const item = findItem(itemId);
    if (!item) return false;

    const clonedItem = deepCloneItem(item);
    const clipboardItem: ClipboardItem<T> = {
      id: crypto.randomUUID(),
      data: clonedItem,
      timestamp: Date.now(),
      operation: 'cut',
    };

    setClipboard(prev => {
      const newClipboard = [clipboardItem, ...prev];
      return newClipboard.slice(0, maxItems);
    });

    // Remove the original item
    removeItem(itemId);
    
    onCut?.(clonedItem);
    return true;
  }, [findItem, deepCloneItem, removeItem, maxItems, onCut]);

  const pasteItem = useCallback((targetId: string, clipboardIndex = 0): boolean => {
    const clipboardItem = clipboard[clipboardIndex];
    if (!clipboardItem) return false;

    // Create a new item with a new ID
    const newItem = {
      ...deepCloneItem(clipboardItem.data),
      id: crypto.randomUUID(),
    };

    addItem(newItem, targetId);
    onPaste?.(newItem, targetId);
    return true;
  }, [clipboard, deepCloneItem, addItem, onPaste]);

  const pasteAndRemove = useCallback((targetId: string, clipboardIndex = 0): boolean => {
    if (pasteItem(targetId, clipboardIndex)) {
      // Remove the item from clipboard
      setClipboard(prev => prev.filter((_, index) => index !== clipboardIndex));
      return true;
    }
    return false;
  }, [pasteItem]);

  const clearClipboard = useCallback(() => {
    setClipboard([]);
  }, []);

  const removeFromClipboard = useCallback((clipboardId: string) => {
    setClipboard(prev => prev.filter(item => item.id !== clipboardId));
  }, []);

  const getClipboardPreview = useCallback((clipboardIndex = 0) => {
    const item = clipboard[clipboardIndex];
    return item ? {
      operation: item.operation,
      timestamp: item.timestamp,
      data: item.data,
    } : null;
  }, [clipboard]);

  const hasClipboardData = clipboard.length > 0;
  const clipboardCount = clipboard.length;
  const lastOperation = clipboard[0]?.operation || null;

  // Batch operations
  const copyMultiple = useCallback((itemIds: string[]): number => {
    let successCount = 0;
    itemIds.forEach(id => {
      if (copyItem(id)) successCount++;
    });
    return successCount;
  }, [copyItem]);

  const cutMultiple = useCallback((itemIds: string[]): number => {
    let successCount = 0;
    itemIds.forEach(id => {
      if (cutItem(id)) successCount++;
    });
    return successCount;
  }, [cutItem]);

  const pasteMultiple = useCallback((targetId: string, count = clipboard.length): number => {
    let successCount = 0;
    for (let i = 0; i < Math.min(count, clipboard.length); i++) {
      if (pasteItem(targetId, 0)) { // Always paste from index 0 (most recent)
        successCount++;
      }
    }
    return successCount;
  }, [clipboard.length, pasteItem]);

  return {
    // Basic operations
    copyItem,
    cutItem,
    pasteItem,
    pasteAndRemove,
    
    // Batch operations
    copyMultiple,
    cutMultiple,
    pasteMultiple,
    
    // Clipboard management
    clearClipboard,
    removeFromClipboard,
    getClipboardPreview,
    
    // State
    clipboard,
    hasClipboardData,
    clipboardCount,
    lastOperation,
  };
};