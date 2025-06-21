import React, { useEffect, useCallback } from "react";
import type { ParsedElement, RegularElement, SelectionState } from "../types";
import { useEditorStore } from "../store/editorStore";
import { useEditorHotkeys } from "../hooks/useEditorHotkeys";
import { INITIAL_HTML } from "./INITIAL_HTML";
import {
  Smartphone,
  Tablet,
  Monitor,
  Undo2,
  Redo2,
  X,
  Copy,
  Scissors,
  Clipboard,
  Trash2,
  Plus,
  Code2,
  Eye,
} from "lucide-react";

interface EditableTextProps {
  text: string;
  onTextChange: (newText: string) => void;
  className?: string;
  elementId: string;
  isEditable?: boolean;
  showHoverEffects?: boolean;
}

interface EditableImageProps {
  src?: string;
  alt?: string;
  onImageChange: (newSrc: string) => void;
  className?: string;
  elementId: string;
}

interface RepeatableContainerProps {
  containerId: string;
  containerName: string;
  className?: string;
  items: RegularElement[];
  selectedItemId: string | null;
  onItemAdd: (containerId: string) => void;
  renderItem: (item: ParsedElement) => React.ReactNode;
  showHoverEffects?: boolean;
}

interface RepeatableItemProps {
  item: RegularElement;
  containerId: string;
  isSelected: boolean;
  children: React.ReactNode;
  showHoverEffects?: boolean;
}

interface SelectableContainerProps {
  element: ParsedElement;
  isSelected: boolean;
  isInContainerMode: boolean;
  children: React.ReactNode;
}

const EditableText: React.FC<EditableTextProps> = ({
  text,
  onTextChange,
  className,
  elementId,
  isEditable = true,
  showHoverEffects = false,
}) => {
  const [currentText, setCurrentText] = React.useState(text);
  const textRef = React.useRef<HTMLSpanElement>(null);
  const originalTextRef = React.useRef<string>(text);
  const isCommittingRef = React.useRef<boolean>(false);

  // Update current text when prop changes
  useEffect(() => {
    if (!isCommittingRef.current) {
      setCurrentText(text);
      originalTextRef.current = text;
      if (textRef.current) {
        // Convert <br/> tags to line breaks for editing
        const editableText = text.replace(/<br\s*\/?>/gi, "\n");
        textRef.current.textContent = editableText;
      }
    }
  }, [text]);

  // Initialize as editable on mount
  useEffect(() => {
    if (textRef.current) {
      textRef.current.contentEditable = isEditable ? "plaintext-only" : "false";
    }
  }, [isEditable]);

  // Handle focus to convert <br/> tags to line breaks for editing
  const handleFocus = useCallback(() => {
    if (textRef.current && isEditable) {
      // Convert <br/> tags to line breaks for editing
      const editableText = currentText.replace(/<br\s*\/?>/gi, "\n");
      textRef.current.textContent = editableText;
    }
  }, [currentText, isEditable]);

  const handleBlur = useCallback(() => {
    if (textRef.current && !isCommittingRef.current) {
      isCommittingRef.current = true;

      const rawText = textRef.current.textContent || "";
      // Convert line breaks to <br/> tags
      const htmlText = rawText.replace(/\n/g, "<br/>");
      setCurrentText(htmlText);

      // Only trigger change if text actually changed
      const originalHtml = originalTextRef.current.replace(/\n/g, "<br/>");
      if (htmlText !== originalHtml) {
        onTextChange(htmlText);
      }

      // Reset commit flag after a short delay
      setTimeout(() => {
        isCommittingRef.current = false;
      }, 100);
    }
  }, [onTextChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      // ESC now saves and blurs instead of canceling
      textRef.current?.blur();
    }
    // Remove Enter key handler - let it work as normal line break
  }, []);

  const getTextStyles = () => {
    const baseStyles = `${className} rounded px-1 transition-all duration-200 inline-block min-w-[20px] min-h-[1em]`;

    if (!isEditable) {
      return `${baseStyles} cursor-default`;
    }

    let editableStyles = `${baseStyles} cursor-text focus:outline-none focus:ring-1 focus:ring-blue-400`;

    if (showHoverEffects) {
      editableStyles += ` underline hover:bg-blue-50 hover:text-blue-700`;
    }

    return editableStyles;
  };

  // Helper function to render text with line breaks
  const renderTextWithLineBreaks = (text: string) => {
    if (!text || text === "\u00A0") return "\u00A0";

    // Split by <br/> tags and render with line breaks
    const parts = text.split(/<br\s*\/?>/gi);
    if (parts.length === 1) {
      return text;
    }

    return parts.map((part, index) => (
      <React.Fragment key={index}>
        {part}
        {index < parts.length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <span
      ref={textRef}
      contentEditable={isEditable ? "plaintext-only" : "false"}
      suppressContentEditableWarning={true}
      onFocus={isEditable ? handleFocus : undefined}
      onBlur={isEditable ? handleBlur : undefined}
      onKeyDown={isEditable ? handleKeyDown : undefined}
      className={getTextStyles()}
      data-element-id={elementId}
    >
      {renderTextWithLineBreaks(currentText)}
    </span>
  );
};

const EditableImage: React.FC<EditableImageProps> = ({
  src,
  alt,
  onImageChange,
  className,
  elementId,
}) => {
  const [dragOver, setDragOver] = React.useState(false);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onImageChange(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    e.preventDefault();
    const items = e.clipboardData.items;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          handleImageUpload(file);
          return;
        }
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Only set dragOver to false if we're actually leaving the element
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith("image/")) {
      handleImageUpload(files[0]);
    }
  };

  return (
    <div className={`${className} relative group`} data-element-id={elementId}>
      {src ? (
        <img
          src={src}
          alt={alt || "Editable image"}
          className="transition-all duration-200 group-hover:opacity-75"
          onPaste={handlePaste}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          tabIndex={0}
          style={{ outline: "none" }}
        />
      ) : (
        <div
          className={`border-2 border-dashed border-gray-300 rounded-lg text-center transition-all duration-200 hover:border-gray-400 focus:border-blue-500 focus:outline-none flex items-center justify-center ${
            dragOver ? "border-blue-500 bg-blue-50" : ""
          }`}
          onPaste={handlePaste}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          tabIndex={0}
          style={{ aspectRatio: "auto", minHeight: "auto" }}
        >
          <div className="text-gray-400 p-4">
            <svg
              className="mx-auto w-8 h-8"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      )}

      {src && (
        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded"></div>
      )}
    </div>
  );
};

const RepeatableItem: React.FC<RepeatableItemProps> = ({
  item,
  containerId,
  isSelected,
  children,
  showHoverEffects = false,
}) => {
  const getItemStyles = () => {
    const baseStyles =
      "relative group cursor-pointer transition-all duration-200";

    if (isSelected) {
      return `${baseStyles} ring-2 ring-purple-500`;
    }

    let hoverStyles = `${baseStyles} hover:ring-1 hover:ring-purple-300`;

    if (showHoverEffects) {
      hoverStyles += ` hover:bg-purple-50`;
    }

    return hoverStyles;
  };

  return (
    <div
      className={getItemStyles()}
      data-repeat-item-id={item.id}
      data-repeat-container-id={containerId}
    >
      {children}

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute -top-2 -left-2 bg-purple-500 text-white px-2 py-1 rounded text-xs font-medium shadow-md z-20">
          Selected Item
        </div>
      )}
    </div>
  );
};

const RepeatableContainer: React.FC<RepeatableContainerProps> = ({
  containerId,
  containerName,
  className,
  items,
  selectedItemId,
  onItemAdd,
  renderItem,
  showHoverEffects = false,
}) => {
  const [showAddButton, setShowAddButton] = React.useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowAddButton(true)}
      onMouseLeave={() => setShowAddButton(false)}
    >
      <div className={className}>
        {items.map((item) => (
          <RepeatableItem
            key={item.id}
            item={item}
            containerId={containerId}
            isSelected={selectedItemId === item.id}
            showHoverEffects={showHoverEffects}
          >
            {renderItem(item)}
          </RepeatableItem>
        ))}
      </div>

      {showAddButton && (
        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
          <button
            onClick={() => onItemAdd(containerId)}
            className="bg-green-500 text-white px-3 py-1 rounded-full text-sm hover:bg-green-600 shadow-lg flex items-center gap-1"
            title={`Add new ${containerName}`}
          >
            <Plus className="w-3 h-3" />
            {containerName}
          </button>
        </div>
      )}
    </div>
  );
};

const SelectableContainer: React.FC<SelectableContainerProps> = ({
  element,
  isSelected,
  isInContainerMode,
  children,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const getContainerStyles = () => {
    const baseStyles = "relative transition-all duration-200";

    if (isSelected) {
      return `${baseStyles} ring-2 ring-blue-500`;
    }

    if (isInContainerMode && isHovered) {
      return `${baseStyles} ring-1 ring-blue-300 bg-blue-50 bg-opacity-30 cursor-pointer`;
    }

    return baseStyles;
  };

  const getElementName = () => {
    if (element.type === "repeat-container") {
      return element.repeatContainer;
    }
    if (
      element.type === "element" ||
      element.type === "img" ||
      element.type === "picture"
    ) {
      return element.tagName;
    }
    return "container";
  };

  return (
    <div
      className={getContainerStyles()}
      data-container-id={element.id}
      data-container-type={
        element.type === "repeat-container" ? "repeat-container" : "regular"
      }
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute -top-2 -left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium shadow-md z-10">
          Selected: {getElementName()}
        </div>
      )}

      {/* Hover indicator in container mode */}
      {isInContainerMode && isHovered && !isSelected && (
        <div className="absolute -top-2 -left-2 bg-gray-500 text-white px-2 py-1 rounded text-xs font-medium shadow-md z-10">
          Click to select: {getElementName()}
        </div>
      )}
    </div>
  );
};

export const PlaintextEditor: React.FC = () => {
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
  } = useEditorStore();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const temporalStore = useEditorStore.temporal as any;
  const { undo, redo, clear } = temporalStore;
  const { pastStates, futureStates } = temporalStore.getState();

  // Resize functionality for 2-panel layout
  const [leftPanelWidth, setLeftPanelWidth] = React.useState(80); // percentage
  const [isResizing, setIsResizing] = React.useState(false);
  const [startX, setStartX] = React.useState(0);
  const [startWidth, setStartWidth] = React.useState(0);

  // Responsive preview settings
  const [previewMode, setPreviewMode] = React.useState<
    "mobile" | "tablet" | "desktop"
  >("desktop");
  const previewWidths = {
    mobile: "375px",
    tablet: "768px",
    desktop: "100%",
  };

  useEditorHotkeys();

  useEffect(() => {
    // Set initial HTML input on mount
    useEditorStore.setState({ htmlInput: INITIAL_HTML });
    parseAndRenderHTML(INITIAL_HTML);
  }, []);

  const parseAndRenderHTML = (html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const elements = processElement(doc.body.firstElementChild);
    if (elements) {
      setParsedElements([elements]);
      // Reset history for new HTML
      if (clear) clear();
    }
  };

  const processElement = (element: Element | null): ParsedElement | null => {
    if (!element) return null;

    const tagName = element.tagName.toLowerCase();
    const className = element.getAttribute("class") || "";
    const repeatContainer = element.getAttribute("data-repeat-container");
    const repeatItem = element.getAttribute("data-repeat-item");
    const id = Math.random().toString(36).substr(2, 9);

    if (tagName === "img") {
      return {
        type: "img",
        tagName,
        className,
        src: element.getAttribute("src") || "",
        alt: element.getAttribute("alt") || "",
        id,
        repeatItem: repeatItem || undefined,
      };
    }

    if (tagName === "picture") {
      const imgElement = element.querySelector("img");
      return {
        type: "picture",
        tagName,
        className,
        src: imgElement?.getAttribute("src") || "",
        alt: imgElement?.getAttribute("alt") || "",
        id,
        repeatItem: repeatItem || undefined,
      };
    }

    const children: ParsedElement[] = Array.from(element.childNodes)
      .map((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const text = child.textContent?.trim();
          if (text) {
            return {
              type: "text",
              content: text,
              id: Math.random().toString(36).substr(2, 9),
            } as ParsedElement;
          }
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          return processElement(child as Element);
        }
        return null;
      })
      .filter((child): child is ParsedElement => child !== null);

    if (repeatContainer) {
      const items = children.filter(
        (c) => c.type === "element" && c.repeatItem
      ) as RegularElement[];
      const nonItemChildren = children.filter(
        (c) => !(c.type === "element" && c.repeatItem)
      );

      return {
        type: "repeat-container",
        tagName,
        className,
        repeatContainer,
        items,
        children: nonItemChildren,
        id,
      };
    }

    return {
      type: "element",
      tagName,
      className,
      children,
      id,
      repeatItem: repeatItem || undefined,
    };
  };

  const handleContainerSelect = (
    containerId: string,
    containerType: "repeat-container" | "regular"
  ) => {
    setSelection({
      mode: "container",
      selectedContainerId: containerId,
      selectedContainerType: containerType,
      selectedRepeatItemId: null,
      selectedRepeatContainerId: null,
    });
  };

  const handleContainerDeselect = () => {
    setSelection({
      mode: "container",
      selectedContainerId: null,
      selectedContainerType: null,
      selectedRepeatItemId: null,
      selectedRepeatContainerId: null,
    });
  };

  const handleRepeatItemSelect = (containerId: string, itemId: string) => {
    setSelection({
      mode: "repeat-item",
      selectedContainerId: containerId,
      selectedContainerType: "repeat-container",
      selectedRepeatItemId: itemId,
      selectedRepeatContainerId: containerId,
    });
  };

  const handleTextSelect = () => {
    setSelection({
      ...selection,
      mode: "text",
      selectedRepeatItemId: null,
      selectedRepeatContainerId: null,
    });
  };

  const handleDocumentClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    const containerEl = target.closest<HTMLElement>("[data-container-id]");
    const repeatItemEl = target.closest<HTMLElement>("[data-repeat-item-id]");

    // 1. Clicked outside any container, deselect all.
    if (!containerEl) {
      handleContainerDeselect();
      return;
    }

    const clickedContainerId = containerEl.dataset.containerId!;
    const clickedContainerType = containerEl.dataset.containerType as
      | "repeat-container"
      | "regular";
    const clickedRepeatItemId = repeatItemEl?.dataset.repeatItemId || null;

    const { mode, selectedContainerId } = selection;

    // 2. A different container is clicked, select it and reset.
    if (selectedContainerId && selectedContainerId !== clickedContainerId) {
      handleContainerSelect(clickedContainerId, clickedContainerType);
      return;
    }

    // 3. No container is selected yet, select the clicked one.
    if (!selectedContainerId) {
      handleContainerSelect(clickedContainerId, clickedContainerType);
      return;
    }

    // 4. From here, a container is selected and the click is within it.
    // The logic now follows the mode priority.

    if (mode === "container") {
      // In container mode, we prioritize sub-selections based on what was clicked.
      if (clickedRepeatItemId) {
        handleRepeatItemSelect(clickedContainerId, clickedRepeatItemId);
      } else {
        handleTextSelect();
      }
    } else if (mode === "repeat-item") {
      // In repeat-item mode, we prioritize repeat-items.
      if (clickedRepeatItemId) {
        handleRepeatItemSelect(clickedContainerId, clickedRepeatItemId);
      } else {
        handleTextSelect(); // Fallback to text selection.
      }
    } else if (mode === "text") {
      // In text mode, text is priority, but repeat-items can override.
      if (clickedRepeatItemId) {
        handleRepeatItemSelect(clickedContainerId, clickedRepeatItemId);
      } else {
        // Check if the clicked target is a text element or its descendant
        const isTextElement =
          target.hasAttribute("contenteditable") ||
          target.hasAttribute("data-element-id");
        const isWithinTextElement =
          target.closest("[contenteditable]") ||
          target.closest("[data-element-id]");

        const isTextClick = isTextElement || isWithinTextElement;

        if (isTextClick) {
          // Already in text mode, no state change needed. Let browser handle focus.
        } else {
          // Clicked on non-text area, exit text mode back to container mode
          setSelection({
            ...selection,
            mode: "container",
          });
        }
      }
    }
  };

  const isElementInSelectedContainer = (
    element: ParsedElement,
    selectionState: SelectionState
  ): boolean => {
    // This function needs to be pure and not rely on component scope state
    // Let's implement this logic purely based on inputs
    const findInTree = (root: ParsedElement, targetId: string): boolean => {
      if (root.id === targetId) return true;
      if ("children" in root && root.children) {
        if (root.children.some((child) => findInTree(child, targetId)))
          return true;
      }
      if ("items" in root && root.items) {
        if (root.items.some((item) => findInTree(item, targetId))) return true;
      }
      return false;
    };

    if (selectionState.mode === "text" && selectionState.selectedContainerId) {
      // Find the selected container in the tree
      const findContainer = (
        elements: ParsedElement[]
      ): ParsedElement | null => {
        for (const el of elements) {
          if (el.id === selectionState.selectedContainerId) return el;
          if ("children" in el && el.children) {
            const found = findContainer(el.children);
            if (found) return found;
          }
          if ("items" in el && el.items) {
            const found = findContainer(el.items);
            if (found) return found;
          }
        }
        return null;
      };
      const container = findContainer(parsedElements);
      return container ? findInTree(container, element.id) : false;
    }

    if (
      selectionState.mode === "repeat-item" &&
      selectionState.selectedRepeatItemId
    ) {
      const findItem = (elements: ParsedElement[]): ParsedElement | null => {
        for (const el of elements) {
          if (el.id === selectionState.selectedRepeatItemId) return el;
          if ("children" in el && el.children) {
            const found = findItem(el.children);
            if (found) return found;
          }
          if ("items" in el && el.items) {
            const found = findItem(el.items);
            if (found) return found;
          }
        }
        return null;
      };
      const item = findItem(parsedElements);
      return item ? findInTree(item, element.id) : false;
    }

    return false;
  };

  const renderElement = (element: ParsedElement): React.ReactNode => {
    const isInSelectedContainer = isElementInSelectedContainer(
      element,
      selection
    );
    const canEditText =
      selection.mode === "text" || selection.mode === "repeat-item"
        ? isInSelectedContainer
        : false;

    // Check if we should show hover effects (when a section is selected in container mode)
    const showHoverEffects = Boolean(
      selection.mode === "container" &&
        selection.selectedContainerId &&
        isInSelectedContainer
    );

    if (element.type === "text") {
      return (
        <EditableText
          key={element.id}
          elementId={element.id}
          text={element.content}
          onTextChange={(newText) => handleTextChange(element.id, newText)}
          isEditable={canEditText}
          showHoverEffects={showHoverEffects}
        />
      );
    }

    if (element.type === "img" || element.type === "picture") {
      return (
        <EditableImage
          key={element.id}
          elementId={element.id}
          src={element.src}
          alt={element.alt}
          className={element.className}
          onImageChange={(newSrc) => handleImageChange(element.id, newSrc)}
        />
      );
    }

    if (element.type === "repeat-container") {
      const isSelected = selection.selectedContainerId === element.id;
      const selectedItemId =
        selection.selectedRepeatContainerId === element.id
          ? selection.selectedRepeatItemId
          : null;

      const repeatContainer = (
        <RepeatableContainer
          key={element.id}
          containerId={element.id}
          containerName={element.repeatContainer}
          className={element.className}
          items={element.items}
          selectedItemId={selectedItemId}
          onItemAdd={handleItemAdd}
          renderItem={renderElement}
          showHoverEffects={showHoverEffects}
        />
      );

      return (
        <SelectableContainer
          key={`selectable-${element.id}`}
          element={element}
          isSelected={isSelected}
          isInContainerMode={selection.mode === "container"}
        >
          {repeatContainer}
        </SelectableContainer>
      );
    }

    if (element.type === "element") {
      const Tag = element.tagName as keyof React.JSX.IntrinsicElements;
      const isSelected = selection.selectedContainerId === element.id;
      const regularElement = React.createElement(
        Tag,
        { key: element.id, className: element.className },
        element.children.map(renderElement)
      );

      if (
        element.tagName === "section" ||
        element.tagName === "header" ||
        element.tagName === "footer" ||
        element.tagName === "nav"
      ) {
        return (
          <SelectableContainer
            key={`selectable-${element.id}`}
            element={element}
            isSelected={isSelected}
            isInContainerMode={selection.mode === "container"}
          >
            {regularElement}
          </SelectableContainer>
        );
      }

      return regularElement;
    }
    return null;
  };

  const handleNewHTML = () => {
    parseAndRenderHTML(htmlInput);
  };

  // Resize handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    setStartX(e.clientX);
    setStartWidth(leftPanelWidth);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const handleMouseMove = React.useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;

      const deltaX = e.clientX - startX;
      const containerWidth = window.innerWidth;
      const deltaPercent = (deltaX / containerWidth) * 100;
      const newWidth = Math.min(Math.max(startWidth + deltaPercent, 20), 80);

      setLeftPanelWidth(newWidth);
    },
    [isResizing, startX, startWidth]
  );

  const handleMouseUp = React.useCallback(() => {
    setIsResizing(false);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  // Add event listeners for resize
  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Left Panel - Responsive Preview */}
        <div
          className="p-6 overflow-y-auto bg-gray-100 flex flex-col"
          style={{ width: `${leftPanelWidth}%` }}
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Eye className="w-5 h-5 text-gray-700" />
              <div className="flex gap-2">
                <button
                  onClick={() => setPreviewMode("mobile")}
                  className={`p-2 rounded transition-colors ${
                    previewMode === "mobile"
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                  title="Mobile view (375px)"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewMode("tablet")}
                  className={`p-2 rounded transition-colors ${
                    previewMode === "tablet"
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                  title="Tablet view (768px)"
                >
                  <Tablet className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewMode("desktop")}
                  className={`p-2 rounded transition-colors ${
                    previewMode === "desktop"
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                  title="Desktop view (100%)"
                >
                  <Monitor className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  selection.mode === "container"
                    ? "bg-blue-100 text-blue-700"
                    : selection.mode === "repeat-item"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-gray-100 text-gray-600"
                }`}
                title={`Current mode: ${
                  selection.mode === "container"
                    ? "Container Mode"
                    : selection.mode === "repeat-item"
                    ? "Item Mode"
                    : "Text Mode"
                }`}
              >
                {selection.mode === "container"
                  ? "C"
                  : selection.mode === "repeat-item"
                  ? "I"
                  : "T"}
              </div>
              {(selection.selectedContainerId ||
                selection.selectedRepeatItemId) && (
                <button
                  onClick={handleContainerDeselect}
                  className="p-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                  title="Clear selection (ESC)"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
              <button
                onClick={undo}
                className="p-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors disabled:opacity-50"
                disabled={!pastStates || pastStates.length === 0}
                title={`Undo (${pastStates?.length || 0} available)`}
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                onClick={redo}
                className="p-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors disabled:opacity-50"
                disabled={!futureStates || futureStates.length === 0}
                title={`Redo (${futureStates?.length || 0} available)`}
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex justify-center items-start">
            <div
              className="bg-white rounded-lg shadow-lg border transition-all duration-300"
              style={{
                width: previewWidths[previewMode],
                maxWidth: "100%",
                minHeight:
                  previewMode === "mobile"
                    ? "667px"
                    : previewMode === "tablet"
                    ? "1024px"
                    : "600px",
              }}
              onClick={handleDocumentClick}
            >
              <div className="p-4 h-full overflow-y-auto">
                {parsedElements.map(renderElement)}
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <div className="text-xs text-gray-500">
              {previewWidths[previewMode]}
              {previewMode === "mobile" && " × 667px"}
              {previewMode === "tablet" && " × 1024px"}
            </div>
          </div>
        </div>

        {/* Resize Handle */}
        <div
          className={`w-1 bg-gray-300 hover:bg-blue-500 cursor-col-resize transition-colors duration-150 flex-shrink-0 ${
            isResizing ? "bg-blue-500" : ""
          }`}
          onMouseDown={handleMouseDown}
          title="Drag to resize panels"
        >
          <div className="w-full h-full relative">
            <div className="absolute inset-y-0 left-1/2 transform -translate-x-1/2 w-0.5 bg-white opacity-50"></div>
          </div>
        </div>

        {/* Right Panel - HTML Source */}
        <div
          className="bg-white border-l border-gray-200 flex flex-col"
          style={{ width: `${100 - leftPanelWidth}%` }}
        >
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Code2 className="w-5 h-5 text-gray-700" />
              <span className="text-sm text-gray-600">TailwindCSS HTML</span>
            </div>

            <button
              onClick={handleNewHTML}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors mb-4 flex items-center justify-center gap-2"
              title="Apply HTML changes"
            >
              <Eye className="w-4 h-4" />
              Apply
            </button>

            <div className="flex justify-between text-xs text-gray-500">
              <span>History: {pastStates?.length || 0}</span>
              <span>Future: {futureStates?.length || 0}</span>
            </div>
          </div>

          <div className="flex-1 p-4">
            <textarea
              value={htmlInput}
              onChange={(e) => setHtmlInput(e.target.value)}
              className="w-full h-full p-3 border border-gray-300 rounded-md font-mono text-xs resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your TailwindCSS HTML here..."
              spellCheck={false}
            />
          </div>

          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex items-center gap-2">
                <kbd className="bg-gray-100 px-1 rounded text-xs">ESC</kbd>
                <span>Deselect</span>
              </div>
              <div className="flex items-center gap-2">
                <Copy className="w-3 h-3" />
                <kbd className="bg-gray-100 px-1 rounded text-xs">⌘+C</kbd>
                <span>Copy</span>
              </div>
              <div className="flex items-center gap-2">
                <Scissors className="w-3 h-3" />
                <kbd className="bg-gray-100 px-1 rounded text-xs">⌘+X</kbd>
                <span>Cut</span>
              </div>
              <div className="flex items-center gap-2">
                <Clipboard className="w-3 h-3" />
                <kbd className="bg-gray-100 px-1 rounded text-xs">⌘+V</kbd>
                <span>Paste</span>
              </div>
              <div className="flex items-center gap-2">
                <Trash2 className="w-3 h-3" />
                <kbd className="bg-gray-100 px-1 rounded text-xs">Del</kbd>
                <span>Delete</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
