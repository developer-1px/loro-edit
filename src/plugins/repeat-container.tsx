// src/plugins/repeat-container.tsx

import React, { useState } from "react";
import { Plus } from "lucide-react";
import type { Plugin } from "./types";
import type { RepeatContainer, RegularElement } from "../types";

interface RepeatableItemProps {
  item: RegularElement;
  containerId: string;
  isSelected: boolean;
  children: React.ReactNode;
  showHoverEffects?: boolean;
}

const RepeatableItem: React.FC<RepeatableItemProps> = ({
  item,
  containerId,
  isSelected,
  children,
  showHoverEffects = false,
}) => {
  const getItemStyles = () => {
    const baseStyles =
      "relative group cursor-pointer transition-all duration-200";

    if (isSelected) {
      return `${baseStyles} ring-2 ring-purple-500`;
    }

    let hoverStyles = `${baseStyles} hover:ring-1 hover:ring-purple-300`;

    if (showHoverEffects) {
      hoverStyles += ` hover:bg-purple-50`;
    }

    return hoverStyles;
  };

  return (
    <div
      className={getItemStyles()}
      data-repeat-item-id={item.id}
      data-repeat-container-id={containerId}
    >
      {children}

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute -top-2 -left-2 bg-purple-500 text-white px-2 py-1 rounded text-xs font-medium shadow-md z-20">
          Selected Item
        </div>
      )}
    </div>
  );
};

interface RepeatableContainerProps {
  containerId: string;
  containerName: string;
  className?: string;
  items: RegularElement[];
  selectedItemId: string | null;
  onItemAdd: (containerId: string) => void;
  renderItem: (item: any) => React.ReactNode;
  showHoverEffects?: boolean;
}

const RepeatableContainer: React.FC<RepeatableContainerProps> = ({
  containerId,
  containerName,
  className,
  items,
  selectedItemId,
  onItemAdd,
  renderItem,
  showHoverEffects = false,
}) => {
  const [showAddButton, setShowAddButton] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowAddButton(true)}
      onMouseLeave={() => setShowAddButton(false)}
    >
      <div className={className}>
        {items.map((item) => (
          <RepeatableItem
            key={item.id}
            item={item}
            containerId={containerId}
            isSelected={selectedItemId === item.id}
            showHoverEffects={showHoverEffects}
          >
            {renderItem(item)}
          </RepeatableItem>
        ))}
      </div>

      {showAddButton && (
        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
          <button
            onClick={() => onItemAdd(containerId)}
            className="bg-green-500 text-white px-3 py-1 rounded-full text-sm hover:bg-green-600 shadow-lg flex items-center gap-1"
            title={`Add new ${containerName}`}
          >
            <Plus className="w-3 h-3" />
            Add {containerName}
          </button>
        </div>
      )}
    </div>
  );
};

interface SelectableContainerProps {
  element: any;
  isSelected: boolean;
  isInContainerMode: boolean;
  children: React.ReactNode;
}

const SelectableContainer: React.FC<SelectableContainerProps> = ({
  element,
  isSelected,
  isInContainerMode,
  children,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getContainerStyles = () => {
    const baseStyles = "relative transition-all duration-200";

    if (isSelected) {
      return `${baseStyles} ring-2 ring-blue-500`;
    }

    if (isInContainerMode && isHovered) {
      return `${baseStyles} ring-1 ring-blue-300 bg-blue-50 bg-opacity-30 cursor-pointer`;
    }

    return baseStyles;
  };

  const getElementName = () => {
    if (element.type === "repeat-container") {
      return element.repeatContainer;
    }
    if (
      element.type === "element" ||
      element.type === "img" ||
      element.type === "picture"
    ) {
      return element.tagName;
    }
    return "container";
  };

  return (
    <div
      className={getContainerStyles()}
      data-container-id={element.id}
      data-container-type={
        element.type === "repeat-container" ? "repeat-container" : "regular"
      }
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute -top-2 -left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium shadow-md z-10">
          Selected: {getElementName()}
        </div>
      )}

      {/* Hover indicator in container mode */}
      {isInContainerMode && isHovered && !isSelected && (
        <div className="absolute -top-2 -left-2 bg-gray-500 text-white px-2 py-1 rounded text-xs font-medium shadow-md z-10">
          Click to select: {getElementName()}
        </div>
      )}
    </div>
  );
};

export const repeatContainerPlugin: Plugin = {
  name: "repeat-container",
  version: "1.0.0",
  description: "Handles repeatable container elements with item management",

  match: {
    condition: (element) => element.type === "repeat-container",
    priority: 80,
  },

  parse: (element: Element) => {
    const repeatAttribute = element.getAttribute("data-repeat-container");
    if (repeatAttribute) {
      // Parse repeat container items
      const items: RegularElement[] = [];
      // This would need proper implementation based on your HTML structure

      return {
        type: "repeat-container" as const,
        id: element.id || crypto.randomUUID(),
        className: element.className || "",
        tagName: element.tagName.toLowerCase(),
        repeatContainer: repeatAttribute,
        items: items,
        children: [], // Would be parsed from child elements
      };
    }
    return null;
  },

  render: ({ element, context, renderElement, showHoverEffects }) => {
    const repeatElement = element as RepeatContainer;
    const isSelected = context.selection.selectedElementId === element.id;
    const selectedItemId: string | null = null; // Simplified for new selection logic

    const repeatContainer = (
      <RepeatableContainer
        key={repeatElement.id}
        containerId={repeatElement.id}
        containerName={repeatElement.repeatContainer}
        className={repeatElement.className}
        items={repeatElement.items}
        selectedItemId={selectedItemId}
        onItemAdd={context.handleItemAdd}
        renderItem={renderElement}
        showHoverEffects={showHoverEffects}
      />
    );

    return (
      <SelectableContainer
        key={`selectable-${repeatElement.id}`}
        element={repeatElement}
        isSelected={isSelected}
        isInContainerMode={context.selection.mode === "block"}
      >
        {repeatContainer}
      </SelectableContainer>
    );
  },
};
