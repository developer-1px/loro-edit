// src/plugins/section.tsx

import React from "react";
import type { Plugin } from "./types";
import type { RegularElement } from "../types";
import { parseBasicElement, createElementProps } from "./utils";
import { SectionClipboardHandler } from "../features/clipboard/handlers/SectionClipboardHandler";

export const sectionPlugin: Plugin = {
  name: "section",
  
  selectable: {
    enabled: true,
    name: "Section",
    color: "#3b82f6",
    level: "container",
    elementType: "block",
    priority: 0,
    allowDeepSelection: true
  },

  match: (element: Element) => 
    ["section", "header", "footer", "nav"].includes(element.tagName.toLowerCase()),

  parse: (element: Element) => parseBasicElement(element, "element"),

  render: ({ parsedElement, renderElement, isSelected }) => {
    const element = parsedElement as RegularElement;
    const Tag = element.tagName as keyof React.JSX.IntrinsicElements;
    
    // Handle text elements that somehow end up here
    if (!element.children) {
      console.error('Section plugin got element without children:', element);
      return null;
    }
    
    return React.createElement(
      Tag,
      createElementProps(element, isSelected),
      element.children.map(renderElement)
    );
  },
  
  clipboardHandler: new SectionClipboardHandler()
};
