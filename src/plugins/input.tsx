// src/plugins/input.tsx

import React from "react";
import type { Plugin } from "./types";
import type { RegularElement } from "../types";
import { parseBasicElement, createElementProps } from "./utils";

export const inputPlugin: Plugin = {
  name: "input",
  
  selectable: {
    enabled: true,
    name: "Input",
    color: "#F59E0B", // amber
    level: "element",
    elementType: "inline",
    priority: 0
  },

  match: (element: Element) => 
    element.tagName.toLowerCase() === "input" ||
    element.tagName.toLowerCase() === "textarea" ||
    element.tagName.toLowerCase() === "select",

  parse: (element: Element) => parseBasicElement(element, "element"),

  render: ({ parsedElement, isSelected }) => {
    const element = parsedElement as RegularElement;
    const Tag = element.tagName as keyof React.JSX.IntrinsicElements;
    
    return React.createElement(Tag, {
      ...createElementProps(element, isSelected),
      readOnly: true, // Prevent editing
      disabled: false, // Keep enabled for selection
      style: {
        cursor: "default",
        pointerEvents: "auto"
      }
    });
  },
};