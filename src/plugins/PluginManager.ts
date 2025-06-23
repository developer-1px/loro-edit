// src/plugins/PluginManager.ts

import type {
  Plugin,
  PluginManager as IPluginManager,
  PluginContext,
  PluginRenderProps,
} from "./types";
import type { ParsedElement } from "../types";
import React from "react";

class PluginManager implements IPluginManager {
  private _plugins: Plugin[] = [];
  // Element ID를 통해 plugin 메타데이터에 바로 접근할 수 있는 매핑
  private _elementPluginMap: Map<string, {
    plugin: Plugin;
    parsedElement: ParsedElement;
  }> = new Map();

  get plugins(): Plugin[] {
    return [...this._plugins];
  }

  register(plugin: Plugin): void {
    // Check if plugin with same name already exists
    const existingIndex = this._plugins.findIndex(
      (p) => p.name === plugin.name
    );
    if (existingIndex !== -1) {
      // Unregister existing plugin first
      this.unregister(plugin.name);
    }

    // Add plugin (no priority sorting needed)
    this._plugins.push(plugin);

    // Initialize plugin
    if (plugin.init) {
      plugin.init();
    }

    console.log(`Plugin "${plugin.name}" v${plugin.version} registered`);
  }

  unregister(pluginName: string): void {
    const pluginIndex = this._plugins.findIndex((p) => p.name === pluginName);
    if (pluginIndex === -1) {
      console.warn(`Plugin "${pluginName}" not found`);
      return;
    }

    const plugin = this._plugins[pluginIndex];

    // Cleanup plugin
    if (plugin.destroy) {
      plugin.destroy();
    }

    this._plugins.splice(pluginIndex, 1);
    console.log(`Plugin "${pluginName}" unregistered`);
  }

  getPlugin(element: Element): Plugin | null {
    // First try all specific plugins (not text plugin)
    for (const plugin of this._plugins) {
      if (plugin.name !== "text" && plugin.match(element)) {
        return plugin;
      }
    }

    // If no specific plugin matches, use text plugin as fallback
    const textPlugin = this._plugins.find((p) => p.name === "text");
    return textPlugin || null;
  }

  parseElement(element: Element): ParsedElement | null {
    // Remove excessive logging
    // console.log("Parsing element:", element.tagName, element.className, element);

    // Try specific plugins first (not text plugin)
    for (const plugin of this._plugins) {
      if (plugin.name !== "text" && plugin.match(element)) {
        const result = plugin.parse(element);
        if (result) {
          // console.log("Plugin", plugin.name, "parsed:", result);
          return result;
        }
      }
    }

    // If no specific plugin can parse, try text plugin as fallback
    const textPlugin = this._plugins.find((p) => p.name === "text");
    if (textPlugin) {
      const result = textPlugin.parse(element);
      // console.log("Text plugin parsed:", result);
      return result;
    }

    return null;
  }

  renderElement(
    element: Element,
    parsedElement: ParsedElement,
    context: PluginContext,
    renderElement: (element: ParsedElement) => React.ReactNode
  ): React.ReactNode {
    const plugin = this.getPlugin(element);
    // console.log("Rendering element:", element.tagName, "with plugin:", plugin?.name);

    if (!plugin) {
      console.warn(`No plugin found for element`, element);
      return null;
    }

    // Register element-plugin mapping for quick lookup during selection
    this._elementPluginMap.set(parsedElement.id, {
      plugin,
      parsedElement
    });

    // Calculate render props using unified selection logic
    const canEditText =
      context.selection.mode === "text" &&
      parsedElement.type === "text" &&
      context.selection.selectedElementId === parsedElement.id;

    const renderProps: PluginRenderProps = {
      element,
      parsedElement,
      context,
      renderElement,
      canEditText,
    };

    try {
      const result = plugin.render(renderProps);
      return result || null;
    } catch (error) {
      console.error('Error rendering element with plugin', plugin.name, ':', error);
      return null;
    }
  }

  // New utility functions for the unified selection system
  
  /**
   * Get plugin by element ID from mapping (no DOM query needed)
   */
  getPluginById(elementId: string): Plugin | null {

    console.log("_elementPluginMap_elementPluginMap_elementPluginMap", _elementPluginMap)

    const mapping = this._elementPluginMap.get(elementId);
    return mapping?.plugin || null;
  }

  /**
   * Get element information including type and selectable config
   */
  getElementInfo(elementId: string): {
    plugin: Plugin;
    parsedElement: ParsedElement;
    isSelectable: boolean;
    mode: 'text' | 'block';
  } | null {
    const mapping = this._elementPluginMap.get(elementId);
    if (!mapping) return null;
    
    const { plugin, parsedElement } = mapping;
    const isSelectable = plugin.selectable?.enabled || false;
    
    // Determine mode based on plugin type
    const mode = plugin.name === 'text' ? 'text' : 'block';

    return {
      plugin,
      parsedElement,
      isSelectable,
      mode
    };
  }

  /**
   * Find selectable element at coordinates using elementsFromPoint
   */
  findSelectableAtPoint(x: number, y: number): {
    elementId: string;
    plugin: Plugin;
    mode: 'text' | 'block';
  } | null {
    const elementsAtPoint = document.elementsFromPoint(x, y);
    
    for (const domElement of elementsAtPoint) {
      // Skip if element doesn't have our data-element-id
      const elementId = (domElement as HTMLElement).dataset?.elementId;
      if (!elementId) continue;

      console.log("elementIdelementId", elementId)

      // Use mapping instead of trying to match again
      const mapping = this._elementPluginMap.get(elementId);
      if (!mapping) continue;

      const { plugin } = mapping;

      console.log("Checking element at point:", domElement, elementId, plugin?.name, "selectable:", plugin?.selectable?.enabled, plugin);

      if (!plugin?.selectable?.enabled) continue;

      // Determine mode
      const mode = plugin.name === 'text' ? 'text' : 'block';

      return {
        elementId,
        plugin,
        mode
      };
    }

    return null;
  }

  /**
   * Get all elements that match a specific plugin using mapping
   */
  getElementsForPlugin(pluginName: string): string[] {
    const elementIds: string[] = [];
    
    for (const [elementId, mapping] of this._elementPluginMap) {
      if (mapping.plugin.name === pluginName) {
        elementIds.push(elementId);
      }
    }

    return elementIds;
  }

  /**
   * Clear the element-plugin mapping (useful for re-rendering)
   */
  clearElementMapping(): void {
    this._elementPluginMap.clear();
  }

  /**
   * Get current mapping size (for debugging)
   */
  getMappingSize(): number {
    return this._elementPluginMap.size;
  }
}

// Export singleton instance
export const pluginManager = new PluginManager();

export default pluginManager;
