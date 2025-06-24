// src/plugins/types.ts

import React from "react";
import type { ParsedElement, SelectionState } from "../types";
import type { ClipboardHandler } from "../features/clipboard/types";

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
  name: string;
  color?: string;
  level: 'container' | 'element' | 'content';  // 선택 계층 명확화
  elementType: 'block' | 'inline';
  priority: number;  // 동일 레벨 내 우선순위 (0=highest)
  allowDeepSelection?: boolean;  // 내부 요소로 진입 가능 여부
}

export interface Plugin {
  name: string;
  selectable: SelectableConfig;
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
