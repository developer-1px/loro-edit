import React from "react";
import { useElementRect } from "../../../hooks/useElementRect";
import { MousePointer, ExternalLink, Send, Layers, ArrowDown } from "lucide-react";
import { pluginManager } from "../../../plugins";
import { log } from "../../../utils/logger";

interface SelectionOverlayProps {
  targetSelector: string;
  elementName: string;
  color?: string;
  elementData?: any;
  pluginName?: string;
  elementId?: string;
}

export const SelectionOverlay: React.FC<SelectionOverlayProps> = ({
  targetSelector,
  elementName,
  color = "#3b82f6",
  elementData,
  pluginName,
  elementId
}) => {
  log.ui('debug', `SelectionOverlay rendering`, {
    targetSelector,
    elementName,
    elementId,
    pluginName
  });
  
  const { boundingRect } = useElementRect(targetSelector, {
    containerSelector: "[data-preview-container]",
    enabled: Boolean(targetSelector),
  });
  
  log.ui('debug', `SelectionOverlay bounding rect`, {
    targetSelector,
    boundingRect
  });
  
  // Check if this element has floating UI capability
  const plugin = elementId ? pluginManager.getPluginById(elementId) : null;
  const hasFloatingUI = plugin?.floatingUI?.enabled;
  
  // Hide selection label if element has floating UI
  const hideLabel = hasFloatingUI;

  if (!boundingRect) {
    log.ui('warn', `SelectionOverlay: No bounding rect, not rendering`, { targetSelector });
    return null;
  }
  
  // Don't render overlay for Section elements to avoid blocking inner element selection
  if (elementName === "Section") {
    log.ui('debug', `SelectionOverlay: Skipping Section overlay to allow inner selection`, { targetSelector });
    return null;
  }
  
  log.ui('info', `SelectionOverlay: Rendering overlay`, {
    targetSelector,
    elementName,
    boundingRect,
    hideLabel
  });

  const padding = elementName === "Text" ? 4 : elementName === "Button" ? -1 : 0;
  
  // Remove unused handler since floating UI auto-opens

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
      {!hideLabel && (
        <div
          style={{
            position: "absolute",
            top: -20,
            left: 0,
            backgroundColor: color,
            color: "white",
            padding: "1px 4px",
            borderRadius: "4px 4px 0 0",
            fontSize: "10px",
            fontWeight: 600,
            whiteSpace: "nowrap",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
            zIndex: 25,
            display: "flex",
            alignItems: "center",
            gap: "2px",
            pointerEvents: "auto", // Enable clicking on label
          }}
        >
          {elementName}
        
        {/* Action type indicators for button */}
        {pluginName === 'button' && elementData?.attributes?.['data-action-type'] && (
          <span style={{ opacity: 0.8, display: "flex", alignItems: "center" }}>
            |
            {(() => {
              const actionType = elementData.attributes['data-action-type'];
              switch (actionType) {
                case 'linkTo': return <ExternalLink size={8} style={{ marginLeft: "2px" }} />;
                case 'submit': return <Send size={8} style={{ marginLeft: "2px" }} />;
                case 'onClick': return <MousePointer size={8} style={{ marginLeft: "2px" }} />;
                case 'openModal': return <Layers size={8} style={{ marginLeft: "2px" }} />;
                case 'scrollTo': return <ArrowDown size={8} style={{ marginLeft: "2px" }} />;
                default: return <MousePointer size={8} style={{ marginLeft: "2px" }} />;
              }
            })()}
          </span>
        )}
        
        </div>
      )}
    </div>
  );
};