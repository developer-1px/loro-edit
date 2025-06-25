// src/plugins/link.tsx

import React from "react";
import type { Plugin } from "./types";
import type { RegularElement } from "../types";
import { parseBasicElement, createElementProps } from "./utils";
import { LinkFloatingUI } from "./link/LinkFloatingUI";

export const linkPlugin: Plugin = {
  name: "link",
  
  selectable: {
    enabled: true,
    name: "Link",
    color: "#3B82F6", // blue
    level: "content",
    elementType: "inline",
    priority: 5
  },

  floatingUI: {
    enabled: true,
    position: 'top',
    offset: 24,
    render: LinkFloatingUI
  },

  match: (element: Element) => 
    element.tagName.toLowerCase() === "a" && 
    !element.classList.contains("button"), // Don't match button-styled links

  parse: (element: Element) => parseBasicElement(element, "element"),

  render: ({ parsedElement, isSelected, renderElement }) => {
    const element = parsedElement as RegularElement;
    
    const handleClick = (e: React.MouseEvent) => {
      // Allow navigation for anchor links (starting with #)
      if (element.attributes?.href?.startsWith('#')) {
        // Let the browser handle anchor navigation
        return;
      }
      // For external links, open in new tab if ctrl/cmd is held
      if (e.metaKey || e.ctrlKey) {
        window.open(element.attributes?.href, '_blank');
      }
      e.preventDefault(); // Prevent navigation for regular clicks
    };
    
    return (
      <a
        {...createElementProps(element, isSelected)}
        href={element.attributes?.href || "#"}
        target={element.attributes?.target}
        rel={element.attributes?.rel}
        onClick={handleClick}
        style={{ 
          cursor: element.attributes?.href ? "pointer" : "default",
          textDecoration: element.attributes?.href ? "underline" : "none",
          color: element.attributes?.href ? "#3B82F6" : "inherit"
        }}
      >
        {element.children.map(renderElement)}
      </a>
    );
  },
};