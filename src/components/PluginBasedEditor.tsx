// src/components/PluginBasedEditor.tsx

import React, { useEffect, useState } from "react";
import { useEditorStore } from "../store/editorStore";
import { useEditorHotkeys } from "../hooks/useEditorHotkeys";
import { useSelectionHandling } from "../features/selection";
import { useResizeHandling } from "../hooks/useResizeHandling";
import { INITIAL_HTML } from "./INITIAL_HTML";
// import { INITIAL_HTML_SIMPLE } from "./INITIAL_HTML_SIMPLE";
// import { INITIAL_HTML_TEST } from "./INITIAL_HTML_TEST";

// UI Components
import { PreviewControls } from "./ui/PreviewControls";
import { PreviewPanel } from "./ui/PreviewPanel";
import { ResizeHandle } from "./ui/ResizeHandle";
import { InspectorPanel } from "./ui/InspectorPanel";

// Plugin system
import { pluginManager, registerDefaultPlugins } from "../plugins";
import { parseAndRenderHTML } from "../utils/htmlParser";
import type { ParsedElement } from "../types";
import type { PluginContext } from "../plugins/types";

export const PluginBasedEditor: React.FC = () => {
  const {
    parsedElements,
    selection,
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

  useEffect(() => {
    // Set initial HTML input on mount - only run once
    registerDefaultPlugins();
    // Parse initial HTML (mapping will be created during rendering)
    const elements = parseAndRenderHTML(INITIAL_HTML);
    setParsedElements(elements);
    // Reset history for new HTML
    if (clear) clear();
  }, []); // Empty dependency array to run only once

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
    // For the new plugin system, we need to create a mock DOM element to pass to the plugin
    // This is a temporary solution until we fully refactor to work with DOM elements
    const tagName = "tagName" in parsedElement ? parsedElement.tagName : "div";
    const className = "attributes" in parsedElement && parsedElement.attributes?.class || "";
    const mockElement = document.createElement(tagName || "div");
    if (className) {
      mockElement.className = className;
    }
    
    // For better plugin matching, copy all attributes
    if ("attributes" in parsedElement && parsedElement.attributes) {
      Object.entries(parsedElement.attributes).forEach(([key, value]) => {
        mockElement.setAttribute(key, value);
      });
    }
    
    // Special handling for button elements to ensure proper plugin matching
    if (tagName === 'button' && "attributes" in parsedElement) {
      mockElement.setAttribute("type", parsedElement.attributes?.type || "button");
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

          <PreviewPanel
            previewMode={previewMode}
            parsedElements={parsedElements}
            renderElement={renderElement}
            onClick={selectionHandlers.handleClick}
            selection={selection}
          />
        </div>

        <ResizeHandle isResizing={isResizing} onMouseDown={handleMouseDown} />

        {/* Right Panel - Inspector */}
        <div
          className="bg-white border-l border-gray-200 flex flex-col"
          style={{ width: `${100 - leftPanelWidth}%` }}
        >
          <InspectorPanel
            selection={selection}
            parsedElements={parsedElements}
          />
        </div>
      </div>
    </div>
  );
};
