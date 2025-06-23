// src/plugins/repeat-item.tsx

import React from "react";
import type { RegularElement } from "../types";
import type { Plugin } from "./types";

export const repeatItemPlugin: Plugin = {
  name: "repeat-item",
  version: "1.0.0",
  description: "Handles individual repeatable items for selection and editing",

  selectable: {
    enabled: true,
    name: "Repeat Item", 
    color: "#8b5cf6", // purple
    description: "Individual repeatable item",
    level: "item",
    elementType: "block",
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
      type: "element" as const,
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

  render: ({ parsedElement, renderElement, context }) => {
    const element = parsedElement as RegularElement;
    const isSelected = context.selection.selectedElementId === element.id;
    
    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      context.setSelection({
        mode: "block",
        selectedElementId: element.id,
      });
    };

    return (
      <div
        key={element.id}
        data-element-id={element.id}
        className={`
          ${element.attributes?.class || ""}
          ${isSelected 
            ? "ring-2 ring-purple-500 ring-offset-2 bg-purple-50/50" 
            : "hover:ring-1 hover:ring-purple-300 hover:bg-purple-50/30"
          }
          relative cursor-pointer transition-all duration-200
        `}
        onClick={handleClick}
      >
        {element.children.map(renderElement)}
        {isSelected && (
          <div className="absolute -top-6 left-0 bg-purple-500 text-white text-xs px-2 py-1 rounded text-nowrap pointer-events-none z-10">
            Repeat Item
          </div>
        )}
      </div>
    );
  },
};