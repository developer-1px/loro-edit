// src/plugins/section.tsx

import React from "react";
import type { Plugin } from "./types";
import type { RegularElement } from "../types";

export const sectionPlugin: Plugin = {
  name: "section",
  version: "1.0.0",
  description:
    "Handles semantic section elements (section, header, footer, nav)",

  selectable: {
    enabled: true,
    name: "Section",
    color: "#3b82f6", // blue
    description: "Semantic section element",
    level: "element",
    elementType: "block",
  },

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
        tagName: tagName,
        children: [], // Would be parsed from child elements
        repeatItem: element.getAttribute("data-repeat-item") || undefined,
        attributes: Array.from(element.attributes).reduce((acc, attr) => {
          acc[attr.name] = attr.value;
          return acc;
        }, {} as Record<string, string>),
      };
    }
    return null;
  },

  render: ({ parsedElement, renderElement }) => {
    const sectionElement = parsedElement as RegularElement;
    const Tag = sectionElement.tagName as keyof React.JSX.IntrinsicElements;

    return React.createElement(
      Tag,
      { 
        key: sectionElement.id, 
        className: sectionElement.attributes?.class || "",
        'data-element-id': sectionElement.id,
      },
      (sectionElement.children || []).map(renderElement).filter(Boolean)
    );
  },
};
