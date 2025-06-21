// src/plugins/section.tsx

import React, { useState } from "react";
import type { Plugin } from "./types";
import type { RegularElement } from "../types";

interface SelectableContainerProps {
  element: RegularElement;
  isSelected: boolean;
  isInContainerMode: boolean;
  children: React.ReactNode;
}

const SelectableContainer: React.FC<SelectableContainerProps> = ({
  element,
  isSelected,
  isInContainerMode,
  children,
}) => {
  const [isHovered, setIsHovered] = useState(false);

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
    return element.tagName || "container";
  };

  return (
    <div
      className={getContainerStyles()}
      data-block-element-id={element.id}
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

      {/* Hover indicator in block mode */}
      {isInContainerMode && isHovered && !isSelected && (
        <div className="absolute -top-2 -left-2 bg-gray-500 text-white px-2 py-1 rounded text-xs font-medium shadow-md z-10">
          Click to select: {getElementName()}
        </div>
      )}
    </div>
  );
};

export const sectionPlugin: Plugin = {
  name: "section",
  version: "1.0.0",
  description:
    "Handles semantic section elements (section, header, footer, nav)",

  match: (element: Element) => {
    const tagName = element.tagName.toLowerCase();
    return ["section", "header", "footer", "nav"].includes(tagName);
  },

  parse: (element: Element) => {
    const tagName = element.tagName.toLowerCase();
    if (["section", "header", "footer", "nav"].includes(tagName)) {
      return {
        type: "element" as const,
        id: element.id || crypto.randomUUID(),
        className: element.className || "",
        tagName: tagName,
        children: [], // Would be parsed from child elements
        repeatItem: element.getAttribute("data-repeat-item") || undefined,
      };
    }
    return null;
  },

  render: ({ parsedElement, context, renderElement }) => {
    const sectionElement = parsedElement as RegularElement;
    const Tag = sectionElement.tagName as keyof React.JSX.IntrinsicElements;
    const isSelected = context.selection.selectedElementId === parsedElement.id;

    const regularElement = React.createElement(
      Tag,
      { key: sectionElement.id, className: sectionElement.className },
      (sectionElement.children || []).map(renderElement).filter(Boolean)
    );

    return (
      <SelectableContainer
        key={`selectable-${sectionElement.id}`}
        element={sectionElement}
        isSelected={isSelected}
        isInContainerMode={context.selection.mode === "block"}
      >
        {regularElement}
      </SelectableContainer>
    );
  },
};
