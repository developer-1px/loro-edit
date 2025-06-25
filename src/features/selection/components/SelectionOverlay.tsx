import React from "react";
import { useElementRect } from "../../../hooks/useElementRect";
import { MousePointer, ExternalLink, Send, Layers, ArrowDown } from "lucide-react";

interface SelectionOverlayProps {
  targetSelector: string;
  elementName: string;
  color?: string;
  elementData?: any;
  pluginName?: string;
}

export const SelectionOverlay: React.FC<SelectionOverlayProps> = ({
  targetSelector,
  elementName,
  color = "#3b82f6",
  elementData,
  pluginName
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
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        {elementName}
        {pluginName === 'button' && elementData?.attributes?.['data-action-type'] && (
          <span style={{ opacity: 0.8, display: "flex", alignItems: "center" }}>
            |
            {(() => {
              const actionType = elementData.attributes['data-action-type'];
              switch (actionType) {
                case 'linkTo': return <ExternalLink size={12} style={{ marginLeft: "4px" }} />;
                case 'submit': return <Send size={12} style={{ marginLeft: "4px" }} />;
                case 'onClick': return <MousePointer size={12} style={{ marginLeft: "4px" }} />;
                case 'openModal': return <Layers size={12} style={{ marginLeft: "4px" }} />;
                case 'scrollTo': return <ArrowDown size={12} style={{ marginLeft: "4px" }} />;
                default: return <MousePointer size={12} style={{ marginLeft: "4px" }} />;
              }
            })()}
          </span>
        )}
      </div>
    </div>
  );
};