import React from "react";
import type { Plugin } from "./types";
import type { RegularElement } from "../types";
import { parseBasicElement, createElementProps } from "./utils";
import { log } from "../utils/logger";

export const paragraphPlugin: Plugin = {
  name: "paragraph",
  
  selectable: {
    enabled: true,
    name: "Paragraph",
    color: "#10b981",
    level: "content", 
    elementType: "block",
    priority: 10
  },

  floatingUI: {
    enabled: false,
    position: 'top',
    offset: 8,
    render: () => null
  },

  match: (element: Element) => {
    return element.tagName.toLowerCase() === 'p';
  },

  parse: (element: Element) => {
    if (element.tagName.toLowerCase() === 'p') {
      return parseBasicElement(element, "element");
    }
    return null;
  },

  render: ({ parsedElement, renderElement, isSelected }) => {
    const element = parsedElement as RegularElement;
    
    log.plugin('debug', `Rendering paragraph with ID: ${element.id}`, {
      element,
      isSelected,
      childrenCount: element.children?.length || 0
    });
    
    const props = createElementProps(element, isSelected);
    log.render('debug', `Paragraph props created`, { elementId: element.id, props });
    
    const renderedChildren = element.children.map((child) => {
      log.render('debug', `Rendering paragraph child`, { childId: child.id, childType: child.type });
      // Let the plugin system handle child rendering properly
      return renderElement ? renderElement(child) : null;
    });
    
    log.render('debug', `Paragraph rendering complete`, { elementId: element.id, childrenRendered: renderedChildren.length });
    
    return React.createElement(
      'p',
      props,
      renderedChildren
    );
  },
};