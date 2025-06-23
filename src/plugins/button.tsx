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
    level: "element",
    elementType: "block",
    priority: 0,
    allowDeepSelection: true
  },

  match: (element: Element) => 
    element.tagName.toLowerCase() === "button" || 
    (element.tagName.toLowerCase() === "a" && element.classList.contains("button")),

  parse: (element: Element) => parseBasicElement(element, "element"),

  render: ({ parsedElement, isSelected, renderElement }) => {
    const element = parsedElement as RegularElement;
    const Tag = element.tagName as keyof React.JSX.IntrinsicElements;
    
    return React.createElement(
      Tag,
      {
        ...createElementProps(element, isSelected),
        href: element.tagName === "a" ? "#" : undefined,
        style: { 
          pointerEvents: isSelected ? "none" : "auto",
          cursor: isSelected ? "default" : "pointer"
        }
      },
      element.children.map(renderElement)
    );
  },
};