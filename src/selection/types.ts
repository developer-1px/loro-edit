// Selection System Types

export type SelectionMode = 'text' | 'block' | 'none';

export interface Point {
  x: number;
  y: number;
}

export interface SelectionContext {
  // Click position
  point: Point;
  
  // Current selection state
  currentSelection?: {
    elementId: string;
    mode: SelectionMode;
  };
  
  // Elements at the click point (from top to bottom)
  elementsAtPoint: HTMLElement[];
  
  // Modifier keys
  modifiers: {
    shift: boolean;
    ctrl: boolean;
    alt: boolean;
    meta: boolean;
  };
  
  // Click type
  clickType: 'single' | 'double' | 'triple';
  
  // Editor state
  isEditing: boolean;
}

export interface SelectionCandidate {
  element: HTMLElement;
  elementId: string;
  
  // Selection metadata
  priority: number; // Higher number = higher priority
  mode: SelectionMode;
  
  // Why this element should be selected
  reason: string;
  
  // Plugin that owns this element
  pluginName: string;
}

export interface SelectionResult {
  elementId: string;
  mode: SelectionMode;
  
  // Additional actions to perform
  actions?: SelectionAction[];
}

export interface SelectionAction {
  type: 'focus' | 'scroll' | 'highlight' | 'edit' | 'custom';
  payload?: any;
}

// Plugin Selection Strategy
export interface SelectionStrategy {
  // Evaluate if this element should be a selection candidate
  evaluate(element: HTMLElement, context: SelectionContext): SelectionCandidate | null;
  
  // Compare two candidates (return positive if a > b, negative if a < b)
  compare?(a: SelectionCandidate, b: SelectionCandidate, context: SelectionContext): number;
  
  // Post-selection hook
  onSelected?(element: HTMLElement, result: SelectionResult): void;
}

// Selection Manager Interface
export interface ISelectionManager {
  // Find what to select at a point
  findSelectionAt(context: SelectionContext): SelectionResult | null;
  
  // Register a selection strategy for a plugin
  registerStrategy(pluginName: string, strategy: SelectionStrategy): void;
  
  // Get current selection
  getSelection(): { elementId: string; mode: SelectionMode } | null;
  
  // Set selection programmatically
  setSelection(elementId: string, mode?: SelectionMode): void;
  
  // Clear selection
  clearSelection(): void;
}