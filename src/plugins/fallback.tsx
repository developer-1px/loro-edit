// src/plugins/fallback.tsx

import React from "react";
import type { Plugin } from "./types";
import type { RegularElement } from "../types";
import { parseBasicElement, createElementProps } from "./utils";
import { VOID_ELEMENTS } from "../utils/voidElements";

export const fallbackPlugin: Plugin = {
  name: "element",
  
  selectable: {
    enabled: false,
    name: "Element",
    color: "#6b7280",
    level: "element",
    elementType: "block",
    priority: 999
  },

  match: () => true, // Match everything as fallback

  parse: (element: Element) => parseBasicElement(element, "element"),

  render: ({ parsedElement, renderElement, isSelected }) => {
    const element = parsedElement as RegularElement;
    const Tag = element.tagName as keyof React.JSX.IntrinsicElements;
    const isVoidElement = VOID_ELEMENTS.has(element.tagName);
    
    return React.createElement(
      Tag,
      createElementProps(element, isSelected),
      isVoidElement ? undefined : element.children.map(renderElement)
    );
  },
};