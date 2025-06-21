// src/plugins/repeat-container.tsx

import React, { useState } from "react";
import { Plus } from "lucide-react";
import type { Plugin } from "./types";
import type { RepeatContainer, RegularElement } from "../types";
import { useEditorStore } from "../store/editorStore";

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
  renderItem: (item: RegularElement) => React.ReactNode;
  showHoverEffects?: boolean;
}

const RepeatableContainer: React.FC<RepeatableContainerProps> = ({
  containerId,
  containerName,
  className,
  items,
  renderItem,
  showHoverEffects = false,
}) => {
  const [showAddButton, setShowAddButton] = useState(false);
  const handleItemAdd = useEditorStore((state) => state.handleItemAdd);
  const selection = useEditorStore((state) => state.selection);
  const selectedItemId =
    selection.selectedRepeatContainerId === containerId
      ? selection.selectedRepeatItemId
      : null;

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
            onClick={() => handleItemAdd(containerId)}
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

export const repeatContainerPlugin: Plugin = {
  name: "repeat-container",
  version: "1.0.0",
  description: "Handles repeatable container elements with item management",

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
        className: element.className || "",
        tagName: element.tagName.toLowerCase(),
        repeatContainer: repeatAttribute,
        items: items,
        children: [], // Would be parsed from child elements
      };
    }
    return null;
  },

  render: ({ parsedElement, renderElement, showHoverEffects }) => {
    const repeatElement = parsedElement as RepeatContainer;

    // 컨테이너 자체는 선택 불가능하고, 내부 반복 요소만 선택 가능
    return (
      <RepeatableContainer
        key={repeatElement.id}
        containerId={repeatElement.id}
        containerName={repeatElement.repeatContainer}
        className={repeatElement.className}
        items={repeatElement.items}
        renderItem={renderElement}
        showHoverEffects={showHoverEffects}
      />
    );
  },
};
