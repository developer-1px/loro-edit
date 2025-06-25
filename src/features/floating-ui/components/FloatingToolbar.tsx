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
  selectionColor?: string;
}

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  buttons,
  className = "",
  selectionColor = "#3b82f6"
}) => {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {buttons.map((button) => (
        <button
          key={button.id}
          className={`flex items-center gap-1 px-2 py-1 rounded transition-colors text-xs hover:opacity-80`}
          style={{
            backgroundColor: button.isActive ? selectionColor : button.variant === 'primary' ? `${selectionColor}20` : 'transparent',
            color: button.isActive ? 'white' : button.variant === 'primary' ? selectionColor : '#9ca3af',
            borderWidth: button.variant === 'primary' && !button.isActive ? '1px' : '0',
            borderStyle: 'solid',
            borderColor: `${selectionColor}30`
          }}
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