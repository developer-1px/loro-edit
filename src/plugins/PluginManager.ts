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
      if (plugin.name !== "text") {
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

    // Calculate render props using simple selection logic
    const canEditText =
      context.selection.mode === "text" &&
      parsedElement.type === "text" &&
      context.selection.selectedTextElementId === parsedElement.id;

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
}

// Export singleton instance
export const pluginManager = new PluginManager();

export default pluginManager;
