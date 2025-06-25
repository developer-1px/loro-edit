import React, { useRef, memo } from "react";
import type { Plugin } from "./types";
import type { TextElement } from "../types";
import { useEditorStore } from "../store/editorStore";
import { TextFloatingUI } from "./text/TextFloatingUI";

interface EditableTextProps {
  text: string;
  className?: string;
  elementId: string;
  isEditable?: boolean;
  onTextChange?: (elementId: string, newText: string) => void;
}

const EditableText: React.FC<EditableTextProps> = memo(({
  text,
  className,
  elementId,
  isEditable = false,
  onTextChange,
}) => {
  const textRef = useRef<HTMLSpanElement>(null);
  const isTextMode = useEditorStore((state) => state.selection.mode === "text");

  const handleBlur = () => {
    if (textRef.current) {
      const newText = textRef.current.textContent || "";
      if (newText !== text && onTextChange) {
        onTextChange(elementId, newText);
      }
    }
  };

  const handleFocus = () => {
    if (textRef.current && isEditable && !text) {
      // Clear placeholder text when focusing on empty field
      textRef.current.textContent = "";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && textRef.current) {
      textRef.current.blur();
    }
  };

  const handleMouseDown = () => {
    if (textRef.current && isTextMode && textRef.current.contentEditable !== "plaintext-only") {
      textRef.current.contentEditable = "plaintext-only";
      setTimeout(() => textRef.current?.focus(), 0);
    }
  };


  const isEmpty = !text;
  const isPlaceholder = isEmpty && !isEditable;

  const handleInput = () => {
    // No need for special handling
  };

  return (
    <span
      ref={textRef}
      contentEditable={isEditable ? "plaintext-only" : false}
      suppressContentEditableWarning
      onFocus={isEditable ? handleFocus : undefined}
      onBlur={isEditable ? handleBlur : undefined}
      onKeyDown={isEditable ? handleKeyDown : undefined}
      onInput={isEditable ? handleInput : undefined}
      onMouseDown={handleMouseDown}
      className={`${className || ''} inline-block min-w-[20px] min-h-[1em] ${
        isTextMode || isEditable ? "cursor-text" : "cursor-default"
      } ${isEmpty && isEditable ? "opacity-50" : ""} outline-none`}
      data-element-id={elementId}
      style={{
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        minHeight: '1.5em',
        position: 'relative',
        color: isPlaceholder ? '#9ca3af' : undefined
      }}
    >
      {isEmpty && isEditable ? "Type text here..." : (text || "Type text here...")}
    </span>
  );
});

export const textPlugin: Plugin = {
  name: "text",

  selectable: {
    enabled: true,
    name: "Text",
    color: "#10b981",
    level: "content",
    elementType: "inline",
    priority: 0
  },

  floatingUI: {
    enabled: true,
    position: 'top',
    offset: 24,
    render: TextFloatingUI
  },

  match: (element: Element) => {
    // Text plugin handles elements explicitly marked as text
    // Note: This is primarily for DOM-based matching, but text elements
    // from parsed HTML are handled directly by PluginManager
    return element.getAttribute("data-element-type") === "text";
  },

  parse: (element: Element) => {
    if (element.getAttribute("data-element-type") === "text") {
      return {
        type: "text" as const,
        id: element.id || crypto.randomUUID(),
        content: element.textContent || "",
      };
    }
    return null;
  },

  render: ({ parsedElement, canEditText, context }) => {
    const textElement = parsedElement as TextElement;
    return (
      <EditableText
        key={textElement.id}
        elementId={textElement.id}
        text={textElement.content}
        isEditable={canEditText}
        onTextChange={context.onTextChange}
      />
    );
  },
};

