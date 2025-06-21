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
  mode: "block" | "text";
  selectedElementId: string | null;
  selectedTextElementId: string | null; // text 모드일 때 편집 중인 텍스트 요소
  selectedRepeatItemId: string | null; // 선택된 반복 요소 ID
  selectedRepeatContainerId: string | null; // 선택된 반복 요소의 컨테이너 ID
}

export interface ClipboardItem {
  type: "repeat-item";
  data: RegularElement;
  sourceContainerId: string;
}
