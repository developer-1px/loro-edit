// src/types.ts

export interface BaseElement {
  id: string;
  tagName: string;
}

export interface TextElement {
  type: "text";
  id: string;
  content: string;
}

export interface ImageElement extends BaseElement {
  type: "img" | "picture";
  src: string;
  alt: string;
  repeatItem?: string;
  attributes: Record<string, string>;
}

export interface SvgElement extends BaseElement {
  type: "svg";
  svgContent: string;
  width?: string;
  height?: string;
  repeatItem?: string;
  attributes: Record<string, string>;
}

export interface RegularElement extends BaseElement {
  type: "element";
  attributes: Record<string, string>;
  children: ParsedElement[];
  repeatItem?: string;
}

export interface RepeatContainer extends BaseElement {
  type: "repeat-container";
  repeatContainer: string;
  attributes: Record<string, string>;
  items: RegularElement[];
  children: ParsedElement[];
}

export interface DatabaseElement extends BaseElement {
  type: "database";
  database: string; // database name/identifier
  apiUrl?: string;
  viewMode: "cards" | "table";
  attributes: Record<string, string>;
  data: DatabaseRecord[];
  columns: DatabaseColumn[];
}

export interface DatabaseRecord {
  id: string;
  [key: string]: string | number | boolean | null;
}

export interface DatabaseColumn {
  id: string;
  name: string;
  type: "text" | "number" | "date" | "select" | "multiselect" | "checkbox";
  options?: string[]; // for select/multiselect
}

export type ParsedElement =
  | TextElement
  | ImageElement
  | SvgElement
  | RegularElement
  | RepeatContainer
  | DatabaseElement;

export interface SelectionState {
  mode: "block" | "text" | null;
  selectedElementId: string | null; // Unified element ID using data-element-id
}

export interface ClipboardItem {
  type: "repeat-item";
  data: RegularElement;
  sourceContainerId: string;
}
