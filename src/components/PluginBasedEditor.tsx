// src/components/PluginBasedEditor.tsx

import React, { useEffect, useState } from "react";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useEditorStore } from "../store/editorStore";
import { useEditorHotkeys } from "../hooks/useEditorHotkeys";
import { useSelectionHandling } from "../features/selection";
import { useResizeHandling } from "../hooks/useResizeHandling";
import { useHistory } from "../features/history";

// UI Components
import { PreviewControls } from "./ui/PreviewControls";
import { PreviewPanel } from "./ui/PreviewPanel";
import { ResizeHandle } from "./ui/ResizeHandle";
import { InspectorPanel } from "./ui/InspectorPanel";
import { SectionSidebar } from "./ui/SectionSidebar";

// Plugin system
import { pluginManager, registerDefaultPlugins } from "../plugins";
import type { ParsedElement, RegularElement } from "../types";
import type { PluginContext } from "../plugins/types";
import { parseAndRenderHTML } from "../utils/htmlParser";
import { getTemplateById } from "../data/sectionTemplates";
import { log } from "../utils/logger";

export const PluginBasedEditor: React.FC = () => {
  const {
    parsedElements,
    sections,
    selection,
    setParsedElements,
    setSelection,
    handleItemAdd,
    handleDatabaseViewModeChange,
    handleDatabaseSettingsUpdate,
    handleDatabaseFetch,
    addSection,
    updateSectionElements,
  } = useEditorStore();

  // Use history feature for command management
  const {
    executeTextEdit,
    undo,
    redo,
    getUndoRedoState,
    clearHistory,
  } = useHistory();

  // Get command system state
  const undoRedoState = getUndoRedoState();

  // Fallback to temporal store for now (will be phased out)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const temporalStore = useEditorStore.temporal as any;
  const { clear } = temporalStore;

  // UI State
  const [previewMode, setPreviewMode] = useState<
    "mobile" | "tablet" | "desktop"
  >("desktop");
  const [showUI, setShowUI] = useState(true);

  // Custom hooks
  const { leftPanelWidth, isResizing, handleMouseDown } = useResizeHandling(80);
  const selectionHandlers = useSelectionHandling({
    selection,
    setSelection,
    parsedElements,
  });

  useEditorHotkeys(setShowUI);

  // Load initial sections
  const loadInitialSections = () => {
    // Define initial sections to create a complete page with various elements
    const initialTemplates = [
      'test-simple-text',    // Simple text
      'hero-split',          // Buttons + Images
      'features-grid',       // Repeat items
      'cta-split',          // Form inputs
      'testimonials-grid',   // More repeat items
    ];

    // Add each template as a section
    initialTemplates.forEach((templateId, index) => {
      const template = getTemplateById(templateId);
      if (template) {
        // Add section
        addSection(template, index);
        
        // Parse and add elements to the section
        setTimeout(() => {
          const sections = useEditorStore.getState().sections;
          const section = sections[index];
          if (section) {
            const elements = parseAndRenderHTML(template.html);
            log.parser('info', `Parsed elements for section`, { sectionId: section.id, elementCount: elements.length });
            updateSectionElements(section.id, elements);
          }
        }, 50 * (index + 1)); // Stagger the updates
      }
    });
  };

  useEffect(() => {
    // Set initial HTML input on mount - only run once
    registerDefaultPlugins();
    // Clear initial state
    setParsedElements([]);
    // Reset both command history and temporal history for new HTML
    clearHistory();
    if (clear) clear();
    
    // Load initial sections with sample content
    loadInitialSections();
  }, []); // Empty dependency array to run only once

  // Update parsedElements when sections change - wrap each section
  useEffect(() => {
    // Create section wrappers with their elements
    const sectionElements: ParsedElement[] = sections
      .sort((a, b) => a.order - b.order)
      .map(section => {
        const wrapper: ParsedElement = {
          id: section.id,
          type: 'element',
          tagName: 'section',
          attributes: {
            'data-section-id': section.id,
            'class': 'section-wrapper'
          },
          children: section.elements
        } as RegularElement;
        
        return wrapper;
      });
    
    log.render('debug', 'Setting parsedElements', { sectionCount: sectionElements.length });
    setParsedElements(sectionElements);
  }, [sections, setParsedElements]);

  // Debug keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        console.log('🔑 Global keydown detected:', {
          key: e.key,
          code: e.code,
          metaKey: e.metaKey,
          ctrlKey: e.ctrlKey,
          defaultPrevented: e.defaultPrevented
        });
      }
    };
    
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, []);

  // Create plugin context
  const pluginContext: PluginContext = {
    selection,
    setSelection,
    handleItemAdd,
    handleDatabaseViewModeChange,
    handleDatabaseSettingsUpdate,
    handleDatabaseFetch,
    onTextChange: executeTextEdit, // Add text editing callback
  };

  // Plugin-based rendering
  const renderElement = (parsedElement: ParsedElement): React.ReactNode => {
    log.render('debug', 'Rendering element', { id: parsedElement.id, type: parsedElement.type });
    
    // Check if this is a section wrapper
    if ("tagName" in parsedElement && parsedElement.tagName === "section" && 
        "attributes" in parsedElement && parsedElement.attributes?.['data-section-id']) {
      log.render('debug', 'Rendering section wrapper', { 
        sectionId: parsedElement.attributes['data-section-id'],
        childrenCount: (parsedElement as RegularElement).children?.length || 0
      });
      // Render section wrapper directly
      return (
        <section
          key={parsedElement.id}
          id={parsedElement.id}
          data-element-id={parsedElement.id}
          data-section-id={parsedElement.attributes['data-section-id']}
          className={parsedElement.attributes.class || ''}
        >
          {"children" in parsedElement && (parsedElement as RegularElement).children?.map((child, index) => (
            <React.Fragment key={child.id || index}>
              {renderElement(child)}
            </React.Fragment>
          ))}
        </section>
      );
    }
    
    // For other elements, use the plugin system
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
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-50">
        <div className="flex h-screen">
          {/* Left Sidebar - Section Library */}
          {showUI && <SectionSidebar />}

          {/* Middle Panel - Responsive Preview */}
          <div
            className="p-6 overflow-y-auto bg-gray-100 flex flex-col"
            style={{ width: showUI ? `${leftPanelWidth}%` : '100%' }}
          >
            <PreviewControls
              previewMode={previewMode}
              onPreviewModeChange={setPreviewMode}
              selection={selection}
              onClearSelection={selectionHandlers.clearSelection}
              onUndo={undo}
              onRedo={redo}
              canUndo={undoRedoState.canUndo}
              canRedo={undoRedoState.canRedo}
              undoDescription={undoRedoState.undoDescription}
              redoDescription={undoRedoState.redoDescription}
            />

            <PreviewPanel
              previewMode={previewMode}
              parsedElements={parsedElements}
              renderElement={renderElement}
              onClick={selectionHandlers.handleClick}
              selection={selection}
            />
          </div>

          {showUI && <ResizeHandle isResizing={isResizing} onMouseDown={handleMouseDown} />}

          {/* Right Panel - Inspector */}
          {showUI && (
            <div
              className="bg-white border-l border-gray-200 flex flex-col"
              style={{ width: `${100 - leftPanelWidth}%` }}
            >
              <InspectorPanel
                selection={selection}
                parsedElements={parsedElements}
              />
            </div>
          )}
        </div>
      </div>
    </DndProvider>
  );
};
