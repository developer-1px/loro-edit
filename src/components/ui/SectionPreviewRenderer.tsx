import React, { useEffect, useRef, useState } from 'react';
import type { Section } from '../../types';
import { pluginManager } from '../../plugins';
import type { ParsedElement } from '../../types';
import type { PluginContext } from '../../plugins/types';

interface SectionPreviewRendererProps {
  section: Section;
  scale?: number;
  className?: string;
}

export const SectionPreviewRenderer: React.FC<SectionPreviewRendererProps> = ({
  section,
  scale = 0.25,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1440, height: 0 });

  // Create plugin context for preview (with no interactions)
  const pluginContext: PluginContext = {
    selection: { mode: null, selectedElementId: null },
    setSelection: () => {},
    handleItemAdd: () => {},
    handleDatabaseViewModeChange: () => {},
    handleDatabaseSettingsUpdate: () => {},
    handleDatabaseFetch: async () => {},
    onTextChange: () => {},
  };

  // Render elements recursively
  const renderElement = (parsedElement: ParsedElement): React.ReactNode => {
    const tagName = "tagName" in parsedElement ? parsedElement.tagName : "div";
    const className = "attributes" in parsedElement && parsedElement.attributes?.class || "";
    const mockElement = document.createElement(tagName || "div");
    if (className) {
      mockElement.className = className;
    }
    
    if ("attributes" in parsedElement && parsedElement.attributes) {
      Object.entries(parsedElement.attributes).forEach(([key, value]) => {
        mockElement.setAttribute(key, value);
      });
    }
    
    if (tagName === 'button' && "attributes" in parsedElement) {
      mockElement.setAttribute("type", parsedElement.attributes?.type || "button");
    }
    
    mockElement.setAttribute("data-element-type", parsedElement.type);

    if (parsedElement.type === "database" && parsedElement.database) {
      mockElement.setAttribute("data-database", parsedElement.database);
    }
    if (
      parsedElement.type === "repeat-container" &&
      parsedElement.repeatContainer
    ) {
      mockElement.setAttribute(
        "data-repeat-container",
        parsedElement.repeatContainer
      );
    }

    if (parsedElement.id) {
      mockElement.id = parsedElement.id;
    }

    const result = pluginManager.renderElement(
      mockElement,
      parsedElement,
      pluginContext,
      renderElement
    );

    return result || null;
  };

  // Measure the actual height after rendering
  useEffect(() => {
    const measureHeight = () => {
      if (containerRef.current && wrapperRef.current) {
        const height = containerRef.current.scrollHeight;
        const minHeight = 400; // Minimum height for sections
        const actualHeight = Math.max(height || minHeight, minHeight);
        
        setDimensions(prev => ({ ...prev, height: actualHeight }));
        // Set wrapper height based on scaled content
        wrapperRef.current.style.height = `${actualHeight * scale}px`;
      }
    };

    // Measure immediately
    measureHeight();
    
    // Measure again after a delay to catch lazy-loaded content
    const timer = setTimeout(measureHeight, 100);
    
    return () => clearTimeout(timer);
  }, [section.elements, scale]);

  return (
    <div 
      ref={wrapperRef}
      className={`relative overflow-hidden bg-white ${className}`}
      style={{
        width: `${dimensions.width * scale}px`,
      }}
      data-section-preview-renderer
    >
      {/* Scaled content wrapper */}
      <div
        ref={containerRef}
        className="origin-top-left absolute"
        style={{
          transform: `scale(${scale})`,
          width: `${dimensions.width}px`,
          minHeight: '400px',
        }}
      >
        {/* Include Tailwind styles for preview */}
        <style dangerouslySetInnerHTML={{ __html: `
          .py-20 { padding-top: 5rem; padding-bottom: 5rem; }
          .py-12 { padding-top: 3rem; padding-bottom: 3rem; }
          .px-4 { padding-left: 1rem; padding-right: 1rem; }
          .mb-6 { margin-bottom: 1.5rem; }
          .mb-4 { margin-bottom: 1rem; }
          .mb-8 { margin-bottom: 2rem; }
          .gap-8 { gap: 2rem; }
          .gap-12 { gap: 3rem; }
          .text-5xl { font-size: 3rem; }
          .text-3xl { font-size: 1.875rem; }
          .text-xl { font-size: 1.25rem; }
        `}} />
        
        {/* Render section elements */}
        <div className="pointer-events-none">
          {section.elements.map((element, index) => (
            <div key={`${section.id}-${element.id}-${index}`}>
              {renderElement(element)}
            </div>
          ))}
        </div>
      </div>
      
      {/* Loading state for empty sections */}
      {section.elements.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 min-h-[60px]">
          <div className="text-gray-400 text-[10px]">Loading...</div>
        </div>
      )}
    </div>
  );
};