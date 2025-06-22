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
        mode: "block",
        selectedElementId: null,
        selectedTextElementId: null,
        selectedRepeatItemId: null,
        selectedRepeatContainerId: null,
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

      handleRepeatItemCopy: () => {
        set((state) => {
          if (!state.selection.selectedRepeatItemId || !state.selection.selectedRepeatContainerId) {
            return state;
          }

          // Find the selected repeat item
          const findRepeatItem = (elements: ParsedElement[]): RegularElement | null => {
            for (const element of elements) {
              if (element.type === "repeat-container" && element.id === state.selection.selectedRepeatContainerId) {
                const item = element.items.find(item => item.id === state.selection.selectedRepeatItemId);
                return item || null;
              }
              if ("children" in element && element.children) {
                const found = findRepeatItem(element.children);
                if (found) return found;
              }
              if ("items" in element && element.items) {
                const found = findRepeatItem(element.items);
                if (found) return found;
              }
            }
            return null;
          };

          const itemToCopy = findRepeatItem(state.parsedElements);
          if (itemToCopy) {
            return {
              ...state,
              clipboard: {
                type: "repeat-item" as const,
                data: itemToCopy,
                sourceContainerId: state.selection.selectedRepeatContainerId!,
              }
            };
          }

          return state;
        });
      },

      handleRepeatItemCut: () => {
        set((state) => {
          if (!state.selection.selectedRepeatItemId || !state.selection.selectedRepeatContainerId) {
            return state;
          }

          // First copy the item
          const findRepeatItem = (elements: ParsedElement[]): RegularElement | null => {
            for (const element of elements) {
              if (element.type === "repeat-container" && element.id === state.selection.selectedRepeatContainerId) {
                const item = element.items.find(item => item.id === state.selection.selectedRepeatItemId);
                return item || null;
              }
              if ("children" in element && element.children) {
                const found = findRepeatItem(element.children);
                if (found) return found;
              }
              if ("items" in element && element.items) {
                const found = findRepeatItem(element.items);
                if (found) return found;
              }
            }
            return null;
          };

          const itemToCut = findRepeatItem(state.parsedElements);
          if (!itemToCut) {
            return state;
          }

          // Remove the item from its container
          const updateElements = (elements: ParsedElement[]): ParsedElement[] => {
            return elements.map((element) => {
              if (
                element.type === "repeat-container" &&
                element.id === state.selection.selectedRepeatContainerId
              ) {
                return {
                  ...element,
                  items: element.items.filter((item) => item.id !== state.selection.selectedRepeatItemId),
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

          return {
            ...state,
            parsedElements: updateElements(state.parsedElements),
            clipboard: {
              type: "repeat-item" as const,
              data: itemToCut,
              sourceContainerId: state.selection.selectedRepeatContainerId!,
            }
          };
        });
      },

      handleRepeatItemPaste: (containerId: string) => {
        set((state) => {
          if (!state.clipboard || state.clipboard.type !== "repeat-item") {
            return state;
          }

          // Create a new item with new ID
          const newItem = generateNewIds(
            JSON.parse(JSON.stringify(state.clipboard.data))
          ) as RegularElement;

          const updateElements = (elements: ParsedElement[]): ParsedElement[] => {
            return elements.map((element) => {
              if (
                element.type === "repeat-container" &&
                element.id === containerId
              ) {
                let newItems: RegularElement[];
                
                // If there's a selected item in this container, insert after it
                if (state.selection.selectedRepeatItemId && 
                    state.selection.selectedRepeatContainerId === containerId) {
                  const selectedIndex = element.items.findIndex(
                    item => item.id === state.selection.selectedRepeatItemId
                  );
                  
                  if (selectedIndex !== -1) {
                    // Insert after the selected item
                    newItems = [
                      ...element.items.slice(0, selectedIndex + 1),
                      newItem,
                      ...element.items.slice(selectedIndex + 1)
                    ];
                  } else {
                    // Fallback: append at the end
                    newItems = [...element.items, newItem];
                  }
                } else {
                  // No selection in this container: append at the end
                  newItems = [...element.items, newItem];
                }
                
                return { ...element, items: newItems };
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
            // Select the newly pasted item
            selection: {
              ...state.selection,
              mode: "block",
              selectedElementId: null,
              selectedTextElementId: null,
              selectedRepeatItemId: newItem.id,
              selectedRepeatContainerId: containerId,
            }
          };
        });
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
          // You could also update the state to show an error message
        }
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
