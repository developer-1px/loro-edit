// src/features/floating-ui/components/FloatingToolbar.tsx

import React from 'react';

export interface ToolbarButton {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  isActive?: boolean;
  variant?: 'default' | 'primary';
}

interface FloatingToolbarProps {
  buttons: ToolbarButton[];
  className?: string;
}

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  buttons,
  className = ""
}) => {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {buttons.map((button) => (
        <button
          key={button.id}
          className={`flex items-center gap-1 px-2 py-1 rounded transition-colors text-xs ${
            button.isActive
              ? "bg-gray-800 text-white"
              : button.variant === 'primary'
              ? "bg-gray-800 text-white hover:bg-gray-700"
              : "text-gray-300 hover:bg-gray-800 hover:text-white"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            button.onClick();
          }}
        >
          {button.icon && (
            <span className="w-3.5 h-3.5 flex items-center justify-center">
              {button.icon}
            </span>
          )}
          <span className="font-medium">{button.label}</span>
        </button>
      ))}
    </div>
  );
};