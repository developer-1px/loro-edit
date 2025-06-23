// Selection-related types
export interface SelectionState {
  mode: "block" | "text" | null;
  selectedElementId: string | null; // Unified element ID using data-element-id
}

export interface ClipboardItem {
  type: "repeat-item";
  data: import("../../types").RegularElement;
  sourceContainerId: string;
}

export type SelectionMode = "block" | "text";