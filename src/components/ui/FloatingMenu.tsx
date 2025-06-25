import React from "react";
import { cn } from "../../lib/utils";

interface FloatingMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  isActive?: boolean;
}

interface FloatingMenuProps {
  items: FloatingMenuItem[];
  className?: string;
  position?: "top" | "bottom" | "left" | "right";
  offset?: number;
}

export const FloatingMenu: React.FC<FloatingMenuProps> = ({
  items,
  className,
  position = "top",
  offset = 16,
}) => {
  // Use style for dynamic positioning since Tailwind doesn't support dynamic classes
  const getPositionStyles = () => {
    switch (position) {
      case "top":
        return { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: `${offset}px` };
      case "bottom":
        return { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: `${offset}px` };
      case "left":
        return { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: `${offset}px` };
      case "right":
        return { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: `${offset}px` };
    }
  };

  return (
    <div 
      className={cn(
        "absolute z-50",
        className
      )}
      style={getPositionStyles()}
    >
      <div className="floating-menu bg-gray-900 rounded-md shadow-xl px-0.5 py-0.5 flex items-center gap-0.5">
        {items.map((item, index) => (
          <React.Fragment key={item.id}>
            {index > 0 && <div className="w-px h-4 bg-gray-700" />}
            <button
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded transition-colors text-xs",
                item.isActive 
                  ? "bg-amber-500 text-gray-900 hover:bg-amber-400" 
                  : "text-white hover:bg-gray-800"
              )}
              onClick={(e) => {
                e.stopPropagation();
                item.onClick();
              }}
            >
              {item.icon && <span className="w-3.5 h-3.5">{item.icon}</span>}
              <span className="font-medium">{item.label}</span>
            </button>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};