// src/features/floating-ui/components/FloatingDropdown.tsx

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';

export interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  isActive?: boolean;
}

interface FloatingDropdownProps {
  items: DropdownItem[];
  selectedItem?: DropdownItem;
  placeholder?: string;
  className?: string;
  onSelect?: (item: DropdownItem) => void;
}

export const FloatingDropdown: React.FC<FloatingDropdownProps> = ({
  items,
  selectedItem,
  placeholder = "Select option",
  className = "",
  onSelect
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleItemSelect = (item: DropdownItem) => {
    item.onClick();
    onSelect?.(item);
    setIsOpen(false);
  };
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className={`bg-white/20 rounded px-2.5 py-1 flex items-center gap-1.5 text-white hover:bg-white/30 transition-colors text-xs ${className}`}
          onClick={(e) => e.stopPropagation()}
        >
          {selectedItem?.icon && (
            <span className="w-4 h-4 flex items-center justify-center">
              {selectedItem.icon}
            </span>
          )}
          <span className="text-xs font-medium">
            {selectedItem?.label || placeholder}
          </span>
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
          {items.map((item) => (
            <button
              key={item.id}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs w-full text-left transition-colors ${
                item.isActive
                  ? "bg-amber-500 text-gray-900 hover:bg-amber-400"
                  : "text-white hover:bg-gray-800"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                handleItemSelect(item);
              }}
            >
              {item.icon && (
                <span className="w-3.5 h-3.5 flex items-center justify-center">
                  {item.icon}
                </span>
              )}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};