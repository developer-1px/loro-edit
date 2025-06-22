// src/plugins/repeat-container.tsx

import React from "react";
import type { RegularElement, RepeatContainer } from "../types";
import type { Plugin } from "./types";

interface RepeatableItemProps {
  item: RegularElement;
  containerId: string;
  children: React.ReactNode;
}

const RepeatableItem: React.FC<RepeatableItemProps> = ({
  item,
  containerId,
  children,
}) => (
  <div
    className="relative group cursor-pointer"
    data-repeat-item-id={item.id}
    data-repeat-container-id={containerId}
  >
    {children}
  </div>
);

interface RepeatableContainerProps {
  containerId: string;
  className?: string;
  items: RegularElement[];
  renderItem: (item: RegularElement) => React.ReactNode;
}

const RepeatableContainer: React.FC<RepeatableContainerProps> = ({
  containerId,
  className,
  items,
  renderItem,
}) => (
  <div className="relative">
    <div className={className}>
      {items.map((item) => (
        <RepeatableItem key={item.id} item={item} containerId={containerId}>
          {renderItem(item)}
        </RepeatableItem>
      ))}
    </div>
  </div>
);

export const repeatContainerPlugin: Plugin = {
  name: "repeat-container",
  version: "1.0.0",
  description: "Handles repeatable container elements with item management",

  selectable: {
    enabled: true,
    name: "Repeat Item",
    color: "#8b5cf6", // purple
    description: "Repeatable item within container",
    level: "item",
    elementType: "block",
  },

  match: (element: Element) => element.hasAttribute("data-repeat-container"),

  parse: (element: Element) => {
    const repeatAttribute = element.getAttribute("data-repeat-container");
    if (repeatAttribute) {
      // Parse repeat container items
      const items: RegularElement[] = [];
      // This would need proper implementation based on your HTML structure

      return {
        type: "repeat-container" as const,
        id: element.id || crypto.randomUUID(),
        tagName: element.tagName.toLowerCase(),
        repeatContainer: repeatAttribute,
        items: items,
        children: [], // Would be parsed from child elements
        attributes: Array.from(element.attributes).reduce((acc, attr) => {
          acc[attr.name] = attr.value;
          return acc;
        }, {} as Record<string, string>),
      };
    }
    return null;
  },

  render: ({ parsedElement, renderElement }) => {
    const repeatElement = parsedElement as RepeatContainer;

    return (
      <RepeatableContainer
        key={repeatElement.id}
        containerId={repeatElement.id}
        className={repeatElement.attributes?.class || ""}
        items={repeatElement.items}
        renderItem={renderElement}
      />
    );
  },
};
