import React, { useRef } from "react";
import type { SelectableConfig } from "../../plugins/types";
import { useElementRect } from "../../hooks/useElementRect";

interface SelectionOverlayProps {
  targetSelector: string;
  selectable: SelectableConfig;
  isSelected: boolean;
  isHovered?: boolean;
  showHoverEffects?: boolean;
}

export const SelectionOverlay: React.FC<SelectionOverlayProps> = ({
  targetSelector,
  selectable,
  isSelected,
  isHovered = false,
  showHoverEffects = false,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  
  const { boundingRect } = useElementRect(targetSelector, {
    containerSelector: "[data-preview-container]",
    enabled: Boolean(targetSelector),
  });

  if (!boundingRect || (!isSelected && (!showHoverEffects || !isHovered))) {
    return null;
  }

  const getOverlayStyles = (): React.CSSProperties => {
    const color = selectable.color || "#3b82f6"; // Default blue
    const isHoverOnly = !isSelected && isHovered;

    // Add extra padding for text elements
    const isTextElement = selectable.name === "Text";
    const padding = isTextElement ? 4 : 0;

    return {
      position: "absolute",
      top: boundingRect.top - padding,
      left: boundingRect.left - padding,
      width: boundingRect.width + padding * 2,
      height: boundingRect.height + padding * 2,
      pointerEvents: "none",
      zIndex: isSelected ? 20 : 10,
      border: isSelected
        ? `2px solid ${color}`
        : isHoverOnly
        ? `1px solid ${color}60`
        : "none",
      backgroundColor: isSelected
        ? `${color}10`
        : isHoverOnly
        ? `${color}05`
        : "transparent",
      borderRadius: "4px",
    };
  };

  const getLabelStyles = (): React.CSSProperties => {
    const color = selectable.color || "#3b82f6";

    return {
      position: "absolute",
      top: -28,
      left: 0,
      backgroundColor: color,
      color: "white",
      padding: "4px 8px",
      borderRadius: "4px 4px 0 0",
      fontSize: "12px",
      fontWeight: 600,
      whiteSpace: "nowrap",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
      zIndex: 25,
    };
  };

  const getDisplayName = () => {
    if (isSelected) {
      return `${selectable.name}`;
    }
    if (isHovered && showHoverEffects) {
      return ``;
    }
    return selectable.name;
  };

  return (
    <div ref={overlayRef} style={getOverlayStyles()}>
      {/* Selection/Hover Label */}
      {(isSelected || (isHovered && showHoverEffects)) && (
        <div style={getLabelStyles()}>{getDisplayName()}</div>
      )}
    </div>
  );
};
