// src/plugins/types.ts

import React from 'react';
import type { ParsedElement, SelectionState } from '../types';

export interface PluginContext {
  selection: SelectionState;
  setSelection: (selection: Partial<SelectionState>) => void;
  handleItemAdd: (containerId: string) => void;
  handleTextChange: (elementId: string, newText: string) => void;
  handleImageChange: (elementId: string, newSrc: string) => void;
}

export interface ElementMatch {
  condition: (element: ParsedElement) => boolean;
  priority: number; // Higher numbers have higher priority
}

export interface PluginRenderProps {
  element: ParsedElement;
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
  match: ElementMatch;
  
  // DOM parsing - how to parse HTML into element data
  parse?: (element: Element) => ParsedElement | null;
  
  // Rendering - how to render the element
  render: (props: PluginRenderProps) => React.ReactNode;
  
  // Selection handling - how to handle selection for this element type
  onSelect?: (element: ParsedElement, context: PluginContext) => void;
  
  // Initialization - called when plugin is registered
  init?: () => void;
  
  // Cleanup - called when plugin is unregistered
  destroy?: () => void;
}

export interface PluginManager {
  plugins: Plugin[];
  register: (plugin: Plugin) => void;
  unregister: (pluginName: string) => void;
  getPlugin: (element: ParsedElement) => Plugin | null;
  parseElement: (element: Element) => ParsedElement | null;
  renderElement: (element: ParsedElement, context: PluginContext, renderElement: (element: ParsedElement) => React.ReactNode) => React.ReactNode;
}