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
    <div className={`bg-gray-900 rounded-md shadow-xl px-0.5 py-0.5 flex items-center gap-0.5 ${className}`}>
      {buttons.map((button) => (
        <button
          key={button.id}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded transition-colors text-xs ${
            button.isActive
              ? "bg-amber-500 text-gray-900 hover:bg-amber-400"
              : button.variant === 'primary'
              ? "bg-blue-600 text-white hover:bg-blue-500"
              : "text-white hover:bg-gray-800"
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