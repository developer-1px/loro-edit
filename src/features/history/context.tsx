// src/features/history/context.tsx

import React, { createContext, useContext, type ReactNode } from 'react';
import { useHistory } from './hooks';

interface HistoryContextType {
  executeTextEdit: (elementId: string, newText: string) => boolean;
  executeDeleteElement: (elementId: string) => boolean;
  executeAddElement: (containerId: string) => boolean;
  executeSelection: (selection: any) => boolean;
  undo: () => boolean;
  redo: () => boolean;
  getUndoRedoState: () => any;
  clearHistory: () => void;
}

const HistoryContext = createContext<HistoryContextType | null>(null);

interface HistoryProviderProps {
  children: ReactNode;
}

/**
 * Provider for history functionality
 * Provides command execution and undo/redo capabilities to the entire app
 */
export const HistoryProvider: React.FC<HistoryProviderProps> = ({ children }) => {
  const historyMethods = useHistory();

  return (
    <HistoryContext.Provider value={historyMethods}>
      {children}
    </HistoryContext.Provider>
  );
};

/**
 * Hook to access history functionality from anywhere in the component tree
 */
export const useHistoryContext = (): HistoryContextType => {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistoryContext must be used within a HistoryProvider');
  }
  return context;
};