// src/components/PluginBasedEditor.tsx

import React, { useEffect, useState } from "react";
import { useEditorStore } from "../store/editorStore";
import { useEditorHotkeys } from "../hooks/useEditorHotkeys";
import { useSelectionHandling } from "../hooks/useSelectionHandling";
import { useResizeHandling } from "../hooks/useResizeHandling";
import { INITIAL_HTML } from "./INITIAL_HTML";

// UI Components
import { PreviewControls } from "./ui/PreviewControls";
import { PreviewPanel } from "./ui/PreviewPanel";
import { ResizeHandle } from "./ui/ResizeHandle";
import { HtmlEditorPanel } from "./ui/HtmlEditorPanel";

// Plugin system
import { pluginManager, registerDefaultPlugins } from "../plugins";
import { parseAndRenderHTML } from "../utils/htmlParser";
import type { ParsedElement } from "../types";
import type { PluginContext } from "../plugins/types";

export const PluginBasedEditor: React.FC = () => {
  const {
    htmlInput,
    parsedElements,
    selection,
    setHtmlInput,
    setParsedElements,
    setSelection,
    handleItemAdd,
    handleTextChange,
    handleImageChange,
    handleDatabaseViewModeChange,
    handleDatabaseSettingsUpdate,
    handleDatabaseFetch,
  } = useEditorStore();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const temporalStore = useEditorStore.temporal as any;
  const { undo, redo, clear } = temporalStore;
  const { pastStates, futureStates } = temporalStore.getState();

  // UI State
  const [previewMode, setPreviewMode] = useState<
    "mobile" | "tablet" | "desktop"
  >("desktop");

  // Custom hooks
  const { leftPanelWidth, isResizing, handleMouseDown } = useResizeHandling(80);
  const { handleDeselect, handleDocumentClick } = useSelectionHandling({
    selection,
    setSelection,
  });

  useEditorHotkeys();

  useEffect(() => {
    // Set initial HTML input on mount
    registerDefaultPlugins();
    useEditorStore.setState({ htmlInput: INITIAL_HTML });
    handleParseAndRender(INITIAL_HTML);
  }, []);

  const handleParseAndRender = (html: string) => {
    const elements = parseAndRenderHTML(html);
    console.log('Parsed elements:', elements);
    setParsedElements(elements);
    // Reset history for new HTML
    if (clear) clear();
  };

  const handleNewHTML = () => {
    handleParseAndRender(htmlInput);
  };

  // Create plugin context
  const pluginContext: PluginContext = {
    selection,
    setSelection,
    handleItemAdd,
    handleTextChange,
    handleImageChange,
    handleDatabaseViewModeChange,
    handleDatabaseSettingsUpdate,
    handleDatabaseFetch,
  };

  // Plugin-based rendering
  const renderElement = (element: ParsedElement): React.ReactNode => {
    // Debug log for database elements
    if (element.type === 'database') {
      console.log('Rendering database element:', element);
    }

    // New selection logic: text is only editable in text mode for the selected text element
    const canEditText =
      selection.mode === "text" &&
      element.type === "text" &&
      selection.selectedTextElementId === element.id;

    // Show hover effects when in block mode and element is selected
    const showHoverEffects =
      selection.mode === "block" && selection.selectedElementId === element.id;

    // Use plugin manager to render element
    return pluginManager.renderElement(
      element,
      {
        ...pluginContext,
        canEditText,
        showHoverEffects,
      } as any, // Type assertion for extended context
      renderElement
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Left Panel - Responsive Preview */}
        <div
          className="p-6 overflow-y-auto bg-gray-100 flex flex-col"
          style={{ width: `${leftPanelWidth}%` }}
        >
          <PreviewControls
            previewMode={previewMode}
            onPreviewModeChange={setPreviewMode}
            selection={selection}
            onClearSelection={handleDeselect}
            onUndo={undo}
            onRedo={redo}
            pastStates={pastStates?.length || 0}
            futureStates={futureStates?.length || 0}
          />

          <PreviewPanel
            previewMode={previewMode}
            parsedElements={parsedElements}
            renderElement={renderElement}
            onClick={handleDocumentClick}
          />

          <div className="mt-4 text-center">
            <div className="text-xs text-gray-500">
              {previewMode === "mobile" && "375px × 667px"}
              {previewMode === "tablet" && "768px × 1024px"}
              {previewMode === "desktop" && "100% width"}
            </div>
          </div>
        </div>

        <ResizeHandle isResizing={isResizing} onMouseDown={handleMouseDown} />

        {/* Right Panel - HTML Source */}
        <div
          className="bg-white border-l border-gray-200 flex flex-col"
          style={{ width: `${100 - leftPanelWidth}%` }}
        >
          <HtmlEditorPanel
            htmlInput={htmlInput}
            onHtmlInputChange={setHtmlInput}
            onApplyHtml={handleNewHTML}
            pastStates={pastStates?.length || 0}
            futureStates={futureStates?.length || 0}
          />
        </div>
      </div>
    </div>
  );
};
