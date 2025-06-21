import { useHotkeys } from "react-hotkeys-hook";
import { useEditorStore } from "../store/editorStore";

export const useEditorHotkeys = () => {
  const {
    selection,
    setSelection,
    handleItemDelete,
    handleRepeatItemCopy,
    handleRepeatItemCut,
    handleRepeatItemPaste,
  } = useEditorStore();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { undo, redo } = useEditorStore.temporal as any;

  // Global hotkeys
  useHotkeys(
    "esc",
    () => {
      setSelection({
        mode: "container",
        selectedContainerId: null,
        selectedContainerType: null,
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

  // Hotkeys for 'repeat-item' mode
  useHotkeys(
    "backspace, del",
    () => {
      if (
        selection.selectedRepeatContainerId &&
        selection.selectedRepeatItemId
      ) {
        handleItemDelete(
          selection.selectedRepeatContainerId,
          selection.selectedRepeatItemId
        );
      }
    },
    {
      enabled: selection.mode === "repeat-item",
      enableOnContentEditable: false,
      enableOnFormTags: false,
    }
  );

  useHotkeys(
    "mod+c",
    (e) => {
      e.preventDefault();
      handleRepeatItemCopy();
    },
    {
      enabled: selection.mode === "repeat-item",
      enableOnContentEditable: false,
      enableOnFormTags: false,
      preventDefault: true,
    }
  );

  useHotkeys(
    "mod+x",
    (e) => {
      e.preventDefault();
      handleRepeatItemCut();
    },
    {
      enabled: selection.mode === "repeat-item",
      enableOnContentEditable: false,
      enableOnFormTags: false,
      preventDefault: true,
    }
  );

  useHotkeys(
    "mod+v",
    (e) => {
      e.preventDefault();
      if (selection.selectedRepeatContainerId) {
        handleRepeatItemPaste(selection.selectedRepeatContainerId);
      }
    },
    {
      enabled: selection.mode === "repeat-item",
      enableOnContentEditable: false,
      enableOnFormTags: false,
      preventDefault: true,
    }
  );
};
