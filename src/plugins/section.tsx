// src/plugins/section.tsx

import React, { useState } from 'react';
import type { Plugin } from './types';
import type { RegularElement } from '../types';

interface SelectableContainerProps {
  element: any;
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
      data-container-type="regular"
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

export const sectionPlugin: Plugin = {
  name: 'section',
  version: '1.0.0',
  description: 'Handles semantic section elements (section, header, footer, nav)',
  
  match: {
    condition: (element) => {
      return element.type === 'element' && 
        'tagName' in element &&
        typeof element.tagName === 'string' &&
        ['section', 'header', 'footer', 'nav'].includes(element.tagName);
    },
    priority: 70
  },

  parse: (element: Element) => {
    const tagName = element.tagName.toLowerCase();
    if (['section', 'header', 'footer', 'nav'].includes(tagName)) {
      return {
        type: 'element' as const,
        id: element.id || crypto.randomUUID(),
        className: element.className || '',
        tagName: tagName,
        children: [], // Would be parsed from child elements
        repeatItem: element.getAttribute('data-repeat-item') || undefined
      };
    }
    return null;
  },

  render: ({ element, context, renderElement }) => {
    const sectionElement = element as RegularElement;
    const Tag = sectionElement.tagName as keyof React.JSX.IntrinsicElements;
    const isSelected = context.selection.selectedContainerId === element.id;
    
    const regularElement = React.createElement(
      Tag,
      { key: sectionElement.id, className: sectionElement.className },
      sectionElement.children.map(renderElement)
    );

    return (
      <SelectableContainer
        key={`selectable-${sectionElement.id}`}
        element={sectionElement}
        isSelected={isSelected}
        isInContainerMode={context.selection.mode === "container"}
      >
        {regularElement}
      </SelectableContainer>
    );
  }
};