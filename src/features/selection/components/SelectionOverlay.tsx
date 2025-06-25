import React from "react";
import { useElementRect } from "../../../hooks/useElementRect";
import { MousePointer, ExternalLink, Send, Layers, ArrowDown, Settings } from "lucide-react";
import { useFloatingUIStore } from "../../../store/floatingUIStore";
import { pluginManager } from "../../../plugins";

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
  const { boundingRect } = useElementRect(targetSelector, {
    containerSelector: "[data-preview-container]",
    enabled: Boolean(targetSelector),
  });
  
  const toggleFloatingUI = useFloatingUIStore((state) => state.toggleFloatingUI);
  const activeElementId = useFloatingUIStore((state) => state.activeElementId);
  const isUIOpen = useFloatingUIStore((state) => state.isUIOpen);
  
  // Check if this element has floating UI capability
  const plugin = elementId ? pluginManager.getPluginById(elementId) : null;
  const hasFloatingUI = plugin?.floatingUI?.enabled;
  
  // Hide selection label if floating UI is active for this element
  const hideLabel = elementId === activeElementId && isUIOpen;

  if (!boundingRect) return null;

  const padding = elementName === "Text" ? 4 : elementName === "Button" ? -1 : 0;
  
  const handleSettingsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (elementId && hasFloatingUI) {
      toggleFloatingUI(elementId);
    }
  };

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
            pointerEvents: "auto", // Enable clicking on label
            cursor: hasFloatingUI ? "pointer" : "default",
          }}
          onClick={hasFloatingUI ? handleSettingsClick : undefined}
        >
          {elementName}
        
        {/* Action type indicators for button */}
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
        
        {/* Remove settings icon - floating UI toggles on element click */}
        {false && hasFloatingUI && (
          <button
            style={{
              background: "none",
              border: "none",
              color: "white",
              cursor: "pointer",
              padding: "2px",
              marginLeft: "4px",
              borderRadius: "2px",
              display: "flex",
              alignItems: "center",
              opacity: 0.8,
              transition: "opacity 0.2s"
            }}
            onClick={handleSettingsClick}
            onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
            onMouseLeave={(e) => e.currentTarget.style.opacity = "0.8"}
            title="Open settings"
          >
            <Settings size={12} />
          </button>
        )}
        </div>
      )}
    </div>
  );
};