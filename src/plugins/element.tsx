// src/plugins/element.tsx

import React from "react";
import type { Plugin } from "./types";
import type { RegularElement } from "../types";

export const elementPlugin: Plugin = {
  name: "element",
  version: "1.0.0",
  description:
    "Handles generic HTML elements that are not handled by other plugins",

  selectable: {
    enabled: false,
    name: "Element",
    color: "#6b7280", // gray
    description: "Generic HTML element",
    level: "element",
  },

  match: (element: Element) => {
    // Do not match elements that are explicitly text
    if (element.getAttribute("data-element-type") === "text") {
      return false;
    }

    // Handle generic HTML elements that don't have special attributes
    const hasSpecialAttributes =
      element.hasAttribute("data-repeat-container") ||
      element.hasAttribute("data-repeat-item") ||
      element.hasAttribute("data-database") ||
      element.tagName.toLowerCase() === "img" ||
      element.tagName.toLowerCase() === "picture";

    return !hasSpecialAttributes;
  },

  parse: (element: Element) => {
    // Parse generic HTML elements
    return {
      type: "element" as const,
      id: element.id || crypto.randomUUID(),
      className: element.className || "",
      tagName: element.tagName.toLowerCase(),
      children: [], // Will be filled by htmlParser
      repeatItem: element.getAttribute("data-repeat-item") || undefined,
    };
  },

  render: ({ parsedElement, renderElement }) => {
    const regularElement = parsedElement as RegularElement;
    const Tag = regularElement.tagName as keyof React.JSX.IntrinsicElements;

    return React.createElement(
      Tag,
      {
        key: regularElement.id,
        className: regularElement.className,
        "data-block-element-id": regularElement.id,
      },
      (regularElement.children || []).map(renderElement).filter(Boolean)
    );
  },
};
