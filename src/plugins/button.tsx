// src/plugins/button.tsx

import React from "react";
import type { Plugin } from "./types";
import type { RegularElement } from "../types";
import { parseBasicElement, createElementProps } from "./utils";
import { ButtonFloatingUI } from "./button/ButtonFloatingUI";

interface ButtonProps {
  element: RegularElement;
  isSelected: boolean;
  renderElement: (element: any) => React.ReactNode;
}

const ButtonComponent: React.FC<ButtonProps> = ({ element, isSelected, renderElement }) => {
  const Tag = element.tagName as keyof React.JSX.IntrinsicElements;
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
  };
  
  const actionType = element.attributes?.['data-action-type'] || 'onClick';
  const linkUrl = element.attributes?.['data-link-url'] || '';
  
  return (
    React.createElement(
      Tag,
      {
        ...createElementProps(element, isSelected),
        href: element.tagName === "a" ? "#" : undefined,
        onClick: handleClick,
        onSubmit: element.tagName === "button" ? (e: React.FormEvent) => e.preventDefault() : undefined,
        type: element.tagName === "button" ? "button" : undefined,
        style: { 
          cursor: "default"
        },
        title: actionType === 'linkTo' && linkUrl ? linkUrl : undefined
      },
      element.children.map(renderElement)
    )
  );
};

export const buttonPlugin: Plugin = {
  name: "button",
  
  selectable: {
    enabled: true,
    name: "Button",
    color: "#3B82F6",
    level: "content",
    elementType: "block",
    priority: 10,
    allowDeepSelection: true
  },

  floatingUI: {
    enabled: true,
    position: 'top',
    offset: 64,
    render: ButtonFloatingUI
  },

  match: (element: Element) => 
    element.tagName.toLowerCase() === "button" || 
    (element.tagName.toLowerCase() === "a" && element.classList.contains("button")),

  parse: (element: Element) => parseBasicElement(element, "element"),

  render: ({ parsedElement, isSelected, renderElement }) => {
    const element = parsedElement as RegularElement;
    return (
      <ButtonComponent
        element={element}
        isSelected={isSelected || false}
        renderElement={renderElement}
      />
    );
  },
};