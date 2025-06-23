// src/plugins/PluginManager.ts

import type {
  Plugin,
  PluginManager as IPluginManager,
  PluginContext,
} from "./types";
import type { ParsedElement } from "../types";
import React from "react";

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
    plugin.init?.();
  }

  unregister(pluginName: string): void {
    const pluginIndex = this._plugins.findIndex(p => p.name === pluginName);
    if (pluginIndex === -1) return;
    const plugin = this._plugins[pluginIndex];
    plugin.destroy?.();
    this._plugins.splice(pluginIndex, 1);
  }

  getPlugin(element: Element): Plugin | null {
    return this._plugins.find(p => p.name !== "text" && p.match(element)) ||
           this._plugins.find(p => p.name === "text") ||
           null;
  }

  parseElement(element: Element): ParsedElement | null {
    const plugin = this.getPlugin(element);
    return plugin?.parse(element) || null;
  }

  renderElement(
    element: Element,
    parsedElement: ParsedElement,
    context: PluginContext,
    renderElement: (element: ParsedElement) => React.ReactNode
  ): React.ReactNode {
    const plugin = this.getPlugin(element);
    if (!plugin) return null;

    this._elementPluginMap.set(parsedElement.id, { plugin, parsedElement });

    const canEditText = context.selection.mode === "text" &&
                       parsedElement.type === "text" &&
                       context.selection.selectedElementId === parsedElement.id;

    try {
      return plugin.render({ element, parsedElement, context, renderElement, canEditText }) || null;
    } catch {
      return null;
    }
  }

  getPluginById(elementId: string): Plugin | null {
    return this._elementPluginMap.get(elementId)?.plugin || null;
  }

  findSelectableAtPoint(x: number, y: number): { elementId: string; mode: 'text' | 'block' } | null {
    const elementsAtPoint = document.elementsFromPoint(x, y);
    
    for (const domElement of elementsAtPoint) {
      const elementId = (domElement as HTMLElement).dataset?.elementId;
      if (!elementId) continue;

      const mapping = this._elementPluginMap.get(elementId);
      if (!mapping?.plugin?.selectable?.enabled) continue;

      return {
        elementId,
        mode: mapping.plugin.name === 'text' ? 'text' : 'block'
      };
    }
    return null;
  }

  clearElementMapping(): void {
    this._elementPluginMap.clear();
  }
}

export const pluginManager = new PluginManager();
export default pluginManager;
