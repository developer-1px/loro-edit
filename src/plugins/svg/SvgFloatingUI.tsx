// src/plugins/svg/SvgFloatingUI.tsx

import React, { useState } from 'react';
import { Palette, Code } from 'lucide-react';
import { FloatingToolbar } from '../../features/floating-ui';
import type { ToolbarButton } from '../../features/floating-ui';
import type { FloatingUIRenderProps } from '../types';
import type { RegularElement } from '../../types';

const ICONS = [
  { name: 'Heart', svg: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>' },
  { name: 'Star', svg: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>' },
  { name: 'Lightning', svg: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>' },
  { name: 'Fire', svg: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 1-4 4-4 1 0 2.5.5 2.5 2.5 0 1.5-1 2-1 2s2.5.5 2.5 2.5a3 3 0 01-3 3c-1 0-1.5-.5-1.5-.5s1.5 2 3.5 2a5 5 0 005-5c0-2-1.272-3.272-2.828-4.828z"></path>' },
  { name: 'Shield', svg: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9.75c0 5.834 3.618 10.29 9 11.25 5.382-.96 9-5.416 9-11.25a12.02 12.02 0 00-.382-2.766z"></path>' },
  { name: 'Gift', svg: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path>' }
];

export const SvgFloatingUI: React.FC<FloatingUIRenderProps> = ({
  element,
  updateElement,
  selectionColor
}) => {
  const svgElement = element as RegularElement;
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  
  const handleIconSelect = (icon: typeof ICONS[0]) => {
    const newSvgContent = `<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">${icon.svg}</svg>`;
    
    updateElement(element.id, {
      children: [{
        type: 'text' as const,
        id: crypto.randomUUID(),
        content: newSvgContent
      }]
    });
    
    setShowIconPicker(false);
  };
  
  const toggleCodeEditor = () => {
    setShowCodeEditor(!showCodeEditor);
    if (showIconPicker) setShowIconPicker(false);
  };
  
  const toggleIconPicker = () => {
    setShowIconPicker(!showIconPicker);
    if (showCodeEditor) setShowCodeEditor(false);
  };
  
  const toolbarButtons: ToolbarButton[] = [
    {
      id: 'icons',
      label: 'Icons',
      icon: <Palette className="w-3.5 h-3.5" />,
      onClick: toggleIconPicker,
      isActive: showIconPicker
    },
    {
      id: 'code',
      label: 'Code',
      icon: <Code className="w-3.5 h-3.5" />,
      onClick: toggleCodeEditor,
      isActive: showCodeEditor
    }
  ];
  
  return (
    <div className="flex flex-col items-center gap-1">
      <FloatingToolbar buttons={toolbarButtons} selectionColor={selectionColor} />
      
      {showIconPicker && (
        <div className="bg-gray-900 rounded shadow-xl p-2 max-w-xs" style={{ borderWidth: '1px', borderStyle: 'solid', borderColor: `${selectionColor}30` }}>
          <div className="grid grid-cols-3 gap-1">
            {ICONS.map((icon) => (
              <button
                key={icon.name}
                className="p-1.5 rounded transition-colors hover:opacity-80"
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${selectionColor}10`}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                onClick={() => handleIconSelect(icon)}
                title={icon.name}
              >
                <svg 
                  className="w-5 h-5 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  dangerouslySetInnerHTML={{ __html: icon.svg }}
                />
              </button>
            ))}
          </div>
        </div>
      )}
      
      {showCodeEditor && (
        <div className="bg-gray-900 rounded shadow-xl p-2 w-72" style={{ borderWidth: '1px', borderStyle: 'solid', borderColor: `${selectionColor}30` }}>
          <textarea
            className="w-full h-24 bg-gray-950 rounded px-2 py-1 text-[11px] text-gray-200 font-mono"
            style={{ borderWidth: '1px', borderStyle: 'solid', borderColor: `${selectionColor}20` }}
            placeholder="Enter SVG code..."
            defaultValue={svgElement.children?.[0]?.type === 'text' ? svgElement.children[0].content : ''}
            onBlur={(e) => {
              const newContent = e.target.value.trim();
              if (newContent) {
                updateElement(element.id, {
                  children: [{
                    type: 'text' as const,
                    id: crypto.randomUUID(),
                    content: newContent
                  }]
                });
              }
            }}
          />
          <div className="text-[10px] text-gray-400 mt-1">
            Enter SVG code without the outer &lt;svg&gt; tags
          </div>
        </div>
      )}
    </div>
  );
};