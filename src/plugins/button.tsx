// src/plugins/button.tsx

import React from "react";
import type { Plugin, PluginRenderProps } from "./types";
import type { ParsedElement, RegularElement } from "../types";
import { MousePointer2 } from "lucide-react";

export const buttonPlugin: Plugin = {
  name: "button",
  version: "1.0.0",
  description: "Interactive button elements with various styles",
  
  selectable: {
    enabled: true,
    name: "Button",
    color: "#3B82F6",
    level: "element",
    elementType: "inline",
  },

  match: (element: Element) => {
    // Match button elements or anchor tags with button class
    if (element.tagName.toLowerCase() === "button") return true;
    if (element.tagName.toLowerCase() === "a" && element.classList.contains("button")) return true;
    return false;
  },

  parse: (element: Element): ParsedElement | null => {
    return {
      id: element.id || crypto.randomUUID(),
      type: "element" as const,
      tagName: element.tagName.toLowerCase(),
      attributes: Array.from(element.attributes).reduce((acc, attr) => {
        acc[attr.name] = attr.value;
        return acc;
      }, {} as Record<string, string>),
      children: [], // Children will be handled by the parent parsing system
    };
  },

  render: ({ parsedElement, context, renderElement }: PluginRenderProps) => {
    const element = parsedElement as RegularElement;
    const isSelected = context.selection.selectedElementId === element.id;
    
    // Extract variant and size from CSS classes
    const className = element.attributes.class || "";
    const isAnchor = element.tagName === "a";
    const href = element.attributes.href;
    
    // Determine variant from classes
    let variant = "primary";
    if (className.includes("btn-secondary")) variant = "secondary";
    else if (className.includes("btn-outline")) variant = "outline";
    
    // Determine size from classes
    let size = "medium";
    if (className.includes("btn-sm")) size = "small";
    else if (className.includes("btn-lg")) size = "large";
    
    // Size classes
    const sizeClasses = {
      small: "px-3 py-1.5 text-sm",
      medium: "px-4 py-2 text-base",
      large: "px-6 py-3 text-lg",
    };
    
    // Variant classes
    const variantClasses = {
      primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
      secondary: "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500",
      outline: "border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
    };
    
    const baseClasses = "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      context.setSelection({
        mode: "block",
        selectedElementId: element.id,
      });
    };
    
    const ButtonTag = isAnchor ? "a" : "button";
    
    return (
      <ButtonTag
        key={element.id}
        data-element-id={element.id}
        className={`
          ${baseClasses}
          ${sizeClasses[size as keyof typeof sizeClasses]}
          ${variantClasses[variant as keyof typeof variantClasses]}
          ${isSelected ? "ring-2 ring-offset-2 ring-blue-500" : ""}
          relative
        `}
        href={isAnchor ? href : undefined}
        onClick={handleClick}
        role={isAnchor ? "link" : "button"}
        style={{ cursor: "pointer" }}
      >
        {element.children.map((child) => renderElement(child))}
        {isSelected && (
          <div className="absolute -top-8 left-0 bg-blue-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <MousePointer2 size={12} />
            <span>Button</span>
          </div>
        )}
      </ButtonTag>
    );
  },
};