// src/plugins/svg.tsx

import React from "react";
import type { Plugin } from "./types";
import type { SvgElement } from "../types";
import { Palette } from "lucide-react";
import { cn } from "../lib/utils";
import { SvgFloatingUI } from "./svg/SvgFloatingUI";


interface EditableSvgProps {
  svgContent: string;
  width?: string;
  height?: string;
  className?: string;
  elementId: string;
  isSelected?: boolean;
}

const EditableSvg: React.FC<EditableSvgProps> = ({
  svgContent,
  width,
  height,
  className,
  elementId,
  isSelected,
}) => {

  return (
    <div 
      className={cn(
        "transition-all",
        className
      )} 
      data-element-id={elementId}
    >
      {svgContent && svgContent.trim() ? (
        <div 
          className="svg-container"
          style={{ 
            width: width || 'auto', 
            height: height || 'auto',
            display: 'inline-block'
          }}
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      ) : (
        <div className={cn(
          "border-2 border-dashed rounded-lg text-center flex items-center justify-center p-4 min-h-[60px] transition-colors",
          isSelected 
            ? "border-amber-400 bg-amber-50" 
            : "border-gray-300"
        )}>
          <div className={cn(
            "text-gray-500",
            isSelected && "text-amber-600"
          )}>
            <Palette className="mx-auto w-6 h-6 mb-1" />
            <div className="text-xs font-medium">SVG</div>
          </div>
        </div>
      )}
    </div>
  );
};

export const svgPlugin: Plugin = {
  name: "svg",

  selectable: {
    enabled: true,
    name: "SVG",
    color: "#f59e0b", // amber - same as image
    level: "element",
    elementType: "inline",
    priority: 1 // Higher priority than link (8) but lower than text (0)
  },

  floatingUI: {
    enabled: true,
    position: 'top',
    offset: 24,
    render: SvgFloatingUI
  },

  match: (element: Element) => {
    return element.tagName.toLowerCase() === "svg";
  },

  parse: (element: Element) => {
    if (element.tagName.toLowerCase() === "svg") {
      const svgElement = element as SVGElement;
      return {
        type: "svg" as const,
        id: element.id || crypto.randomUUID(),
        tagName: element.tagName.toLowerCase(),
        svgContent: element.outerHTML,
        width: svgElement.getAttribute("width") || undefined,
        height: svgElement.getAttribute("height") || undefined,
        repeatItem: element.getAttribute("data-repeat-item") || undefined,
        attributes: Array.from(element.attributes).reduce((acc, attr) => {
          acc[attr.name] = attr.value;
          return acc;
        }, {} as Record<string, string>),
      };
    }
    return null;
  },

  render: ({ parsedElement, isSelected }) => {
    const svgElement = parsedElement as SvgElement;

    return (
      <EditableSvg
        key={svgElement.id}
        elementId={svgElement.id}
        svgContent={svgElement.svgContent || ''}
        width={svgElement.width}
        height={svgElement.height}
        className={svgElement.attributes?.class || ""}
        isSelected={isSelected}
      />
    );
  },
};