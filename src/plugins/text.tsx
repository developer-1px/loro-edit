import React, { useState, useRef, useEffect, memo } from "react";
import type { Plugin } from "./types";
import type { TextElement } from "../types";
import { useEditorStore } from "../store/editorStore";

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
  const [currentText, setCurrentText] = useState(text || "");
  const [isEditing, setIsEditing] = useState(false);
  const textRef = useRef<HTMLSpanElement>(null);
  const isCommittingRef = useRef<boolean>(false);
  const originalTextRef = useRef<string>(text || "");
  // Text editing now uses history feature directly - will be updated in the calling component
  const isTextMode = useEditorStore((state) => state.selection.mode === "text");

  useEffect(() => {
    // Only update from props if we're not actively editing or committing
    if (!isCommittingRef.current && !isEditing && !textRef.current?.matches(':focus')) {
      setCurrentText(text || "");
      originalTextRef.current = text || "";
    }
  }, [text, isEditing]);

  useEffect(() => {
    if (textRef.current) {
      textRef.current.contentEditable = isEditable ? "plaintext-only" : "false";
    }
  }, [isEditable]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isCommittingRef.current = false;
    };
  }, []);

  const handleBlur = () => {
    if (textRef.current && !isCommittingRef.current) {
      isCommittingRef.current = true;
      setIsEditing(false);
      
      let newText = textRef.current.textContent || "";
      newText = newText.replace(/\n/g, "<br/>");
      
      // Always update local state first
      setCurrentText(newText);
      
      // Compare with the original text from props, not the processed version
      if (newText !== text && onTextChange) {
        // Delay the state update to avoid conflicts with blur handling
        requestAnimationFrame(() => {
          onTextChange(elementId, newText);
        });
      }
      
      setTimeout(() => {
        isCommittingRef.current = false;
      }, 100);
    }
  };

  const handleFocus = () => {
    if (textRef.current && isEditable) {
      // Store the current value before editing
      originalTextRef.current = currentText;
      setIsEditing(true);
      
      // Ensure the content is editable text
      const editableText = currentText.replace(/<br\s*\/?>/gi, "\n");
      if (textRef.current.textContent !== editableText) {
        textRef.current.textContent = editableText;
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      // Restore original text on escape
      if (textRef.current) {
        isCommittingRef.current = true;
        textRef.current.textContent = originalTextRef.current.replace(/<br\s*\/?>/gi, "\n");
        setCurrentText(originalTextRef.current);
        textRef.current.blur();
        setTimeout(() => {
          isCommittingRef.current = false;
        }, 100);
      }
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
    
    // Use stable keys based on elementId and index to prevent React DOM errors
    return parts.map((part, index) => (
      <React.Fragment key={`${elementId}-text-part-${index}`}>
        {part || "\u00A0"}
        {index < parts.length - 1 && <br key={`${elementId}-br-${index}`} />}
      </React.Fragment>
    ));
  };

  const getTextStyles = () => {
    const baseStyles = `${className || ''} inline-block min-w-[20px] min-h-[1em] relative z-10`;
    const cursorStyle = isTextMode || isEditable ? "cursor-text" : "cursor-default";
    
    if (!isEditable) {
      return `${baseStyles} ${cursorStyle}`;
    }
    
    return `${baseStyles} ${cursorStyle} outline-none`;
  };

  // When editing, don't render React children to avoid DOM conflicts
  return (
    <span
      ref={textRef}
      contentEditable={isEditable ? "plaintext-only" : false}
      suppressContentEditableWarning
      onFocus={isEditable ? handleFocus : undefined}
      onBlur={isEditable ? handleBlur : undefined}
      onKeyDown={isEditable ? handleKeyDown : undefined}
      onMouseDown={handleMouseDown}
      className={getTextStyles()}
      data-element-id={elementId}
      data-text-content={currentText} // Store current text in data attribute for debugging
      style={{
        position: 'relative',
        zIndex: 1,
        display: 'inline-block',
        outline: "none",
        minHeight: '1em',
        minWidth: '1px'
      }}
    >
      {!isEditing && !isEditable && renderTextWithLineBreaks(currentText)}
      {!isEditing && isEditable && (currentText || "\u00A0")}
    </span>
  );
}, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  return (
    prevProps.text === nextProps.text &&
    prevProps.elementId === nextProps.elementId &&
    prevProps.isEditable === nextProps.isEditable &&
    prevProps.className === nextProps.className &&
    prevProps.onTextChange === nextProps.onTextChange
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

