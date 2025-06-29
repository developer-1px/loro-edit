// src/plugins/form.tsx

import type { Plugin } from "./types";
import type { RegularElement } from "../types";
import { parseBasicElement, createElementProps } from "./utils";
import { FormFloatingUI } from "./form/FormFloatingUI";

export const formPlugin: Plugin = {
  name: "form",
  
  selectable: {
    enabled: true,
    name: "Form",
    color: "#10B981", // green
    level: "container",
    elementType: "block",
    priority: 0
  },

  floatingUI: {
    enabled: true,
    position: 'top',
    offset: 8,
    render: FormFloatingUI
  },

  match: (element: Element) => element.tagName.toLowerCase() === "form",

  parse: (element: Element) => parseBasicElement(element, "element"),

  render: ({ parsedElement, isSelected, renderElement }) => {
    const element = parsedElement as RegularElement;
    
    return (
      <form
        {...createElementProps(element, isSelected)}
        onSubmit={(e) => e.preventDefault()}
      >
        {element.children.map(renderElement)}
      </form>
    );
  },
};