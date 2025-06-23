import React, { useState, useRef, useEffect } from "react";
import type { Plugin } from "./types";
import type { TextElement } from "../types";
import { useEditorStore } from "../store/editorStore";

interface EditableTextProps {
  text: string;
  elementId: string;
  isEditable?: boolean;
}

const EditableText: React.FC<EditableTextProps> = ({
  text,
  elementId,
  isEditable = false,
}) => {
  const [currentText, setCurrentText] = useState(text || "");
  const textRef = useRef<HTMLSpanElement>(null);
  const updateElement = useEditorStore((state) => state.updateElement);

  useEffect(() => {
    setCurrentText(text || "");
  }, [text]);

  const handleBlur = () => {
    if (textRef.current) {
      const newText = textRef.current.textContent || "";
      if (newText !== text) {
        updateElement(elementId, { content: newText });
      }
    }
  };


  return (
    <span
      ref={textRef}
      contentEditable={isEditable}
      suppressContentEditableWarning
      onBlur={isEditable ? handleBlur : undefined}
      className={`inline-block min-w-[20px] min-h-[1em] ${isEditable ? 'cursor-text outline-none' : 'cursor-default'}`}
      data-element-id={elementId}
    >
      {currentText || "\u00A0"}
    </span>
  );
};

export const textPlugin: Plugin = {
  name: "text",
  version: "1.0.0",
  description: "Text elements with inline editing",

  selectable: {
    enabled: true,
    name: "Text",
    color: "#10b981",
    description: "Editable text",
    level: "element",
    elementType: "inline",
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
        elementId={textElement.id}
        text={textElement.content}
        isEditable={canEditText}
      />
    );
  },
};

