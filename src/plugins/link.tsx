// src/plugins/link.tsx

import type { Plugin } from "./types";
import type { RegularElement } from "../types";
import { parseBasicElement, createElementProps } from "./utils";

export const linkPlugin: Plugin = {
  name: "link",
  
  selectable: {
    enabled: false, // 링크는 직접 선택하지 않고 하위 요소를 통해 편집
    name: "Link",
    color: "#3B82F6", // blue
    level: "content",
    elementType: "inline",
    priority: 8
  },

  // floatingUI 제거 - 하위 요소의 UI에서 처리

  match: (element: Element) => 
    element.tagName.toLowerCase() === "a" && 
    !element.classList.contains("button"), // Don't match button-styled links

  parse: (element: Element) => parseBasicElement(element, "element"),

  render: ({ parsedElement, isSelected, renderElement }) => {
    const element = parsedElement as RegularElement;
    
    return (
      <span
        {...createElementProps(element, isSelected)}
        data-href={element.attributes?.href || "#"}
        data-target={element.attributes?.target}
        data-rel={element.attributes?.rel}
        style={{ 
          cursor: "default", // Always use default cursor in editor
          textDecoration: element.attributes?.href ? "underline" : "none",
          color: element.attributes?.href ? "#3B82F6" : "inherit",
          display: "inline" // Ensure inline behavior
        }}
      >
        {element.children.map(renderElement)}
      </span>
    );
  },
};