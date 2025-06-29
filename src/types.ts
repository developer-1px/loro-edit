// src/types.ts

export interface BaseElement {
  id: string;
  tagName: string;
  preview?: string; // Base64 encoded image or HTML string for section preview
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

// @deprecated - Repeat items are now represented as RegularElement with repeatItem property
export interface RepeatItemElement extends BaseElement {
  type: "repeat-item";
  attributes: Record<string, string>;
  children: ParsedElement[];
  repeatItem: string;
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
  | RepeatItemElement
  | RepeatContainer
  | DatabaseElement;

// Section Template types
export interface SectionTemplate {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  description: string;
  html: string;
  preview?: string; // Optional preview image/HTML
}

export interface Section {
  id: string;
  templateId?: string; // Reference to the template used
  elements: ParsedElement[]; // The actual parsed elements for this section
  order: number; // Order in the page
}

// Selection types moved to /features/selection
export type { SelectionState, ClipboardItem } from './features/selection/types';
