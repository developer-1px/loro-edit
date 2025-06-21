// src/types.ts

export interface BaseElement {
  id: string;
  className: string;
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
}

export interface RegularElement extends BaseElement {
  type: "element";
  children: ParsedElement[];
  repeatItem?: string;
}

export interface RepeatContainer extends BaseElement {
  type: "repeat-container";
  repeatContainer: string;
  items: RegularElement[];
  children: ParsedElement[];
  id: string;
}

export type ParsedElement =
  | TextElement
  | ImageElement
  | RegularElement
  | RepeatContainer;

export interface SelectionState {
  mode: "container" | "text" | "repeat-item";
  selectedContainerId: string | null;
  selectedContainerType: "repeat-container" | "regular" | null;
  selectedRepeatItemId: string | null;
  selectedRepeatContainerId: string | null;
}

export interface ClipboardItem {
  type: "repeat-item";
  data: RegularElement;
  sourceContainerId: string;
}
