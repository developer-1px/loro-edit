// src/plugins/types.ts

import React from "react";
import type { ParsedElement, SelectionState } from "../types";
import type { ClipboardHandler } from "../features/clipboard/types";
import type { SelectionStrategy } from "../selection";

export interface PluginContext {
  selection: SelectionState;
  setSelection: (selection: Partial<SelectionState>) => void;
  handleItemAdd: (containerId: string) => void;
  handleDatabaseViewModeChange?: (
    databaseId: string,
    viewMode: "cards" | "table"
  ) => void;
  handleDatabaseSettingsUpdate?: (
    databaseId: string,
    apiUrl: string,
    columns: import("../types").DatabaseColumn[]
  ) => void;
  handleDatabaseFetch?: (databaseId: string) => Promise<void>;
  onTextChange?: (elementId: string, newText: string) => void;
}

export interface PluginRenderProps {
  parsedElement: ParsedElement;
  context: PluginContext;
  renderElement: (element: ParsedElement) => React.ReactNode;
  isSelected?: boolean;
  canEditText?: boolean;
}

export interface SelectableConfig {
  enabled: boolean;
  strategy?: SelectionStrategy; // Custom selection strategy
  // Legacy fields for backward compatibility
  name?: string;
  color?: string;
  level?: 'container' | 'element' | 'content';
  elementType?: 'block' | 'inline';
  priority?: number;
  allowDeepSelection?: boolean;
}

export interface FloatingUIConfig {
  enabled: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
  offset?: number;
  render: React.ComponentType<FloatingUIRenderProps>;
}

export interface FloatingUIRenderProps {
  element: ParsedElement;
  isOpen: boolean;
  onClose: () => void;
  updateElement: (elementId: string, updates: Partial<ParsedElement>) => void;
  selectionColor?: string;
}

export interface Plugin {
  name: string;
  selectable: SelectableConfig;
  floatingUI?: FloatingUIConfig;
  match: (element: Element) => boolean;
  parse: (element: Element) => ParsedElement | null;
  render: (props: PluginRenderProps) => React.ReactNode;
  clipboardHandler?: ClipboardHandler;
}

export interface PluginManager {
  plugins: Plugin[];
  register: (plugin: Plugin) => void;
  unregister: (pluginName: string) => void;
  getPlugin: (element: Element) => Plugin | null;
  parseElement: (element: Element) => ParsedElement | null;
  renderElement: (
    element: Element,
    parsedElement: ParsedElement,
    context: PluginContext,
    renderElement: (element: ParsedElement) => React.ReactNode
  ) => React.ReactNode;
  
  getPluginById: (elementId: string) => Plugin | null;
  findSelectableAtPoint: (x: number, y: number) => {
    elementId: string;
    mode: 'text' | 'block';
  } | null;
  clearElementMapping: () => void;
}
