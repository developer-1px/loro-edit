// src/plugins/PluginManager.ts

import type {
  Plugin,
  PluginManager as IPluginManager,
  PluginContext,
} from "./types";
import type { ParsedElement } from "../types";
import React from "react";
import { clipboardManager } from "../features/clipboard/ClipboardManager";
import { log } from "../utils/logger";

class PluginManager implements IPluginManager {
  private _plugins: Plugin[] = [];
  private _elementPluginMap = new Map<string, { plugin: Plugin; parsedElement: ParsedElement }>();

  get plugins(): Plugin[] {
    return [...this._plugins];
  }

  register(plugin: Plugin): void {
    const existingIndex = this._plugins.findIndex(p => p.name === plugin.name);
    if (existingIndex !== -1) this.unregister(plugin.name);
    this._plugins.push(plugin);
    
    // Register clipboard handler if present
    if (plugin.clipboardHandler) {
      clipboardManager.registerHandler(plugin.clipboardHandler);
    }
  }

  unregister(pluginName: string): void {
    const pluginIndex = this._plugins.findIndex(p => p.name === pluginName);
    if (pluginIndex === -1) return;
    
    const plugin = this._plugins[pluginIndex];
    
    // Unregister clipboard handler if present
    if (plugin.clipboardHandler) {
      clipboardManager.unregisterHandler(plugin.clipboardHandler.type);
    }
    
    this._plugins.splice(pluginIndex, 1);
  }

  getPlugin(element: Element): Plugin | null {
    // Find first matching plugin
    const tagName = element.tagName.toLowerCase();
    
    // Log important elements with plugin system tag
    if (tagName === 'button' || tagName === 'form' || tagName === 'input') {
      log.plugin('debug', `Finding plugin for ${tagName}`, {
        tagName,
        className: element.className,
        id: element.id
      });
    }
    
    for (const plugin of this._plugins) {
      const matches = plugin.match(element);
      
      if (tagName === 'button' || tagName === 'form' || tagName === 'input') {
        log.plugin('debug', `Trying ${plugin.name}`, { matches });
      }
      
      if (matches) {
        if (tagName === 'button' || tagName === 'form' || tagName === 'input') {
          log.plugin('info', `Matched with ${plugin.name}`, { tagName });
        }
        return plugin;
      }
    }
    
    log.plugin('warn', 'No plugin matched', { tagName });
    return null;
  }

  parseElement(element: Element): ParsedElement | null {
    const plugin = this.getPlugin(element);
    return plugin?.parse(element) || null;
  }

  renderElement(
    domElement: Element,
    parsedElement: ParsedElement,
    context: PluginContext,
    renderElement: (element: ParsedElement) => React.ReactNode
  ): React.ReactNode {
    let plugin: Plugin | null = null;
    
    // For text elements, use text plugin directly
    if (parsedElement.type === 'text') {
      plugin = this._plugins.find(p => p.name === 'text') || null;
      if (!plugin) {
        log.plugin('warn', 'Text plugin not found');
        return null;
      }
      // Text elements are handled specially
    } else {
      // For other elements, find plugin by matching the DOM element
      plugin = this.getPlugin(domElement);
    }
    
    if (!plugin) {
      log.plugin('warn', 'No plugin found for element', { tagName: domElement.tagName });
      return null;
    }

    // Always update mapping for HMR compatibility
    this._elementPluginMap.set(parsedElement.id, { plugin, parsedElement });
    
    // Log element mapping with plugin tag
    const tagName = 'tagName' in parsedElement ? parsedElement.tagName : 'N/A';
    if (tagName === 'button' || tagName === 'form' || tagName === 'input' || plugin.name === 'text' || plugin.name !== 'element') {
      log.plugin('debug', `Mapping element to plugin ${plugin.name}`, {
        elementId: parsedElement.id,
        type: parsedElement.type,
        tagName,
        selectable: plugin.selectable?.enabled,
        level: plugin.selectable?.level,
        content: parsedElement.type === 'text' ? (parsedElement as any).content?.substring(0, 20) : undefined
      });
    }

    const canEditText = context.selection.mode === "text" &&
                       parsedElement.type === "text" &&
                       context.selection.selectedElementId === parsedElement.id;

    try {
      const isSelected = context.selection.selectedElementId === parsedElement.id;
      return plugin.render({ parsedElement, context, renderElement, canEditText, isSelected }) || null;
    } catch (error) {
      log.plugin('error', `Error rendering with plugin ${plugin.name}`, { error: error instanceof Error ? error.message : String(error) });
      return null;
    }
  }

  getPluginById(elementId: string): Plugin | null {
    return this._elementPluginMap.get(elementId)?.plugin || null;
  }

  findSelectableAtPoint(x: number, y: number, currentSelection?: string, currentMode?: 'text' | 'block' | null): { elementId: string; mode: 'text' | 'block' } | null {
    // First check if click is within main editor area
    const previewContainer = document.querySelector('[data-preview-container]');
    if (!previewContainer) {
      log.selection('warn', 'Preview container not found');
      return null;
    }

    const containerRect = previewContainer.getBoundingClientRect();
    const isWithinContainer = x >= containerRect.left && x <= containerRect.right && 
                             y >= containerRect.top && y <= containerRect.bottom;
    
    if (!isWithinContainer) {
      log.selection('debug', 'Click outside main editor area, skipping', { x, y, containerRect });
      return null;
    }
    
    const allElementsAtPoint = document.elementsFromPoint(x, y);
    
    // Filter to only elements that belong to the main editor container
    // Exclude any elements from section preview renderers (scaled thumbnails)
    const elementsAtPoint = allElementsAtPoint.filter(el => {
      // Must be contained within the main preview container
      if (!previewContainer.contains(el)) {
        return false;
      }
      
      // Exclude elements from scaled preview renderers
      const previewRenderer = el.closest('[data-section-preview-renderer]');
      if (previewRenderer) {
        log.selection('debug', 'Excluding element from section preview renderer', { 
          element: el.tagName, 
          className: el.className 
        });
        return false;
      }
      
      return true;
    });

    log.selection('debug', 'Filtered elements', { 
      totalElements: allElementsAtPoint.length,
      filteredElements: elementsAtPoint.length
    });
    
    log.selection('debug', '=== findSelectableAtPoint START ===');
    log.selection('debug', 'Click position and context', { x, y, currentSelection, currentMode, elementsFound: elementsAtPoint.length });
    
    // Skip control elements, overlays, floating UI, and section wrappers from PluginBasedEditor
    const hasControlElement = elementsAtPoint.some(el => {
      const htmlEl = el as HTMLElement;
      return htmlEl.closest('[data-selection-overlay]') ||
             htmlEl.closest('[data-preview-controls]') ||
             htmlEl.closest('[data-radix-popover-content]') ||
             htmlEl.closest('[data-radix-tabs-content]') ||
             htmlEl.closest('[data-radix-tabs-list]') ||
             htmlEl.closest('[data-radix-tabs-trigger]') ||
             htmlEl.closest('[data-floating-ui]') ||
             htmlEl.classList.contains('floating-menu') ||
             htmlEl.closest('.floating-menu') ||
             htmlEl.classList.contains('bg-gray-900') || // Floating menu style
             htmlEl.classList.contains('popover-content') ||
             htmlEl.closest('.popover-content') ||
             (htmlEl.tagName === 'INPUT' && htmlEl.style.display === 'none');
    });

    // Filter out section wrapper elements created by PluginBasedEditor
    const filteredElements = elementsAtPoint.filter(el => {
      const htmlEl = el as HTMLElement;
      // Skip section wrappers that have data-section-id but no data-element-id
      if (htmlEl.tagName === 'SECTION' && 
          htmlEl.dataset.sectionId && 
          !htmlEl.dataset.elementId &&
          htmlEl.classList.contains('section-wrapper')) {
        log.selection('debug', 'Skipping section wrapper', { 
          sectionId: htmlEl.dataset.sectionId,
          className: htmlEl.className 
        });
        return false;
      }
      return true;
    });

    if (hasControlElement) {
      log.selection('warn', 'Control element or floating UI detected, skipping selection');
      return null;
    }
    
    // Step 1: Collect all selectable elements
    const selectableElements: Array<{
      elementId: string;
      plugin: Plugin;
      level: 'container' | 'element' | 'content';
      priority: number;
      element: Element;
    }> = [];
    
    log.selection('debug', 'Checking elements at point', { 
      totalElements: elementsAtPoint.length,
      filteredElements: filteredElements.length 
    });
    
    for (const domElement of filteredElements) {
      const elementId = (domElement as HTMLElement).dataset?.elementId;
      if (!elementId) {
        log.selection('debug', 'Element has no data-element-id', { tagName: domElement.tagName, className: domElement.className });
        continue;
      }

      const mapping = this._elementPluginMap.get(elementId);
      if (!mapping) {
        log.selection('debug', 'No mapping found for element', { elementId });
        continue;
      }

      // Skip fallback plugin or non-selectable
      if (mapping.plugin.name === 'element' || !mapping.plugin.selectable?.enabled) {
        log.selection('debug', 'Skipping non-selectable element', { 
          elementId, 
          pluginName: mapping.plugin.name,
          selectable: mapping.plugin.selectable?.enabled 
        });
        continue;
      }

      selectableElements.push({
        elementId,
        plugin: mapping.plugin,
        level: mapping.plugin.selectable.level,
        priority: mapping.plugin.selectable.priority,
        element: domElement
      });
      
      log.selection('info', 'Found selectable element', { 
        elementId, 
        pluginName: mapping.plugin.name, 
        level: mapping.plugin.selectable.level 
      });
    }
    
    if (selectableElements.length === 0) {
      log.selection('warn', 'No selectable elements found at click point');
      return null;
    }
    
    // Step 2: Selection logic with hierarchy
    log.selection('debug', 'Selection logic with hierarchy', { 
      selectableElements: selectableElements.map(el => `${el.plugin.name}(${el.level})`) 
    });
    
    // If text mode, prefer text
    if (currentMode === 'text') {
      const textElement = selectableElements.find(el => el.plugin.name === 'text');
      if (textElement) {
        log.selection('info', 'Text mode: selecting text element', { elementId: textElement.elementId });
        return { elementId: textElement.elementId, mode: 'text' };
      }
    }
    
    // Level priority: container=0, element=1, content=2
    const levelPriority = { 'container': 0, 'element': 1, 'content': 2 };
    
    // If we have a current selection, handle hierarchy
    if (currentSelection) {
      // Get current selection's level
      const currentMapping = this._elementPluginMap.get(currentSelection);
      const currentLevel = currentMapping?.plugin.selectable?.level;
      const currentLevelPriority = currentLevel ? levelPriority[currentLevel] : -1;
      
      log.selection('debug', 'Current selection level', { currentLevel, priority: currentLevelPriority });
      
      const currentElement = document.querySelector(`[data-element-id="${currentSelection}"]`);
      if (currentElement) {
        // Check if clicking on a child of current selection
        const childElements = selectableElements.filter(el => {
          return currentElement.contains(el.element) && el.elementId !== currentSelection;
        });
        
        if (childElements.length > 0) {
          // Select child with next level
          childElements.sort((a, b) => {
            const levelDiff = levelPriority[a.level] - levelPriority[b.level];
            if (levelDiff !== 0) return levelDiff;
            return a.priority - b.priority;
          });
          
          const child = childElements[0];
          log.selection('info', 'Selecting child element', { pluginName: child.plugin.name, level: child.level });
          return {
            elementId: child.elementId,
            mode: child.plugin.name === 'text' ? 'text' : 'block'
          };
        }
      }
      
      // Not clicking on child - handle based on current selection
      if (currentLevel) {
        // First, try to find same level elements
        const sameLevelElements = selectableElements.filter(el => el.level === currentLevel);
        
        if (sameLevelElements.length > 0) {
          sameLevelElements.sort((a, b) => a.priority - b.priority);
          const selected = sameLevelElements[0];
          log.selection('info', 'Selecting same level', { pluginName: selected.plugin.name, level: selected.level });
          return {
            elementId: selected.elementId,
            mode: selected.plugin.name === 'text' || selected.level === 'content' ? 'text' : 'block'
          };
        }
        
        // In text mode, allow selecting other content or elements
        if (currentMode === 'text') {
          const selectableItems = selectableElements.filter(el => 
            (el.level === 'content' && el.plugin.name !== 'text') || el.level === 'element'
          );
          if (selectableItems.length > 0) {
            selectableItems.sort((a, b) => {
              const levelDiff = levelPriority[a.level] - levelPriority[b.level];
              if (levelDiff !== 0) return -levelDiff;
              return a.priority - b.priority;
            });
            const selected = selectableItems[0];
            log.selection('info', 'Text mode selection', { level: selected.level, pluginName: selected.plugin.name });
            return {
              elementId: selected.elementId,
              mode: selected.level === 'content' ? 'text' : 'block'
            };
          }
        }
      }
    }
    
    // Default: Sort by level (prefer smallest/most specific level first)
    selectableElements.sort((a, b) => {
      // Reverse order - prefer content (2) > element (1) > container (0)
      const levelDiff = levelPriority[b.level] - levelPriority[a.level];
      if (levelDiff !== 0) return levelDiff;
      return a.priority - b.priority;
    });
    
    const selected = selectableElements[0];
    const mode = selected.plugin.name === 'text' || selected.level === 'content' ? 'text' : 'block';
    
    log.selection('info', 'Default selection made', { 
      elementId: selected.elementId,
      pluginName: selected.plugin.name, 
      level: selected.level,
      mode 
    });
    
    return {
      elementId: selected.elementId,
      mode
    };
  }


  clearElementMapping(): void {
    this._elementPluginMap.clear();
  }

  clearAllPlugins(): void {
    // Unregister all clipboard handlers
    this._plugins.forEach(plugin => {
      if (plugin.clipboardHandler) {
        clipboardManager.unregisterHandler(plugin.clipboardHandler.type);
      }
    });
    
    // Clear plugins array and mapping
    this._plugins = [];
    this._elementPluginMap.clear();
    
    log.plugin('info', 'Cleared all plugins');
  }
}

export const pluginManager = new PluginManager();
export default pluginManager;
