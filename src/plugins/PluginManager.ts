// src/plugins/PluginManager.ts

import type { Plugin, PluginManager as IPluginManager, PluginContext, PluginRenderProps } from './types';
import type { ParsedElement, SelectionState } from '../types';
import React from 'react';

class PluginManager implements IPluginManager {
  private _plugins: Plugin[] = [];

  get plugins(): Plugin[] {
    return [...this._plugins];
  }

  register(plugin: Plugin): void {
    // Check if plugin with same name already exists
    const existingIndex = this._plugins.findIndex(p => p.name === plugin.name);
    if (existingIndex !== -1) {
      // Unregister existing plugin first
      this.unregister(plugin.name);
    }

    // Add plugin and sort by priority (higher priority first)
    this._plugins.push(plugin);
    this._plugins.sort((a, b) => b.match.priority - a.match.priority);

    // Initialize plugin
    if (plugin.init) {
      plugin.init();
    }

    console.log(`Plugin "${plugin.name}" v${plugin.version} registered`);
  }

  unregister(pluginName: string): void {
    const pluginIndex = this._plugins.findIndex(p => p.name === pluginName);
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

  getPlugin(element: ParsedElement): Plugin | null {
    // Find the first plugin that matches the element (plugins are sorted by priority)
    for (const plugin of this._plugins) {
      if (plugin.match.condition(element)) {
        return plugin;
      }
    }
    return null;
  }

  parseElement(element: Element): ParsedElement | null {
    // Try each plugin's parser in priority order
    for (const plugin of this._plugins) {
      if (plugin.parse) {
        const result = plugin.parse(element);
        if (result) {
          return result;
        }
      }
    }
    return null;
  }

  renderElement(
    element: ParsedElement, 
    context: PluginContext, 
    renderElement: (element: ParsedElement) => React.ReactNode
  ): React.ReactNode {
    const plugin = this.getPlugin(element);
    if (!plugin) {
      console.warn(`No plugin found for element type: ${element.type}`, element);
      return null;
    }

    // Calculate render props
    const isInSelectedContainer = this.isElementInSelectedContainer(element, context.selection);
    const canEditText = (context.selection.mode === "text" || context.selection.mode === "repeat-item") 
      ? isInSelectedContainer 
      : false;
    const showHoverEffects = Boolean(
      context.selection.mode === "container" && 
      context.selection.selectedContainerId &&
      isInSelectedContainer
    );

    const renderProps: PluginRenderProps = {
      element,
      context,
      renderElement,
      isInSelectedContainer,
      canEditText,
      showHoverEffects
    };

    return plugin.render(renderProps);
  }

  private isElementInSelectedContainer(_element: ParsedElement, selection: SelectionState): boolean {
    // For now, we'll use a simplified approach
    // In a complete implementation, this would need access to the full element tree
    // This method should be enhanced to properly traverse the element hierarchy
    
    // Basic logic for determining if element is in selected container
    if (selection.mode === 'container' && selection.selectedContainerId) {
      // For now, assume all elements are potentially in the selected container
      // This should be improved with proper tree traversal
      return true;
    }
    
    if (selection.mode === 'text' && selection.selectedContainerId) {
      return true;
    }
    
    if (selection.mode === 'repeat-item' && selection.selectedRepeatItemId) {
      return true;
    }
    
    return false;
  }
}

// Export singleton instance
export const pluginManager = new PluginManager();

export default pluginManager;