// SelectionManager - Central selection system

import type { 
  SelectionContext, 
  SelectionCandidate, 
  SelectionResult, 
  SelectionStrategy, 
  ISelectionManager,
  SelectionMode 
} from './types';
import { useEditorStore } from '@/store/editorStore';
import { log } from '@/utils/logger';

export class SelectionManager implements ISelectionManager {
  private static instance: SelectionManager;
  private strategies = new Map<string, SelectionStrategy>();
  
  private constructor() {}
  
  static getInstance(): SelectionManager {
    if (!SelectionManager.instance) {
      SelectionManager.instance = new SelectionManager();
    }
    return SelectionManager.instance;
  }
  
  registerStrategy(pluginName: string, strategy: SelectionStrategy): void {
    this.strategies.set(pluginName, strategy);
    log.selection('info', `Registered selection strategy for ${pluginName}`);
  }
  
  findSelectionAt(context: SelectionContext): SelectionResult | null {
    log.selection('debug', '=== Selection Manager: Finding selection ===', {
      point: context.point,
      elementsCount: context.elementsAtPoint.length,
      currentSelection: context.currentSelection
    });
    
    // Step 1: Collect all candidates
    const candidates: SelectionCandidate[] = [];
    
    for (const element of context.elementsAtPoint) {
      const elementId = element.getAttribute('data-element-id');
      if (!elementId) continue;
      
      // Get plugin name from element
      const pluginName = element.getAttribute('data-plugin-name') || 
                        element.getAttribute('data-element-type') ||
                        'unknown';
      
      const strategy = this.strategies.get(pluginName);
      if (!strategy) {
        log.selection('debug', `No strategy for plugin: ${pluginName}`);
        continue;
      }
      
      const candidate = strategy.evaluate(element, context);
      if (candidate) {
        candidates.push({ ...candidate, pluginName });
        log.selection('debug', `Candidate found`, {
          elementId: candidate.elementId,
          plugin: pluginName,
          priority: candidate.priority,
          mode: candidate.mode,
          reason: candidate.reason
        });
      }
    }
    
    if (candidates.length === 0) {
      log.selection('warn', 'No selection candidates found');
      return null;
    }
    
    // Step 2: Sort candidates by priority
    candidates.sort((a, b) => {
      // First, check if any plugin has a custom comparator
      const strategyA = this.strategies.get(a.pluginName);
      const strategyB = this.strategies.get(b.pluginName);
      
      if (strategyA?.compare) {
        const comparison = strategyA.compare(a, b, context);
        if (comparison !== 0) return -comparison; // Negative because we want descending order
      }
      
      if (strategyB?.compare) {
        const comparison = strategyB.compare(b, a, context);
        if (comparison !== 0) return comparison;
      }
      
      // Default: sort by priority (descending)
      return b.priority - a.priority;
    });
    
    // Step 3: Select the best candidate
    const selected = candidates[0];
    log.selection('info', '✅ Selection made', {
      elementId: selected.elementId,
      plugin: selected.pluginName,
      mode: selected.mode,
      reason: selected.reason
    });
    
    // Step 4: Notify the plugin of selection
    const strategy = this.strategies.get(selected.pluginName);
    const result: SelectionResult = {
      elementId: selected.elementId,
      mode: selected.mode
    };
    
    if (strategy?.onSelected) {
      strategy.onSelected(selected.element, result);
    }
    
    return result;
  }
  
  getSelection(): { elementId: string; mode: SelectionMode } | null {
    const store = useEditorStore.getState();
    const elementId = store.selection.selectedElementId;
    const mode = store.selection.mode as SelectionMode;
    
    if (!elementId) return null;
    return { elementId, mode };
  }
  
  setSelection(elementId: string, mode?: SelectionMode): void {
    const store = useEditorStore.getState();
    store.setSelection({ selectedElementId: elementId, mode: mode === 'none' ? null : mode || 'block' });
  }
  
  clearSelection(): void {
    const store = useEditorStore.getState();
    store.setSelection({ selectedElementId: null, mode: null });
  }
}

export const selectionManager = SelectionManager.getInstance();