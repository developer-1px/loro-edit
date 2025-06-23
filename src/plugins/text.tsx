import React, { useState, useRef, useEffect } from "react";
import type { Plugin } from "./types";
import type { TextElement } from "../types";
import { useEditorStore } from "../store/editorStore";

interface EditableTextProps {
  text: string;
  className?: string;
  elementId: string;
  isEditable?: boolean;
}

const EditableText: React.FC<EditableTextProps> = ({
  text,
  className,
  elementId,
  isEditable = false,
}) => {
  const [currentText, setCurrentText] = useState(text || "");
  const textRef = useRef<HTMLSpanElement>(null);
  const isCommittingRef = useRef<boolean>(false);
  const updateElement = useEditorStore((state) => state.updateElement);
  const isTextMode = useEditorStore((state) => state.selection.mode === "text");

  useEffect(() => {
    if (!isCommittingRef.current) {
      setCurrentText(text || "");
      if (textRef.current) {
        const editableText = (text || "").replace(/<br\s*\/?>/gi, "\n");
        textRef.current.textContent = editableText;
      }
    }
  }, [text]);

  useEffect(() => {
    if (textRef.current) {
      textRef.current.contentEditable = isEditable ? "plaintext-only" : "false";
    }
  }, [isEditable]);

  const handleBlur = () => {
    if (textRef.current && !isCommittingRef.current) {
      isCommittingRef.current = true;
      
      let newText = textRef.current.textContent || "";
      newText = newText.replace(/\n/g, "<br/>");
      setCurrentText(newText);
      
      const originalHtml = text.replace(/\n/g, "<br/>");
      if (newText !== originalHtml) {
        updateElement(elementId, { content: newText });
      }
      
      setTimeout(() => {
        isCommittingRef.current = false;
      }, 100);
    }
  };

  const handleFocus = () => {
    if (textRef.current && isEditable) {
      const editableText = (currentText || "").replace(/<br\s*\/?>/gi, "\n");
      textRef.current.textContent = editableText;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      textRef.current?.blur();
    }
  };

  const handleMouseDown = () => {
    if (textRef.current && isTextMode) {
      if (textRef.current.contentEditable !== "plaintext-only") {
        textRef.current.contentEditable = "plaintext-only";
        setTimeout(() => {
          if (textRef.current) {
            textRef.current.focus();
          }
        }, 0);
      }
    }
  };


  // Render text with line breaks for display
  const renderTextWithLineBreaks = (text: string) => {
    if (!text || text === "\u00A0") return "\u00A0";
    
    const parts = text.split(/<br\s*\/?>/gi);
    if (parts.length === 1) return text;
    
    return parts.map((part, index) => (
      <React.Fragment key={index}>
        {part}
        {index < parts.length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const getTextStyles = () => {
    const baseStyles = `${className || ''} inline-block min-w-[20px] min-h-[1em]`;
    const cursorStyle = isTextMode || isEditable ? "cursor-text" : "cursor-default";
    
    if (!isEditable) {
      return `${baseStyles} ${cursorStyle}`;
    }
    
    return `${baseStyles} ${cursorStyle} outline-none`;
  };

  return (
    <span
      ref={textRef}
      contentEditable={isEditable ? "plaintext-only" : "false"}
      suppressContentEditableWarning
      onFocus={isEditable ? handleFocus : undefined}
      onBlur={isEditable ? handleBlur : undefined}
      onKeyDown={isEditable ? handleKeyDown : undefined}
      onMouseDown={handleMouseDown}
      className={getTextStyles()}
      data-element-id={elementId}
    >
      {renderTextWithLineBreaks(currentText)}
    </span>
  );
};

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

  match: (element: Element) => {
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

  render: ({ parsedElement, canEditText }) => {
    const textElement = parsedElement as TextElement;
    return (
      <EditableText
        key={textElement.id}
        elementId={textElement.id}
        text={textElement.content}
        isEditable={canEditText}
      />
    );
  },
};

