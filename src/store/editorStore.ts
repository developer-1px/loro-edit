import { create } from "zustand";
import { temporal } from "zundo";
import type {
  ParsedElement,
  SelectionState,
  ClipboardItem,
  RegularElement,
} from "../types";

export interface EditorState {
  htmlInput: string;
  parsedElements: ParsedElement[];
  selection: SelectionState;
  clipboard: ClipboardItem | null;
  setHtmlInput: (html: string) => void;
  setParsedElements: (elements: ParsedElement[]) => void;
  setSelection: (selection: Partial<SelectionState>) => void;
  setClipboard: (clipboard: ClipboardItem | null) => void;
  handleItemAdd: (containerId: string) => void;
  handleItemDelete: (containerId: string, itemId: string) => void;
  handleRepeatItemCopy: () => void;
  handleRepeatItemCut: () => void;
  handleRepeatItemPaste: (containerId: string) => void;
  handleTextChange: (textId: string, newText: string) => void;
  handleImageChange: (imageId: string, newSrc: string) => void;
}

const generateNewIds = (element: ParsedElement): ParsedElement => {
  const newElement = {
    ...element,
    id: Math.random().toString(36).substr(2, 9),
  };

  if ("children" in newElement && newElement.children) {
    newElement.children = newElement.children.map(generateNewIds);
  }
  if ("items" in newElement && newElement.items) {
    newElement.items = newElement.items.map(
      (item) => generateNewIds(item) as RegularElement
    );
  }
  if ("repeatItem" in newElement && newElement.repeatItem) {
    (
      newElement as RegularElement
    ).repeatItem = `item-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 4)}`;
  }

  return newElement;
};

export const useEditorStore = create<EditorState>()(
  temporal(
    (set) => ({
      htmlInput: "",
      parsedElements: [],
      selection: {
        mode: "block",
        selectedElementId: null,
        selectedTextElementId: null,
      },
      clipboard: null,

      setHtmlInput: (html) => set({ htmlInput: html }),
      setParsedElements: (elements) => set({ parsedElements: elements }),
      setSelection: (selection) =>
        set((state) => ({ selection: { ...state.selection, ...selection } })),
      setClipboard: (clipboard) => set({ clipboard }),

      handleTextChange: (textId: string, newText: string) => {
        const updateElementText = (element: ParsedElement): ParsedElement => {
          if (element.type === "text") {
            return element.id === textId
              ? { ...element, content: newText }
              : element;
          }
          if ("children" in element && element.children) {
            return {
              ...element,
              children: element.children.map(updateElementText),
            };
          }
          if ("items" in element && element.items) {
            return {
              ...element,
              items: element.items.map(
                (el) => updateElementText(el) as RegularElement
              ),
            };
          }
          return element;
        };
        set((state) => ({
          parsedElements: state.parsedElements.map(updateElementText),
        }));
      },

      handleImageChange: (imageId: string, newSrc: string) => {
        const updateElementImage = (element: ParsedElement): ParsedElement => {
          if (element.type === "img" || element.type === "picture") {
            return element.id === imageId
              ? { ...element, src: newSrc }
              : element;
          }
          if ("children" in element && element.children) {
            return {
              ...element,
              children: element.children.map(updateElementImage),
            };
          }
          if ("items" in element && element.items) {
            return {
              ...element,
              items: element.items.map(
                (el) => updateElementImage(el) as RegularElement
              ),
            };
          }
          return element;
        };
        set((state) => ({
          parsedElements: state.parsedElements.map(updateElementImage),
        }));
      },

      handleItemAdd: (containerId) => {
        const updateElements = (elements: ParsedElement[]): ParsedElement[] => {
          return elements.map((element) => {
            if (
              element.type === "repeat-container" &&
              element.id === containerId
            ) {
              if (element.items.length === 0) return element;
              const template = element.items[0];
              const newItem = generateNewIds(
                JSON.parse(JSON.stringify(template))
              ) as RegularElement;
              return { ...element, items: [...element.items, newItem] };
            }
            if ("children" in element && element.children) {
              return { ...element, children: updateElements(element.children) };
            }
            if ("items" in element && element.items) {
              return {
                ...element,
                items: updateElements(element.items) as RegularElement[],
              };
            }
            return element;
          });
        };
        set((state) => ({
          parsedElements: updateElements(state.parsedElements),
        }));
      },

      handleItemDelete: (containerId, itemId) => {
        const updateElements = (elements: ParsedElement[]): ParsedElement[] => {
          return elements.map((element) => {
            if (
              element.type === "repeat-container" &&
              element.id === containerId
            ) {
              return {
                ...element,
                items: element.items.filter((item) => item.id !== itemId),
              };
            }
            if ("children" in element && element.children) {
              return { ...element, children: updateElements(element.children) };
            }
            if ("items" in element && element.items) {
              return {
                ...element,
                items: updateElements(element.items) as RegularElement[],
              };
            }
            return element;
          });
        };
        set((state) => ({
          parsedElements: updateElements(state.parsedElements),
        }));
      },

      handleRepeatItemCopy: () => {
        // Simplified for new selection logic - not implemented yet
        return;
      },

      handleRepeatItemCut: () => {
        // Simplified for new selection logic - not implemented yet
        return;
      },

      handleRepeatItemPaste: (containerId: string) => {
        // Simplified for new selection logic - not implemented yet
        console.log('Paste to container:', containerId);
        return;
      },
    }),
    {
      limit: 50,
      partialize: (state) => {
        const { clipboard, selection, ...rest } = state;
        // The unused vars are intentional for picking properties.
        // This is a standard way to omit properties from an object.
        return rest;
      },
    }
  )
);

// Remove unused temporal store helper - functionality moved to component
