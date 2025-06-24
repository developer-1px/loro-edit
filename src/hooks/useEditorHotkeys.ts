import React from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useEditorStore } from "../store/editorStore";
import { useHistoryHotkeys } from "../features/history";
import { useHistory } from "../features/history";

export const useEditorHotkeys = (setShowUI?: React.Dispatch<React.SetStateAction<boolean>>) => {
  const { 
    selection, 
    setSelection,
  } = useEditorStore();

  const {
    undo,
    redo,
    getUndoRedoState,
  } = useHistoryHotkeys();

  const {
    executeDeleteElement,
    executeUniversalCopy,
    executeUniversalCut,
    executeUniversalPaste,
    hasUniversalClipboardData,
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
        console.log(`🗑️ DELETE: Deleting element ${selection.selectedElementId}`);
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

  // Copy - Universal
  useHotkeys(
    "mod+c",
    () => {
      if (selection.selectedElementId) {
        console.log("📋 COPY: Copying element", selection.selectedElementId);
        executeUniversalCopy(selection.selectedElementId);
      } else {
        console.log('⚠️ No element selected to copy');
      }
    },
    {
      enableOnContentEditable: false,
      enableOnFormTags: false,
    }
  );

  // Cut - Universal
  useHotkeys(
    "mod+x",
    () => {
      if (selection.selectedElementId) {
        console.log("✂️ CUT: Cutting element", selection.selectedElementId);
        executeUniversalCut(selection.selectedElementId);
      } else {
        console.log('⚠️ No element selected to cut');
      }
    },
    {
      enableOnContentEditable: false,
      enableOnFormTags: false,
    }
  );

  // Paste - Universal
  useHotkeys(
    "mod+v",
    () => {
      if (hasUniversalClipboardData()) {
        console.log("📌 PASTE: Pasting element", selection.selectedElementId);
        executeUniversalPaste(selection.selectedElementId);
      } else {
        console.log('⚠️ No data in clipboard');
      }
    },
    {
      enableOnContentEditable: false,
      enableOnFormTags: false,
    }
  );

  // Toggle UI panels - Cmd+\
  useHotkeys(
    "mod+\\",
    () => {
      if (setShowUI) {
        console.log("🎛️ TOGGLE UI: Toggling UI panels visibility");
        setShowUI((prev) => !prev);
      }
    },
    {
      enableOnContentEditable: true,
      enableOnFormTags: true,
    }
  );
};
