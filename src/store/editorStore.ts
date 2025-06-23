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
  handleSvgChange: (svgId: string, newSvgContent: string) => void;
  handleDatabaseViewModeChange: (databaseId: string, viewMode: "cards" | "table") => void;
  handleDatabaseSettingsUpdate: (databaseId: string, apiUrl: string, columns: import("../types").DatabaseColumn[]) => void;
  handleDatabaseFetch: (databaseId: string) => Promise<void>;
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
        mode: null,
        selectedElementId: null,
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

      handleSvgChange: (svgId: string, newSvgContent: string) => {
        const updateElementSvg = (element: ParsedElement): ParsedElement => {
          if (element.type === "svg") {
            return element.id === svgId
              ? { ...element, svgContent: newSvgContent }
              : element;
          }
          if ("children" in element && element.children) {
            return {
              ...element,
              children: element.children.map(updateElementSvg),
            };
          }
          if ("items" in element && element.items) {
            return {
              ...element,
              items: element.items.map(
                (el) => updateElementSvg(el) as RegularElement
              ),
            };
          }
          return element;
        };
        set((state) => ({
          parsedElements: state.parsedElements.map(updateElementSvg),
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

      // Simplified repeat functions - TODO: Implement with new selection system
      handleRepeatItemCopy: () => {
        console.log("handleRepeatItemCopy called - TODO: implement");
      },

      handleRepeatItemCut: () => {
        console.log("handleRepeatItemCut called - TODO: implement");
      },

      handleRepeatItemPaste: (containerId: string) => {
        console.log("handleRepeatItemPaste called - TODO: implement", containerId);
      },

      handleDatabaseViewModeChange: (databaseId: string, viewMode: "cards" | "table") => {
        set((state) => {
          const updateElements = (elements: ParsedElement[]): ParsedElement[] => {
            return elements.map((element) => {
              if (element.type === "database" && element.id === databaseId) {
                return { ...element, viewMode };
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

          return {
            ...state,
            parsedElements: updateElements(state.parsedElements),
          };
        });
      },

      handleDatabaseSettingsUpdate: (databaseId: string, apiUrl: string, columns: import("../types").DatabaseColumn[]) => {
        set((state) => {
          const updateElements = (elements: ParsedElement[]): ParsedElement[] => {
            return elements.map((element) => {
              if (element.type === "database" && element.id === databaseId) {
                return { ...element, apiUrl, columns };
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

          return {
            ...state,
            parsedElements: updateElements(state.parsedElements),
          };
        });
      },

      handleDatabaseFetch: async (databaseId: string) => {
        // Find the database element
        const state = useEditorStore.getState();
        const findDatabase = (elements: ParsedElement[]): import("../types").DatabaseElement | null => {
          for (const element of elements) {
            if (element.type === "database" && element.id === databaseId) {
              return element as import("../types").DatabaseElement;
            }
            if ("children" in element && element.children) {
              const found = findDatabase(element.children);
              if (found) return found;
            }
            if ("items" in element && element.items) {
              const found = findDatabase(element.items);
              if (found) return found;
            }
          }
          return null;
        };

        const database = findDatabase(state.parsedElements);
        if (!database || !database.apiUrl) {
          console.warn('Database not found or no API URL configured');
          return;
        }

        try {
          const response = await fetch(database.apiUrl);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          
          // Transform data to match our format
          const records = Array.isArray(data) ? data : data.data || [data];
          const formattedRecords = records.map((record: any, index: number) => ({
            id: record.id || `record_${index}`,
            ...record
          }));

          // Update the database with fetched data
          set((state) => {
            const updateElements = (elements: ParsedElement[]): ParsedElement[] => {
              return elements.map((element) => {
                if (element.type === "database" && element.id === databaseId) {
                  return { ...element, data: formattedRecords };
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

            return {
              ...state,
              parsedElements: updateElements(state.parsedElements),
            };
          });
        } catch (error) {
          console.error('Failed to fetch database data:', error);
        }
      },
    }),
    {
      limit: 50,
      partialize: (state) => {
        const { clipboard, selection, ...rest } = state;
        return rest;
      },
    }
  )
);