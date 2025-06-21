import { useHotkeys } from "react-hotkeys-hook";
import { useEditorStore } from "../store/editorStore";

export const useEditorHotkeys = () => {
  const { 
    selection, 
    setSelection, 
    handleItemDelete, 
    clipboard,
    handleRepeatItemCopy,
    handleRepeatItemCut,
    handleRepeatItemPaste 
  } = useEditorStore();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { undo, redo } = useEditorStore.temporal as any;

  // Global hotkeys
  useHotkeys(
    "esc",
    () => {
      setSelection({
        mode: "block",
        selectedElementId: null,
        selectedTextElementId: null,
        selectedRepeatItemId: null,
        selectedRepeatContainerId: null,
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

  // Delete/Backspace for repeat items
  useHotkeys(
    "delete,backspace",
    (e) => {
      if (selection.selectedRepeatItemId && selection.selectedRepeatContainerId) {
        e.preventDefault();
        handleItemDelete(selection.selectedRepeatContainerId, selection.selectedRepeatItemId);
        // Clear selection after deletion
        setSelection({
          mode: "block",
          selectedElementId: null,
          selectedTextElementId: null,
          selectedRepeatItemId: null,
          selectedRepeatContainerId: null,
        });
      }
    },
    {
      enableOnContentEditable: false,
      enableOnFormTags: false,
    }
  );

  // Copy repeat item
  useHotkeys(
    "mod+c",
    (e) => {
      if (selection.selectedRepeatItemId && selection.selectedRepeatContainerId) {
        e.preventDefault();
        handleRepeatItemCopy();
      }
    },
    {
      enableOnContentEditable: false,
      enableOnFormTags: false,
    }
  );

  // Cut repeat item
  useHotkeys(
    "mod+x",
    (e) => {
      if (selection.selectedRepeatItemId && selection.selectedRepeatContainerId) {
        e.preventDefault();
        handleRepeatItemCut();
        // Clear selection after cut
        setSelection({
          mode: "block",
          selectedElementId: null,
          selectedTextElementId: null,
          selectedRepeatItemId: null,
          selectedRepeatContainerId: null,
        });
      }
    },
    {
      enableOnContentEditable: false,
      enableOnFormTags: false,
    }
  );

  // Paste repeat item
  useHotkeys(
    "mod+v",
    (e) => {
      if (clipboard && clipboard.type === "repeat-item") {
        e.preventDefault();
        // If we have a selected repeat item, paste to its container
        // If no repeat item is selected, paste to the source container
        const targetContainerId = selection.selectedRepeatContainerId || clipboard.sourceContainerId;
        if (targetContainerId) {
          handleRepeatItemPaste(targetContainerId);
        }
      }
    },
    {
      enableOnContentEditable: false,
      enableOnFormTags: false,
    }
  );
};
