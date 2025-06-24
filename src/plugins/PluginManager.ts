// src/plugins/PluginManager.ts

import type {
  Plugin,
  PluginManager as IPluginManager,
  PluginContext,
} from "./types";
import type { ParsedElement } from "../types";
import React from "react";
import { clipboardManager } from "../features/clipboard/ClipboardManager";

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
    
    // Only log important elements
    if (tagName === 'button' || tagName === 'form' || tagName === 'input') {
      console.log(`🔌 Finding plugin for:`, {
        tagName,
        className: element.className,
        id: element.id
      });
    }
    
    for (const plugin of this._plugins) {
      const matches = plugin.match(element);
      
      if (tagName === 'button' || tagName === 'form' || tagName === 'input') {
        console.log(`  - Trying ${plugin.name}: ${matches ? '✅' : '❌'}`);
      }
      
      if (matches) {
        if (tagName === 'button' || tagName === 'form' || tagName === 'input') {
          console.log(`  ✅ Matched with ${plugin.name}!`);
        }
        return plugin;
      }
    }
    
    console.log(`  ❌ No plugin matched!`);
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
        console.warn('⚠️ Text plugin not found');
        return null;
      }
      // Text elements are handled specially
    } else {
      // For other elements, find plugin by matching the DOM element
      plugin = this.getPlugin(domElement);
    }
    
    if (!plugin) {
      console.warn(`⚠️ No plugin found for element`, domElement);
      return null;
    }

    // Always update mapping for HMR compatibility
    this._elementPluginMap.set(parsedElement.id, { plugin, parsedElement });
    
    // Only log important elements to reduce noise
    const tagName = 'tagName' in parsedElement ? parsedElement.tagName : 'N/A';
    if (tagName === 'button' || tagName === 'form' || tagName === 'input' || plugin.name === 'text' || plugin.name !== 'element') {
      console.log(`🗺️ Mapping element ${parsedElement.id} to plugin ${plugin.name}`, {
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
      console.error(`❌ Error rendering with plugin ${plugin.name}:`, error);
      return null;
    }
  }

  getPluginById(elementId: string): Plugin | null {
    return this._elementPluginMap.get(elementId)?.plugin || null;
  }

  findSelectableAtPoint(x: number, y: number, currentSelection?: string, currentMode?: 'text' | 'block' | null): { elementId: string; mode: 'text' | 'block' } | null {
    const elementsAtPoint = document.elementsFromPoint(x, y);
    
    console.log('🔍 === findSelectableAtPoint START ===');
    console.log('📍 Click position:', { x, y });
    console.log('📌 Current selection:', currentSelection);
    console.log('📌 Current mode:', currentMode);
    
    // Skip control elements
    const hasControlElement = elementsAtPoint.some(el => {
      const htmlEl = el as HTMLElement;
      return htmlEl.closest('[data-selection-overlay]') ||
             htmlEl.closest('[data-preview-controls]') ||
             (htmlEl.tagName === 'INPUT' && htmlEl.style.display === 'none');
    });

    if (hasControlElement) {
      console.log('⚠️ Control element detected, skipping');
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
    
    console.log('🔎 Checking elements at point:', elementsAtPoint.length);
    
    for (const domElement of elementsAtPoint) {
      const elementId = (domElement as HTMLElement).dataset?.elementId;
      if (!elementId) continue;

      const mapping = this._elementPluginMap.get(elementId);
      if (!mapping) continue;

      // Skip fallback plugin or non-selectable
      if (mapping.plugin.name === 'element' || !mapping.plugin.selectable?.enabled) {
        console.log(`⏭️ Skipping: ${elementId} (${mapping.plugin.name})`);
        continue;
      }

      selectableElements.push({
        elementId,
        plugin: mapping.plugin,
        level: mapping.plugin.selectable.level,
        priority: mapping.plugin.selectable.priority,
        element: domElement
      });
      
      console.log(`✅ Found selectable: ${mapping.plugin.name} (${mapping.plugin.selectable.level})`);
    }
    
    if (selectableElements.length === 0) {
      console.log('❌ No selectable elements found');
      return null;
    }
    
    // Step 2: Selection logic with hierarchy
    console.log('📊 Selectable elements:', selectableElements.map(el => `${el.plugin.name}(${el.level})`));
    
    // If text mode, prefer text
    if (currentMode === 'text') {
      const textElement = selectableElements.find(el => el.plugin.name === 'text');
      if (textElement) {
        console.log('📝 Text mode: selecting text');
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
      
      console.log(`📍 Current selection level: ${currentLevel} (priority: ${currentLevelPriority})`);
      
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
          console.log(`👶 Selecting child: ${child.plugin.name} (${child.level})`);
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
          console.log(`🔄 Selecting same level: ${selected.plugin.name} (${selected.level})`);
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
            console.log(`🎯 Text mode: selecting ${selected.level}: ${selected.plugin.name}`);
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
    console.log(`🎯 Default selection: ${selected.plugin.name} (${selected.level})`);
    
    return {
      elementId: selected.elementId,
      mode: selected.plugin.name === 'text' || selected.level === 'content' ? 'text' : 'block'
    };
  }


  clearElementMapping(): void {
    this._elementPluginMap.clear();
  }
}

export const pluginManager = new PluginManager();
export default pluginManager;
