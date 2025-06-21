// src/plugins/text.tsx

import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Plugin } from './types';
import type { TextElement } from '../types';

interface EditableTextProps {
  text: string;
  onTextChange: (newText: string) => void;
  className?: string;
  elementId: string;
  isEditable?: boolean;
  showHoverEffects?: boolean;
  isTextMode?: boolean; // 텍스트 모드인지 여부
}

const EditableText: React.FC<EditableTextProps> = ({
  text,
  onTextChange,
  className,
  elementId,
  isEditable = true,
  showHoverEffects = false,
  isTextMode = false,
}) => {
  const [currentText, setCurrentText] = useState(text);
  const textRef = useRef<HTMLSpanElement>(null);
  const originalTextRef = useRef<string>(text);
  const isCommittingRef = useRef<boolean>(false);

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

  // Initialize contentEditable based on isEditable
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

  // Handle mousedown to enable contentEditable and focus without losing cursor position
  const handleMouseDown = useCallback((_e: React.MouseEvent) => {
    if (textRef.current && isTextMode) {
      // If not already editable, make it editable and focus
      if (textRef.current.contentEditable !== "plaintext-only") {
        textRef.current.contentEditable = "plaintext-only";
        // Don't preventDefault to preserve natural cursor positioning
        setTimeout(() => {
          if (textRef.current) {
            textRef.current.focus();
          }
        }, 0);
      }
    }
  }, [isTextMode]);

  const getTextStyles = () => {
    const baseStyles = `${className} rounded px-1 transition-all duration-200 inline-block min-w-[20px] min-h-[1em]`;

    // 텍스트 모드에서는 편집 가능하지 않아도 cursor-text 적용
    const cursorStyle = (isTextMode || isEditable) ? 'cursor-text' : 'cursor-default';
    
    if (!isEditable) {
      return `${baseStyles} ${cursorStyle}`;
    }

    let editableStyles = `${baseStyles} ${cursorStyle} focus:outline-none focus:ring-1 focus:ring-blue-400`;

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
      onMouseDown={handleMouseDown}
      className={getTextStyles()}
      data-text-element-id={elementId}
    >
      {renderTextWithLineBreaks(currentText)}
    </span>
  );
};

export const textPlugin: Plugin = {
  name: 'text',
  version: '1.0.0',
  description: 'Handles text elements with inline editing capabilities',
  
  match: {
    condition: (element) => element.type === 'text',
    priority: 100
  },

  parse: (element: Element) => {
    if (element.nodeType === Node.TEXT_NODE || element.tagName === 'SPAN') {
      return {
        type: 'text' as const,
        id: crypto.randomUUID(),
        content: element.textContent || ''
      };
    }
    return null;
  },

  render: ({ element, context, canEditText, showHoverEffects }) => {
    const textElement = element as TextElement;
    
    return (
      <EditableText
        key={textElement.id}
        elementId={textElement.id}
        text={textElement.content}
        onTextChange={(newText) => context.handleTextChange(textElement.id, newText)}
        isEditable={canEditText}
        showHoverEffects={showHoverEffects}
        isTextMode={context.selection.mode === 'text'}
      />
    );
  }
};