import { useHotkeys } from "react-hotkeys-hook";
import { useEditorStore } from "../store/editorStore";

export const useEditorHotkeys = () => {
  const { setSelection } = useEditorStore();

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
};
