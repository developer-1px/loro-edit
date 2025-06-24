import { useHotkeys } from "react-hotkeys-hook";
import { useEditorStore } from "../store/editorStore";
import { useHistoryHotkeys } from "../features/history";
import { useHistory } from "../features/history";
import { PasteRepeatItemCommand } from "../features/history";

export const useEditorHotkeys = () => {
  const { 
    selection, 
    setSelection,
    parsedElements,
  } = useEditorStore();

  const {
    undo,
    redo,
    getUndoRedoState,
  } = useHistoryHotkeys();

  const {
    executeCopyRepeatItem,
    executeCutRepeatItem,
    executePasteRepeatItem,
    executeDeleteElement,
    hasClipboardData,
  } = useHistory();

  // Get undo/redo state for better UX
  const undoRedoState = getUndoRedoState();

  // Global hotkeys
  useHotkeys(
    "esc",
    () => {
      console.log('🔄 ESC: Clearing selection');
      setSelection({
        mode: null,
        selectedElementId: null,
      });
    },
    {
      enableOnContentEditable: false,
      enableOnFormTags: false,
    }
  );

  // Undo - Ctrl+Z (or Cmd+Z on Mac)
  useHotkeys(
    "mod+z",
    (e) => {
      e.preventDefault();
      if (undoRedoState.canUndo) {
        console.log(`↩️ UNDO: ${undoRedoState.undoDescription || 'Previous action'}`);
        undo();
      } else {
        console.log('⚠️ Nothing to undo');
      }
    },
    { 
      preventDefault: true,
      enableOnContentEditable: true,
      enableOnFormTags: true
    }
  );

  // Redo - Ctrl+Y or Ctrl+Shift+Z
  useHotkeys(
    "mod+y,mod+shift+z",
    (e) => {
      e.preventDefault();
      if (undoRedoState.canRedo) {
        console.log(`↪️ REDO: ${undoRedoState.redoDescription || 'Next action'}`);
        redo();
      } else {
        console.log('⚠️ Nothing to redo');
      }
    },
    { 
      preventDefault: true,
      enableOnContentEditable: true,
      enableOnFormTags: true
    }
  );

  // Delete/Backspace - Delete selected element
  useHotkeys(
    "delete,backspace",
    () => {
      if (selection.selectedElementId && selection.mode === 'block') {
        // Check if it's a repeat-item to provide better feedback
        if (isRepeatItem(selection.selectedElementId)) {
          console.log(`🗑️ DELETE: Deleting repeat item ${selection.selectedElementId}`);
        } else {
          console.log(`🗑️ DELETE: Deleting element ${selection.selectedElementId}`);
        }
        executeDeleteElement(selection.selectedElementId);
      } else if (selection.mode === 'text') {
        console.log('⚠️ Cannot delete in text mode - use text editing instead');
      } else {
        console.log('⚠️ No element selected to delete');
      }
    },
    {
      enableOnContentEditable: false,
      enableOnFormTags: false,
    }
  );

  // Copy - For repeat items
  useHotkeys(
    "mod+c",
    () => {
      if (selection.selectedElementId && selection.mode === 'block') {
        // Check if selected element is a repeat item
        if (isRepeatItem(selection.selectedElementId)) {
          console.log("📋 COPY: Copying repeat item", selection.selectedElementId);
          executeCopyRepeatItem(selection.selectedElementId);
        } else {
          console.log("📋 COPY: Element not a repeat item", selection.selectedElementId);
        }
      } else {
        console.log('⚠️ No element selected to copy or in wrong mode');
      }
    },
    {
      enableOnContentEditable: false,
      enableOnFormTags: false,
    }
  );

  // Cut - For repeat items
  useHotkeys(
    "mod+x",
    () => {
      if (selection.selectedElementId && selection.mode === 'block') {
        // Check if selected element is a repeat item
        if (isRepeatItem(selection.selectedElementId)) {
          console.log("✂️ CUT: Cutting repeat item", selection.selectedElementId);
          executeCutRepeatItem(selection.selectedElementId);
        } else {
          console.log("✂️ CUT: Element not a repeat item", selection.selectedElementId);
        }
      } else {
        console.log('⚠️ No element selected to cut or in wrong mode');
      }
    },
    {
      enableOnContentEditable: false,
      enableOnFormTags: false,
    }
  );

  // Paste - For repeat items
  useHotkeys(
    "mod+v",
    () => {
      if (hasClipboardData() && selection.selectedElementId && selection.mode === 'block') {
        // Check if we can paste here (selected item should be a repeat item)
        if (isRepeatItem(selection.selectedElementId)) {
          const itemInfo = PasteRepeatItemCommand.getRepeatItemIndex(parsedElements, selection.selectedElementId);
          if (itemInfo) {
            console.log("📌 PASTE: Pasting repeat item after", selection.selectedElementId);
            executePasteRepeatItem(itemInfo.containerId, itemInfo.index);
          } else {
            console.log('⚠️ Could not find repeat item position');
          }
        } else {
          console.log('⚠️ Selected element is not a repeat item');
        }
      } else if (!hasClipboardData()) {
        console.log('⚠️ No repeat item in clipboard');
      } else {
        console.log('⚠️ No repeat item selected for paste target');
      }
    },
    {
      enableOnContentEditable: false,
      enableOnFormTags: false,
    }
  );

  // Helper function to check if an element is a repeat item
  const isRepeatItem = (elementId: string): boolean => {
    return PasteRepeatItemCommand.getRepeatItemIndex(parsedElements, elementId) !== null;
  };
};
