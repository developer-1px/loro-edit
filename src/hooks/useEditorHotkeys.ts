import { useHotkeys } from "react-hotkeys-hook";
import { useEditorStore } from "../store/editorStore";

export const useEditorHotkeys = () => {
  const { 
    selection, 
    setSelection,
  } = useEditorStore();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { undo, redo } = useEditorStore.temporal as any;

  // Global hotkeys
  useHotkeys(
    "esc",
    () => {
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

  useHotkeys(
    "mod+z",
    (e) => {
      e.preventDefault();
      if (undo) undo();
    },
    { preventDefault: true }
  );

  useHotkeys(
    "mod+shift+z",
    (e) => {
      e.preventDefault();
      if (redo) redo();
    },
    { preventDefault: true }
  );

  // Delete/Backspace - simplified
  useHotkeys(
    "delete,backspace",
    () => {
      // TODO: Implement element deletion with new selection system
      console.log("Delete requested for:", selection.selectedElementId);
    },
    {
      enableOnContentEditable: false,
      enableOnFormTags: false,
    }
  );

  // Copy - simplified
  useHotkeys(
    "mod+c",
    () => {
      // TODO: Implement copy with new selection system
      console.log("Copy requested for:", selection.selectedElementId);
    },
    {
      enableOnContentEditable: false,
      enableOnFormTags: false,
    }
  );

  // Cut - simplified
  useHotkeys(
    "mod+x",
    () => {
      // TODO: Implement cut with new selection system
      console.log("Cut requested for:", selection.selectedElementId);
    },
    {
      enableOnContentEditable: false,
      enableOnFormTags: false,
    }
  );

  // Paste - simplified
  useHotkeys(
    "mod+v",
    () => {
      // TODO: Implement paste with new selection system
      console.log("Paste requested for:", selection.selectedElementId);
    },
    {
      enableOnContentEditable: false,
      enableOnFormTags: false,
    }
  );
};
