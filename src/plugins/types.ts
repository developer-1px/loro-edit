// src/plugins/types.ts

import React from 'react';
import type { ParsedElement, SelectionState } from '../types';

export interface PluginContext {
  selection: SelectionState;
  setSelection: (selection: Partial<SelectionState>) => void;
  handleItemAdd: (containerId: string) => void;
  handleTextChange: (elementId: string, newText: string) => void;
  handleImageChange: (elementId: string, newSrc: string) => void;
  handleDatabaseViewModeChange?: (databaseId: string, viewMode: "cards" | "table") => void;
  handleDatabaseSettingsUpdate?: (databaseId: string, apiUrl: string, columns: import("../types").DatabaseColumn[]) => void;
  handleDatabaseFetch?: (databaseId: string) => Promise<void>;
  canEditText?: boolean;
  showHoverEffects?: boolean;
}

export interface PluginRenderProps {
  element: Element;
  parsedElement: ParsedElement;
  context: PluginContext;
  renderElement: (element: ParsedElement) => React.ReactNode;
  isInSelectedContainer: boolean;
  canEditText: boolean;
  showHoverEffects: boolean;
}

export interface Plugin {
  name: string;
  version: string;
  description?: string;
  
  // Matching conditions - when should this plugin handle an element
  match: (element: Element) => boolean;
  
  // DOM parsing - how to parse HTML into element data
  parse: (element: Element) => ParsedElement | null;
  
  // Rendering - how to render the element
  render: (props: PluginRenderProps) => React.ReactNode;
  
  // Selection handling - how to handle selection for this element type
  onSelect?: (parsedElement: ParsedElement, context: PluginContext) => void;
  
  // Initialization - called when plugin is registered
  init?: () => void;
  
  // Cleanup - called when plugin is unregistered
  destroy?: () => void;
}

export interface PluginManager {
  plugins: Plugin[];
  register: (plugin: Plugin) => void;
  unregister: (pluginName: string) => void;
  getPlugin: (element: Element) => Plugin | null;
  parseElement: (element: Element) => ParsedElement | null;
  renderElement: (element: Element, parsedElement: ParsedElement, context: PluginContext, renderElement: (element: ParsedElement) => React.ReactNode) => React.ReactNode;
}