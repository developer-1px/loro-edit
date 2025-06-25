// src/store/floatingUIStore.ts

import { create } from 'zustand';

interface FloatingUIState {
  activeElementId: string | null;
  isUIOpen: boolean;
  openFloatingUI: (elementId: string) => void;
  closeFloatingUI: () => void;
  toggleFloatingUI: (elementId: string) => void;
}

export const useFloatingUIStore = create<FloatingUIState>((set, get) => ({
  activeElementId: null,
  isUIOpen: false,
  
  openFloatingUI: (elementId: string) => {
    set({ activeElementId: elementId, isUIOpen: true });
  },
  
  closeFloatingUI: () => {
    set({ activeElementId: null, isUIOpen: false });
  },
  
  toggleFloatingUI: (elementId: string) => {
    const state = get();
    if (state.activeElementId === elementId && state.isUIOpen) {
      set({ activeElementId: null, isUIOpen: false });
    } else {
      set({ activeElementId: elementId, isUIOpen: true });
    }
  }
}));