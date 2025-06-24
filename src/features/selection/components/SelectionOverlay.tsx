import React from "react";
import { useElementRect } from "../../../hooks/useElementRect";

interface SelectionOverlayProps {
  targetSelector: string;
  elementName: string;
  color?: string;
}

export const SelectionOverlay: React.FC<SelectionOverlayProps> = ({
  targetSelector,
  elementName,
  color = "#3b82f6"
}) => {
  const { boundingRect } = useElementRect(targetSelector, {
    containerSelector: "[data-preview-container]",
    enabled: Boolean(targetSelector),
  });

  if (!boundingRect) return null;

  const padding = elementName === "Text" ? 4 : elementName === "Button" ? -1 : 0;

  return (
    <div
      style={{
        position: "absolute",
        top: boundingRect.top - padding,
        left: boundingRect.left - padding,
        width: boundingRect.width + padding * 2,
        height: boundingRect.height + padding * 2,
        pointerEvents: "none",
        zIndex: 20,
        border: `2px solid ${color}`,
        backgroundColor: `${color}10`,
        borderRadius: "4px",
      }}
    >
      <div
        style={{
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
        }}
      >
        {elementName}
      </div>
    </div>
  );
};