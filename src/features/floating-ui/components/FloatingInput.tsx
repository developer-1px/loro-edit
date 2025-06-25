// src/features/floating-ui/components/FloatingInput.tsx

import React, { useState, useRef, useEffect } from 'react';
import { Input } from '../../../components/ui/input';

interface FloatingInputProps {
  value: string;
  onChange: (value: string) => void;
  onSave: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'url' | 'email';
  className?: string;
  autoFocus?: boolean;
  width?: string;
  selectionColor?: string;
}

export const FloatingInput: React.FC<FloatingInputProps> = ({
  value,
  onChange,
  onSave,
  placeholder = "Enter value...",
  type = "text",
  className = "",
  autoFocus = false,
  width = "w-32",
  selectionColor = "#3b82f6"
}) => {
  const [tempValue, setTempValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    setTempValue(value);
  }, [value]);
  
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
    }
  }, [autoFocus]);
  
  const handleSave = () => {
    onChange(tempValue);
    onSave(tempValue);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setTempValue(value); // Reset to original value
      inputRef.current?.blur();
    }
  };
  
  return (
    <div className={`bg-gray-900 rounded px-2 py-1 flex items-center ${className}`} style={{ borderWidth: '1px', borderStyle: 'solid', borderColor: `${selectionColor}30` }}>
      <Input
        ref={inputRef}
        type={type}
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        placeholder={placeholder}
        className={`bg-gray-950 text-gray-200 placeholder-gray-500 h-6 text-xs ${width}`}
        style={{ borderColor: `${selectionColor}20` }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        onBlur={handleSave}
      />
    </div>
  );
};