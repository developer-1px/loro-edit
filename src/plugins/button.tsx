// src/plugins/button.tsx

import React from "react";
import type { Plugin } from "./types";
import type { RegularElement } from "../types";
import { parseBasicElement, createElementProps } from "./utils";

export const buttonPlugin: Plugin = {
  name: "button",
  
  selectable: {
    enabled: true,
    name: "Button",
    color: "#3B82F6",
    level: "content",
    elementType: "block",
    priority: 10,
    allowDeepSelection: true
  },

  match: (element: Element) => 
    element.tagName.toLowerCase() === "button" || 
    (element.tagName.toLowerCase() === "a" && element.classList.contains("button")),

  parse: (element: Element) => parseBasicElement(element, "element"),

  render: ({ parsedElement, isSelected, renderElement }) => {
    const element = parsedElement as RegularElement;
    const Tag = element.tagName as keyof React.JSX.IntrinsicElements;
    
    const handleClick = (e: React.MouseEvent) => {
      // Prevent default button/link behavior but allow event bubbling for selection
      e.preventDefault();
      // Don't stopPropagation - let parent handle selection
    };
    
    return React.createElement(
      Tag,
      {
        ...createElementProps(element, isSelected),
        href: element.tagName === "a" ? "#" : undefined,
        onClick: handleClick,
        onSubmit: element.tagName === "button" ? (e: React.FormEvent) => e.preventDefault() : undefined,
        type: element.tagName === "button" ? "button" : undefined, // Prevent form submission
        style: { 
          cursor: "default"
        }
      },
      element.children.map(renderElement)
    );
  },
};