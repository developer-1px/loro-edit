// src/plugins/svg.tsx

import React, { useState, useRef } from "react";
import type { Plugin } from "./types";
import type { SvgElement } from "../types";
import { useEditorStore } from "../store/editorStore";
import { ChevronDown, Code, Palette } from "lucide-react";
import { Button } from "../components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { Textarea } from "../components/ui/textarea";
import { cn } from "../lib/utils";

// SVG 샘플 데이터
const SVG_SAMPLES = [
  {
    name: "Heart",
    content: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`
  },
  {
    name: "Star",
    content: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`
  },
  {
    name: "Check Circle",
    content: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg>`
  },
  {
    name: "Arrow Right",
    content: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></svg>`
  },
  {
    name: "Plus Circle",
    content: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`
  },
  {
    name: "Info",
    content: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`
  }
];

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
  const [open, setOpen] = useState<'icons' | 'code' | false>(false);
  const [customSvg, setCustomSvg] = useState(svgContent || '');
  const updateElement = useEditorStore((state) => state.updateElement);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Keep local state in sync with prop
  React.useEffect(() => {
    setCustomSvg(svgContent || '');
  }, [svgContent]);

  const handleSvgSelect = (newSvgContent: string) => {
    // Update the element in the store with new SVG content
    updateElement(elementId, { 
      svgContent: newSvgContent
    });
    
    // Close the popover
    setOpen(false);
  };

  const handleCustomSvgSave = () => {
    if (customSvg.trim()) {
      updateElement(elementId, { 
        svgContent: customSvg
      });
      setOpen(false);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Black-themed floating menu - always visible when selected */}
      {isSelected && (
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-gray-900 rounded-md shadow-xl px-0.5 py-0.5 flex items-center gap-0.5">
            {/* Icon dropdown button */}
            <button
              className="flex items-center gap-1 px-2 py-1 hover:bg-gray-800 rounded text-white transition-colors text-xs"
              onClick={(e) => {
                e.stopPropagation();
                setOpen('icons');
              }}
              title="Choose icon"
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Icons</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            
            {/* Divider */}
            <div className="w-px h-4 bg-gray-700" />
            
            {/* Code button */}
            <button
              className="flex items-center gap-1 px-2 py-1 hover:bg-gray-800 rounded text-white transition-colors text-xs"
              onClick={(e) => {
                e.stopPropagation();
                setCustomSvg(svgContent);
                setOpen('code');
              }}
              title="Enter code"
            >
              <Code className="w-3.5 h-3.5" />
              <span>Code</span>
            </button>
          </div>
        </div>
      )}

      {/* SVG Content */}
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

      {/* Icon selection popover */}
      {open === 'icons' && isSelected && (
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-50">
          <Popover open={true} onOpenChange={(isOpen) => !isOpen && setOpen(false)}>
            <PopoverTrigger asChild>
              <div className="absolute inset-0 pointer-events-none" />
            </PopoverTrigger>
            
            <PopoverContent 
              className="w-48 p-2 bg-gray-900 border-gray-800 shadow-xl"
              side="top"
              align="center"
              sideOffset={35}
            >
              <div className="grid grid-cols-3 gap-1">
                {SVG_SAMPLES.map((sample, index) => (
                  <button
                    key={index}
                    className="group p-2 bg-gray-800 hover:bg-gray-700 rounded transition-all duration-150 flex flex-col items-center gap-1"
                    onClick={() => handleSvgSelect(sample.content)}
                  >
                    <div 
                      className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors"
                      dangerouslySetInnerHTML={{ __html: sample.content }}
                    />
                    <span className="text-[10px] text-gray-400 group-hover:text-gray-200 leading-none">
                      {sample.name.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}

      {/* Code input popover */}
      {open === 'code' && isSelected && (
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-50">
          <Popover open={true} onOpenChange={(isOpen) => !isOpen && setOpen(false)}>
            <PopoverTrigger asChild>
              <div className="absolute inset-0 pointer-events-none" />
            </PopoverTrigger>
            
            <PopoverContent 
              className="w-64 p-3 bg-gray-900 border-gray-800 shadow-xl"
              side="top"
              align="center"
              sideOffset={35}
            >
              <div className="space-y-3">
                <Textarea
                  value={customSvg}
                  onChange={(e) => setCustomSvg(e.target.value)}
                  className="h-20 font-mono text-xs resize-none bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500"
                  placeholder="<svg>...</svg>"
                />
                
                {/* Live Preview */}
                {customSvg && (
                  <div className="bg-gray-800 rounded p-2 flex justify-center min-h-[40px] items-center">
                    <div 
                      className="w-8 h-8 text-gray-300"
                      dangerouslySetInnerHTML={{ __html: customSvg }}
                    />
                  </div>
                )}

                {/* Footer Actions */}
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setOpen(false)}
                    className="text-xs h-7 px-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleCustomSvgSave}
                    disabled={!customSvg.trim()}
                    className="bg-amber-500 hover:bg-amber-600 text-gray-900 text-xs h-7 px-3 font-medium"
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
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
    priority: 2 // Higher than repeat-item (1)
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