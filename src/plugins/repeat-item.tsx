// src/plugins/repeat-item.tsx

import type { RepeatItemElement } from "../types";
import type { Plugin } from "./types";

export const repeatItemPlugin: Plugin = {
  name: "repeat-item",

  selectable: {
    enabled: true,
    name: "Repeat Item", 
    color: "#8b5cf6",
    level: "element",
    elementType: "block",
    priority: 1
  },

  match: (element: Element) => {
    // Match elements that have data-repeat-item attribute (from INITIAL_HTML)
    // or data-repeat-item-id attribute (from test HTML)
    return element.hasAttribute("data-repeat-item") || element.hasAttribute("data-repeat-item-id");
  },

  parse: (element: Element) => {
    // Get ID from either attribute
    const repeatItemId = crypto.randomUUID();
    
    return {
      type: "repeat-item" as const,
      id: repeatItemId,
      tagName: element.tagName.toLowerCase(),
      children: [], // Children will be handled by the parent parsing system
      attributes: Array.from(element.attributes).reduce((acc, attr) => {
        acc[attr.name] = attr.value;
        return acc;
      }, {} as Record<string, string>),
      repeatItem: repeatItemId,
    };
  },

  render: ({ parsedElement, renderElement }) => {
    const element = parsedElement as RepeatItemElement;

    return (
      <div
        key={element.id}
        data-element-id={element.id}
        className={element.attributes?.class || ""}
      >
        {element.children.map(renderElement)}
      </div>
    );
  },
};