// src/components/PluginBasedEditor.tsx

import React, { useEffect, useState, useCallback } from "react";
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
  const selectionHandlers = useSelectionHandling({
    selection,
    setSelection,
    parsedElements,
  });

  useEditorHotkeys();

  const handleParseAndRender = useCallback(
    (html: string) => {
      const elements = parseAndRenderHTML(html);
      console.log("Parsed elements:", elements);
      setParsedElements(elements);
      // Reset history for new HTML
      if (clear) clear();
    },
    [setParsedElements, clear]
  );

  useEffect(() => {
    // Set initial HTML input on mount - only run once
    registerDefaultPlugins();
    useEditorStore.setState({ htmlInput: INITIAL_HTML });
    const elements = parseAndRenderHTML(INITIAL_HTML);
    console.log("Parsed elements:", elements);
    setParsedElements(elements);
    // Reset history for new HTML
    if (clear) clear();
  }, []); // Empty dependency array to run only once

  const handleNewHTML = () => {
    handleParseAndRender(htmlInput);
  };

  // Create plugin context
  const pluginContext: PluginContext = {
    selection,
    setSelection,
    handleItemAdd,
    handleDatabaseViewModeChange,
    handleDatabaseSettingsUpdate,
    handleDatabaseFetch,
  };

  // Plugin-based rendering
  const renderElement = (parsedElement: ParsedElement): React.ReactNode => {
    // Debug log for database elements
    if (parsedElement.type === "database") {
      console.log("Rendering database element:", parsedElement);
    }

    // For the new plugin system, we need to create a mock DOM element to pass to the plugin
    // This is a temporary solution until we fully refactor to work with DOM elements
    const tagName = "tagName" in parsedElement ? parsedElement.tagName : "div";
    const className = "attributes" in parsedElement && parsedElement.attributes?.class || "";
    const mockElement = document.createElement(tagName || "div");
    if (className) {
      mockElement.className = className;
    }
    mockElement.setAttribute("data-element-type", parsedElement.type);

    // Copy data attributes for matching
    if (parsedElement.type === "database" && parsedElement.database) {
      mockElement.setAttribute("data-database", parsedElement.database);
    }
    if (
      parsedElement.type === "repeat-container" &&
      parsedElement.repeatContainer
    ) {
      mockElement.setAttribute(
        "data-repeat-container",
        parsedElement.repeatContainer
      );
    }

    if (parsedElement.id) {
      mockElement.id = parsedElement.id;
    }

    // Use plugin manager to render element
    const result = pluginManager.renderElement(
      mockElement,
      parsedElement,
      pluginContext,
      renderElement
    );

    // Return null instead of undefined to prevent React errors
    return result || null;
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
            onClearSelection={selectionHandlers.clearSelection}
            onUndo={undo}
            onRedo={redo}
            pastStates={pastStates?.length || 0}
            futureStates={futureStates?.length || 0}
          />

          <div className="mt-4 text-center">
            <div className="text-xs text-gray-500">
              {previewMode === "mobile" && "375px × 667px"}
              {previewMode === "tablet" && "768px × 1024px"}
              {previewMode === "desktop" && "100% width"}
            </div>
          </div>

          <PreviewPanel
            previewMode={previewMode}
            parsedElements={parsedElements}
            renderElement={renderElement}
            onClick={selectionHandlers.handleClick}
            selection={selection}
          />
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
