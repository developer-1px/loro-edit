import React, { useEffect, useState, useRef } from "react";
import type { SelectableConfig } from "../../plugins/types";

interface SelectionOverlayProps {
  targetSelector: string;
  selectable: SelectableConfig;
  isSelected: boolean;
  isHovered?: boolean;
  showHoverEffects?: boolean;
}

interface BoundingRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export const SelectionOverlay: React.FC<SelectionOverlayProps> = ({
  targetSelector,
  selectable,
  isSelected,
  isHovered = false,
  showHoverEffects = false,
}) => {
  const [boundingRect, setBoundingRect] = useState<BoundingRect | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateBoundingRect = () => {
      const targetElement = document.querySelector(targetSelector);
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const containerRect = targetElement
          .closest("[data-preview-container]")
          ?.getBoundingClientRect();

        if (containerRect) {
          setBoundingRect({
            top: rect.top - containerRect.top,
            left: rect.left - containerRect.left,
            width: rect.width,
            height: rect.height,
          });
        }
      }
    };

    updateBoundingRect();

    // Update on scroll and resize
    const handleUpdate = () => updateBoundingRect();
    window.addEventListener("scroll", handleUpdate, true);
    window.addEventListener("resize", handleUpdate);

    // Use ResizeObserver for more precise updates
    let resizeObserver: ResizeObserver | null = null;
    const targetElement = document.querySelector(targetSelector);
    if (targetElement) {
      resizeObserver = new ResizeObserver(handleUpdate);
      resizeObserver.observe(targetElement);
    }

    return () => {
      window.removeEventListener("scroll", handleUpdate, true);
      window.removeEventListener("resize", handleUpdate);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [targetSelector]);

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
