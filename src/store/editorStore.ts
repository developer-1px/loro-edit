import { create } from "zustand";
import { temporal } from "zundo";
import type {
  ParsedElement,
  SelectionState,
  ClipboardItem,
  RegularElement,
  Section,
  SectionTemplate,
} from "../types";
// Commands are now handled by the history feature
// import { commandManager, type CommandContext, type UndoRedoState } from "../features/history";

export interface EditorState {
  htmlInput: string;
  parsedElements: ParsedElement[];
  sections: Section[];
  selection: SelectionState;
  clipboard: ClipboardItem | null;
  
  // Basic setters (non-undoable)
  setHtmlInput: (html: string) => void;
  setParsedElements: (elements: ParsedElement[]) => void;
  setSelection: (selection: Partial<SelectionState>) => void;
  setClipboard: (clipboard: ClipboardItem | null) => void;
  
  // Section management
  setSections: (sections: Section[]) => void;
  addSection: (template: SectionTemplate, position?: number) => void;
  removeSection: (sectionId: string) => void;
  moveSection: (fromIndex: number, toIndex: number) => void;
  updateSectionElements: (sectionId: string, elements: ParsedElement[]) => void;
  getSectionById: (sectionId: string) => Section | undefined;
  generateFullHtml: () => string;
  
  // History functionality moved to features/history
  // Use useHistory() hook instead of store methods
  
  // Legacy methods (to be migrated to commands)
  updateElement: (elementId: string, updates: Record<string, any>) => void;
  handleItemAdd: (containerId: string) => void;
  handleItemDelete: (containerId: string, itemId: string) => void;
  handleRepeatItemCopy: () => void;
  handleRepeatItemCut: () => void;
  handleRepeatItemPaste: (containerId: string) => void;
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
    (set, get) => {
      return {
        htmlInput: "",
        parsedElements: [],
        sections: [],
        selection: {
          mode: null,
          selectedElementId: null,
        },
        clipboard: null,

        // Basic setters (non-undoable)
        setHtmlInput: (html) => set({ htmlInput: html }),
        setParsedElements: (elements) => set({ parsedElements: elements }),
        setSelection: (selection) =>
          set((state) => ({ selection: { ...state.selection, ...selection } })),
        setClipboard: (clipboard) => set({ clipboard }),
        
        // Section management
        setSections: (sections) => set({ sections }),
        
        addSection: (template, position) => {
          set((state) => {
            const newSection: Section = {
              id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              templateId: template.id,
              elements: [], // Will be populated by parsing template.html
              order: position ?? state.sections.length,
            };
            
            const sections = [...state.sections];
            if (position !== undefined && position >= 0 && position <= sections.length) {
              // Insert at specific position and update order for other sections
              sections.splice(position, 0, newSection);
              sections.forEach((section, index) => {
                section.order = index;
              });
            } else {
              // Add to end
              sections.push(newSection);
            }
            
            return { sections };
          });
        },
        
        removeSection: (sectionId) => {
          set((state) => {
            const sections = state.sections
              .filter(section => section.id !== sectionId)
              .map((section, index) => ({ ...section, order: index }));
            return { sections };
          });
        },
        
        moveSection: (fromIndex, toIndex) => {
          set((state) => {
            if (fromIndex === toIndex) return state;
            
            const sections = [...state.sections];
            const [movedSection] = sections.splice(fromIndex, 1);
            sections.splice(toIndex, 0, movedSection);
            
            // Update order
            sections.forEach((section, index) => {
              section.order = index;
            });
            
            return { sections };
          });
        },
        
        updateSectionElements: (sectionId, elements) => {
          set((state) => ({
            sections: state.sections.map(section =>
              section.id === sectionId
                ? { ...section, elements }
                : section
            ),
          }));
        },
        
        getSectionById: (sectionId) => {
          return get().sections.find(section => section.id === sectionId);
        },
        
        generateFullHtml: () => {
          const { sectionsToHtml } = require('../utils/sectionUtils');
          return sectionsToHtml(get().sections);
        },

        // History functionality moved to features/history - use useHistory() hook

        // Legacy methods (to be migrated to commands)
        updateElement: (elementId: string, updates: Record<string, any>) => {
        const updateElements = (element: ParsedElement): ParsedElement => {
          if (element.id === elementId) {
            return { ...element, ...updates };
          }
          if ("children" in element && element.children) {
            return { ...element, children: element.children.map(updateElements) };
          }
          if ("items" in element && element.items) {
            return { ...element, items: element.items.map(updateElements) as RegularElement[] };
          }
          return element;
        };
        set((state) => ({ parsedElements: state.parsedElements.map(updateElements) }));
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

      // Repeat item clipboard operations
      handleRepeatItemCopy: () => {
        const state = get();
        if (!state.selection.selectedElementId) return;
        
        // Import command directly
        import('../features/history/commands/CopyRepeatItemCommand').then(({ CopyRepeatItemCommand }) => {
          import('../features/history').then(({ commandManager }) => {
            const store = useEditorStore.getState();
            const context = {
              parsedElements: state.parsedElements,
              setParsedElements: (elements: ParsedElement[]) => set({ parsedElements: elements }),
              selection: state.selection,
              setSelection: (selection: Partial<SelectionState>) => set(s => ({ selection: { ...s.selection, ...selection } })),
              updateElement: store.updateElement
            };
            
            const command = new CopyRepeatItemCommand(state.selection.selectedElementId!, context);
            commandManager.execute(command);
          });
        });
      },
      
      handleRepeatItemCut: () => {
        const state = get();
        if (!state.selection.selectedElementId) return;
        
        import('../features/history/commands/CutRepeatItemCommand').then(({ CutRepeatItemCommand }) => {
          import('../features/history').then(({ commandManager }) => {
            const store = useEditorStore.getState();
            const context = {
              parsedElements: state.parsedElements,
              setParsedElements: (elements: ParsedElement[]) => set({ parsedElements: elements }),
              selection: state.selection,
              setSelection: (selection: Partial<SelectionState>) => set(s => ({ selection: { ...s.selection, ...selection } })),
              updateElement: store.updateElement
            };
            
            const command = new CutRepeatItemCommand(state.selection.selectedElementId!, context);
            commandManager.execute(command);
          });
        });
      },
      
      handleRepeatItemPaste: (containerId) => {
        import('../features/history/commands/PasteRepeatItemCommand').then(({ PasteRepeatItemCommand }) => {
          import('../features/history').then(({ commandManager }) => {
            const state = get();
            const store = useEditorStore.getState();
            const context = {
              parsedElements: state.parsedElements,
              setParsedElements: (elements: ParsedElement[]) => set({ parsedElements: elements }),
              selection: state.selection,
              setSelection: (selection: Partial<SelectionState>) => set(s => ({ selection: { ...s.selection, ...selection } })),
              updateElement: store.updateElement
            };
            
            // Get the currently selected repeat item index
            const selectedId = state.selection.selectedElementId;
            
            // Find index of selected item within container
            let afterIndex = -1; // Default to beginning
            if (selectedId) {
              // Use the helper method from PasteRepeatItemCommand
              const indexInfo = PasteRepeatItemCommand.getRepeatItemIndex(state.parsedElements, selectedId);
              if (indexInfo && indexInfo.containerId === containerId) {
                afterIndex = indexInfo.index;
              }
            }
            
            const command = new PasteRepeatItemCommand(containerId, afterIndex, context);
            if (command.canExecute()) {
              commandManager.execute(command);
            }
          });
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
        }
      },
    };
    },
    {
      limit: 50,
      partialize: (state) => {
        const { clipboard, selection, ...rest } = state;
        return rest;
      },
    }
  )
);