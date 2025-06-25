// src/plugins/button.tsx

import React, { useState, useRef, useEffect } from "react";
import type { Plugin } from "./types";
import type { RegularElement } from "../types";
import { parseBasicElement, createElementProps } from "./utils";
import { MousePointer, ExternalLink, Send, Layers, ArrowDown, ChevronDown } from "lucide-react";
import { useEditorStore } from "../store/editorStore";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { Input } from "../components/ui/input";

interface ButtonProps {
  element: RegularElement;
  isSelected: boolean;
  renderElement: (element: any) => React.ReactNode;
}

type ActionType = 'linkTo' | 'submit' | 'onClick' | 'openModal' | 'scrollTo';

const ButtonComponent: React.FC<ButtonProps> = ({ element, isSelected, renderElement }) => {
  const [actionType, setActionType] = useState<ActionType>(
    element.attributes?.['data-action-type'] as ActionType || 'onClick'
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const [linkUrl, setLinkUrl] = useState(element.attributes?.['data-link-url'] || '');
  const [tempLinkUrl, setTempLinkUrl] = useState(linkUrl);
  const updateElement = useEditorStore((state) => state.updateElement);
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (actionType === 'linkTo' && showDropdown && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
    }
  }, [actionType, showDropdown]);
  
  const handleActionTypeChange = (type: ActionType) => {
    setActionType(type);
    updateElement(element.id, {
      attributes: {
        ...element.attributes,
        'data-action-type': type
      }
    });
    setShowDropdown(false);
  };
  
  const handleLinkUrlChange = (value: string) => {
    setTempLinkUrl(value);
  };
  
  const handleLinkUrlSave = () => {
    setLinkUrl(tempLinkUrl);
    updateElement(element.id, {
      attributes: {
        ...element.attributes,
        'data-link-url': tempLinkUrl
      }
    });
  };
  
  const Tag = element.tagName as keyof React.JSX.IntrinsicElements;
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
  };
  
  const getActionIcon = (type: ActionType) => {
    switch (type) {
      case 'linkTo': return <ExternalLink size={14} />;
      case 'submit': return <Send size={14} />;
      case 'onClick': return <MousePointer size={14} />;
      case 'openModal': return <Layers size={14} />;
      case 'scrollTo': return <ArrowDown size={14} />;
    }
  };

  const getActionLabel = (type: ActionType) => {
    switch (type) {
      case 'linkTo': return 'Link To';
      case 'submit': return 'Submit Form';
      case 'onClick': return 'On Click';
      case 'openModal': return 'Open Modal';
      case 'scrollTo': return 'Scroll To';
    }
  };

  const menuItems: ActionType[] = ['linkTo', 'submit', 'onClick', 'openModal', 'scrollTo'];
  
  return (
    <div className="relative inline-block">
      {isSelected && (
        <>
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-2">
          <Popover open={showDropdown} onOpenChange={setShowDropdown}>
            <PopoverTrigger asChild>
              <button 
                className="bg-gray-900 rounded-md shadow-xl px-3 py-1.5 flex items-center gap-2 text-white hover:bg-gray-800 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDropdown(!showDropdown);
                }}
              >
                <span className="w-4 h-4 flex items-center justify-center">{getActionIcon(actionType)}</span>
                <span className="text-xs font-medium">{getActionLabel(actionType)}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </PopoverTrigger>
            
            <PopoverContent 
              className="p-1 bg-gray-900 border-gray-800 shadow-xl w-auto"
              side="top"
              align="start"
              sideOffset={5}
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <div className="space-y-0.5">
                {menuItems.map((type) => (
                  <div key={type} className="flex items-center">
                    <button
                      className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs w-full text-left transition-colors ${
                        actionType === type 
                          ? "bg-amber-500 text-gray-900 hover:bg-amber-400" 
                          : "text-white hover:bg-gray-800"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActionTypeChange(type);
                      }}
                    >
                      <span className="w-3.5 h-3.5 flex items-center justify-center">{getActionIcon(type)}</span>
                      <span className="font-medium">{getActionLabel(type)}</span>
                    </button>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          
          {/* Link input for linkTo action (when dropdown is open) */}
          {showDropdown && actionType === 'linkTo' && (
            <div className="bg-gray-900 rounded-md shadow-xl px-2 py-1 flex items-center">
              <Input
                ref={inputRef}
                type="url"
                value={tempLinkUrl}
                onChange={(e) => handleLinkUrlChange(e.target.value)}
                placeholder="https://..."
                className="bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500 h-6 text-xs w-32"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  e.stopPropagation();
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleLinkUrlSave();
                  }
                }}
                onBlur={handleLinkUrlSave}
              />
            </div>
          )}
        </div>
        
        {/* Always show the main floating button */}
        {!showDropdown && (
          <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-2">
            <button 
              className="bg-gray-900 rounded-md shadow-xl px-3 py-1.5 flex items-center gap-2 text-white hover:bg-gray-800 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setShowDropdown(true);
              }}
            >
              <span className="w-4 h-4 flex items-center justify-center">{getActionIcon(actionType)}</span>
              <span className="text-xs font-medium">{getActionLabel(actionType)}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            
            {/* Link input for linkTo action */}
            {actionType === 'linkTo' && (
              <div className="bg-gray-900 rounded-md shadow-xl px-2 py-1 flex items-center">
                <Input
                  ref={inputRef}
                  type="url"
                  value={tempLinkUrl}
                  onChange={(e) => handleLinkUrlChange(e.target.value)}
                  placeholder="https://..."
                  className="bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500 h-6 text-xs w-32"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    e.stopPropagation();
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleLinkUrlSave();
                    }
                  }}
                  onBlur={handleLinkUrlSave}
                />
              </div>
            )}
          </div>
        )}
        </>
      )}
      
      {/* Button element */}
      {React.createElement(
        Tag,
        {
          ...createElementProps(element, isSelected),
          href: element.tagName === "a" ? "#" : undefined,
          onClick: handleClick,
          onSubmit: element.tagName === "button" ? (e: React.FormEvent) => e.preventDefault() : undefined,
          type: element.tagName === "button" ? "button" : undefined,
          style: { 
            cursor: "default"
          },
          title: actionType === 'linkTo' && linkUrl ? linkUrl : undefined
        },
        element.children.map(renderElement)
      )}
    </div>
  );
};

export const buttonPlugin: Plugin = {
  name: "button",
  
  selectable: {
    enabled: true,
    name: "Button",
    color: "#3B82F6",
    level: "content",
    elementType: "block",
    priority: 10,
    allowDeepSelection: true
  },

  match: (element: Element) => 
    element.tagName.toLowerCase() === "button" || 
    (element.tagName.toLowerCase() === "a" && element.classList.contains("button")),

  parse: (element: Element) => parseBasicElement(element, "element"),

  render: ({ parsedElement, isSelected, renderElement }) => {
    const element = parsedElement as RegularElement;
    return (
      <ButtonComponent
        element={element}
        isSelected={isSelected || false}
        renderElement={renderElement}
      />
    );
  },
};