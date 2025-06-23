// src/plugins/svg.tsx

import React, { useState } from "react";
import type { Plugin } from "./types";
import type { SvgElement } from "../types";
import { useEditorStore } from "../store/editorStore";
import { Edit3, Palette } from "lucide-react";
import { Button } from "../components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
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
}

const EditableSvg: React.FC<EditableSvgProps> = ({
  svgContent,
  width,
  height,
  className,
  elementId,
}) => {
  const [open, setOpen] = useState(false);
  const [customSvg, setCustomSvg] = useState(svgContent);
  const handleSvgChange = useEditorStore((state) => state.handleSvgChange);
  const selection = useEditorStore((state) => state.selection);
  
  // 현재 SVG 요소가 선택되어 있는지 확인
  const isSelected = selection.selectedElementId === elementId;

  const handleSvgSelect = (newSvgContent: string) => {
    handleSvgChange(elementId, newSvgContent);
    setOpen(false);
  };

  const handleCustomSvgSave = () => {
    if (customSvg.trim()) {
      handleSvgChange(elementId, customSvg);
      setOpen(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    // 선택되지 않은 상태에서는 popover를 열 수 없음
    if (newOpen && !isSelected) {
      return;
    }
    
    setOpen(newOpen);
    if (newOpen) {
      setCustomSvg(svgContent);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // 선택되지 않은 상태에서는 클릭 이벤트를 버블링하여 선택되도록 함
    if (!isSelected) {
      // 부모로 이벤트를 전파해서 선택 시스템이 처리하도록 함
      return;
    }
    
    // 선택된 상태에서는 popover 열기
    e.stopPropagation();
    e.preventDefault();
    setOpen(true);
  };

  // Popover가 열려있을 때 외부 클릭 감지
  React.useEffect(() => {
    if (!open) return;

    const handleGlobalClick = (e: MouseEvent) => {
      // Popover 내부 클릭은 무시 (더 포괄적으로 체크)
      const target = e.target as Element;
      if (
        target.closest('[data-radix-popover-content]') ||
        target.closest('[data-radix-tabs-content]') ||
        target.closest('[data-radix-tabs-list]') ||
        target.closest('[data-radix-tabs-trigger]')
      ) {
        return;
      }
      
      // 외부 클릭 시 popover 닫기
      setOpen(false);
    };

    document.addEventListener('click', handleGlobalClick, true);
    return () => {
      document.removeEventListener('click', handleGlobalClick, true);
    };
  }, [open]);

  return (
    <>
      <div 
        className={cn(
          "relative group transition-all",
          isSelected ? "cursor-pointer hover:shadow-md" : "cursor-default",
          className
        )} 
        data-element-id={elementId}
        onClick={handleClick}
      >
        {svgContent ? (
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
            "border-2 border-dashed rounded-lg text-center flex items-center justify-center p-4 min-h-[60px] transition-colors relative",
            isSelected 
              ? "border-amber-400 bg-amber-50" 
              : "border-gray-300"
          )}>
            <div className={cn(
              "text-gray-500",
              isSelected && "text-amber-600"
            )}>
              <Palette className="mx-auto w-6 h-6 mb-1" />
              <div className="text-xs font-medium">
                {isSelected ? "Click to add" : "SVG"}
              </div>
            </div>
            
            {/* Floating add button for empty state */}
            {isSelected && (
              <div className="absolute -top-8 left-0 opacity-0 group-hover:opacity-100 transition-all duration-200">
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-1.5 flex items-center gap-2 text-sm whitespace-nowrap">
                  <Palette className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-700 font-medium">Add SVG</span>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Floating edit button - SVG 컨텐츠가 있고 선택된 상태에서만 표시 */}
        {svgContent && isSelected && (
          <div className="absolute -top-8 left-0 opacity-0 group-hover:opacity-100 transition-all duration-200">
            <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-1.5 flex items-center gap-2 text-sm whitespace-nowrap">
              <Edit3 className="w-4 h-4 text-gray-600" />
              <span className="text-gray-700 font-medium">Edit SVG</span>
            </div>
          </div>
        )}
      </div>

      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%'
            }}
          />
        </PopoverTrigger>
        
        <PopoverContent 
          className="w-60 max-h-80 overflow-hidden p-0 border shadow-lg bg-white"
          side="top"
          align="center"
          sideOffset={8}
          style={{ backgroundColor: 'white' }}
          onInteractOutside={(e) => {
            // 탭 관련 요소 클릭은 무시
            const target = e.target as Element;
            if (
              target.closest('[data-radix-tabs-trigger]') ||
              target.closest('[data-radix-tabs-list]') ||
              target.closest('[data-radix-tabs-content]')
            ) {
              e.preventDefault();
              return;
            }
            setOpen(false);
          }}
          onEscapeKeyDown={() => setOpen(false)}
          onPointerDownOutside={(e) => {
            // 탭 관련 요소 클릭은 무시
            const target = e.target as Element;
            if (
              target.closest('[data-radix-tabs-trigger]') ||
              target.closest('[data-radix-tabs-list]') ||
              target.closest('[data-radix-tabs-content]')
            ) {
              e.preventDefault();
              return;
            }
            setOpen(false);
          }}
        >
          {/* Compact Header */}
          <div className="px-3 py-2 border-b border-gray-100">
            <h3 className="font-medium text-gray-900 text-xs">SVG</h3>
          </div>

          <Tabs defaultValue="samples" className="flex flex-col">
            {/* Ultra Compact Tab Navigation */}
            <div className="px-3 py-1 border-b border-gray-100">
              <TabsList className="grid w-full grid-cols-2 h-6 bg-gray-100 p-0.5 text-xs">
                <TabsTrigger 
                  value="samples" 
                  className="text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm px-1"
                >
                  Icons
                </TabsTrigger>
                <TabsTrigger 
                  value="custom" 
                  className="text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm px-1"
                >
                  Code
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Content Area */}
            <div className="overflow-y-auto max-h-60">
              <TabsContent value="samples" className="m-0 p-3">
                <div className="grid grid-cols-3 gap-1.5">
                  {SVG_SAMPLES.map((sample, index) => (
                    <button
                      key={index}
                      className="group p-2 border border-gray-200 rounded hover:border-amber-400 hover:bg-amber-50 transition-all duration-150 flex flex-col items-center gap-1"
                      onClick={() => handleSvgSelect(sample.content)}
                    >
                      <div 
                        className="w-6 h-6 text-gray-600 group-hover:text-amber-600 transition-colors"
                        dangerouslySetInnerHTML={{ __html: sample.content }}
                      />
                      <span className="text-xs font-medium text-gray-700 group-hover:text-amber-700 leading-tight">
                        {sample.name.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="custom" className="m-0 p-3 space-y-2">
                <Textarea
                  value={customSvg}
                  onChange={(e) => setCustomSvg(e.target.value)}
                  className="h-16 font-mono text-xs resize-none"
                  placeholder="<svg>...</svg>"
                />
                
                {/* Live Preview */}
                {customSvg && (
                  <div className="border border-gray-200 rounded p-2 bg-gray-50 flex justify-center min-h-[40px] items-center">
                    <div 
                      className="w-8 h-8 text-gray-600"
                      dangerouslySetInnerHTML={{ __html: customSvg }}
                    />
                  </div>
                )}

                {/* Footer Actions */}
                <div className="flex justify-end gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOpen(false)}
                    className="text-xs h-6 px-2"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleCustomSvgSave}
                    disabled={!customSvg.trim()}
                    className="bg-amber-500 hover:bg-amber-600 text-white text-xs h-6 px-2"
                  >
                    Apply
                  </Button>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </PopoverContent>
      </Popover>
    </>
  );
};

export const svgPlugin: Plugin = {
  name: "svg",
  version: "1.0.0",
  description: "Handles SVG elements with sample selection and custom input",

  selectable: {
    enabled: true,
    name: "SVG",
    color: "#f59e0b", // amber - same as image
    description: "SVG with customizable content",
    level: "element",
    elementType: "inline",
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

  render: ({ parsedElement }) => {
    const svgElement = parsedElement as SvgElement;

    return (
      <EditableSvg
        key={svgElement.id}
        elementId={svgElement.id}
        svgContent={svgElement.svgContent}
        width={svgElement.width}
        height={svgElement.height}
        className={svgElement.attributes?.class || ""}
      />
    );
  },
};