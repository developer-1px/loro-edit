// src/components/ui/SectionPreview.tsx

import React, { useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { CopyIcon, ScissorsIcon, TrashIcon, GripVerticalIcon } from 'lucide-react';
import type { ParsedElement } from '../../types';
import { useHistory } from '../../features/history';

interface SectionPreviewProps {
  section: ParsedElement;
  index: number;
  isSelected: boolean;
  onMove?: (fromIndex: number, toIndex: number) => void;
  onSelect?: (sectionId: string) => void;
}

interface DragItem {
  type: string;
  index: number;
  id: string;
}

export const SectionPreview: React.FC<SectionPreviewProps> = ({
  section,
  index,
  isSelected,
  onMove,
  onSelect,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const { executeUniversalCopy, executeUniversalCut, executeDeleteElement } = useHistory();

  // Drag and Drop
  const [{ isDragging }, drag] = useDrag({
    type: 'section',
    item: (): DragItem => ({
      type: 'section',
      index,
      id: section.id,
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'section',
    hover: (item: DragItem) => {
      if (!ref.current) {
        return;
      }
      
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      if (onMove) {
        onMove(dragIndex, hoverIndex);
        item.index = hoverIndex;
      }
    },
  });

  drag(drop(ref));

  // Get section title (from h1, h2, h3, etc.)
  const getSectionTitle = (element: ParsedElement): string => {
    if ('children' in element && element.children) {
      for (const child of element.children) {
        if ('tagName' in child && ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(child.tagName)) {
          return extractTextContent(child);
        }
        const nestedTitle = getSectionTitle(child);
        if (nestedTitle) return nestedTitle;
      }
    }
    return `Section ${index + 1}`;
  };

  const extractTextContent = (element: ParsedElement): string => {
    if (element.type === 'text') {
      return element.content || '';
    }
    if ('children' in element && element.children) {
      return element.children
        .map(extractTextContent)
        .join('')
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .trim();
    }
    return '';
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    executeUniversalCopy(section.id);
  };

  const handleCut = (e: React.MouseEvent) => {
    e.stopPropagation();
    executeUniversalCut(section.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    executeDeleteElement(section.id);
  };

  const handleClick = () => {
    if (onSelect) {
      onSelect(section.id);
    }
  };

  // const sectionTitle = getSectionTitle(section); // Removed for Keynote-style minimal display

  return (
    <div className="mb-4">
      {/* Page Number - Outside and bottom-left */}
      <div className="text-[10px] font-medium text-gray-500 mb-1 ml-1">
        {index + 1}
      </div>
      
      <div
        ref={ref}
        className={`
          relative group cursor-pointer rounded-md overflow-hidden
          transition-all duration-200 bg-white
          ${isDragging ? 'opacity-50' : ''}
          ${isSelected ? 'ring-2 ring-blue-500' : 'hover:ring-1 hover:ring-gray-300'}
        `}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={handleClick}
      >
        {/* Thumbnail Preview - Fixed height */}
        <div 
          className="bg-white border border-gray-200 rounded-md overflow-hidden"
          style={{ 
            width: '120px',
            height: '80px'
          }}
        >
          <div style={{
            transform: 'scale(0.08)',
            transformOrigin: 'top left',
            width: '1500px',
            height: '1000px'
          }}>
            {('preview' in section && section.preview) ? (
              <div 
                dangerouslySetInnerHTML={{ __html: section.preview }}
              />
            ) : (
              <SectionContentPreview section={section} />
            )}
          </div>
        </div>

        {/* Drag Handle (only on hover) */}
        <div className="absolute top-1 right-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="p-0.5 bg-white bg-opacity-90 rounded">
            <GripVerticalIcon size={10} className="text-gray-400" />
          </div>
        </div>

        {/* Action Buttons (only on hover and selected) */}
        {(isHovering || isSelected) && (
          <div className="absolute bottom-1 right-1 flex space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              className="p-0.5 bg-white bg-opacity-90 rounded hover:bg-gray-50"
              title="Copy section"
            >
              <CopyIcon size={10} className="text-gray-600" />
            </button>
            <button
              onClick={handleCut}
              className="p-0.5 bg-white bg-opacity-90 rounded hover:bg-gray-50"
              title="Cut section"
            >
              <ScissorsIcon size={10} className="text-gray-600" />
            </button>
            <button
              onClick={handleDelete}
              className="p-0.5 bg-white bg-opacity-90 rounded hover:bg-red-50 hover:text-red-600"
              title="Delete section"
            >
              <TrashIcon size={10} className="text-gray-600 hover:text-red-600" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Component to render actual section content in preview
const SectionContentPreview: React.FC<{ section: ParsedElement }> = ({ section }) => {
  
  const renderElement = (element: ParsedElement): React.ReactNode => {
    // Handle text elements
    if (element.type === 'text') {
      return (
        <span 
          key={element.id}
          dangerouslySetInnerHTML={{ __html: element.content || '' }}
        />
      );
    }
    
    // Handle regular elements
    if ('tagName' in element) {
      const Tag = element.tagName as keyof React.JSX.IntrinsicElements;
      const style: React.CSSProperties = {};
      
      // Apply normal styling - will be scaled down by transform
      if (element.tagName === 'h1') {
        style.fontSize = '2rem';
        style.fontWeight = 'bold';
        style.marginBottom = '1rem';
      } else if (element.tagName === 'h2') {
        style.fontSize = '1.5rem';
        style.fontWeight = 'bold';
        style.marginBottom = '0.75rem';
      } else if (element.tagName === 'h3') {
        style.fontSize = '1.25rem';
        style.fontWeight = 'bold';
        style.marginBottom = '0.5rem';
      } else if (element.tagName === 'p') {
        style.marginBottom = '1rem';
        style.lineHeight = '1.5';
      } else if (element.tagName === 'img') {
        style.maxWidth = '100%';
        style.height = 'auto';
      } else if (element.tagName === 'section') {
        style.width = '100%';
        style.display = 'block';
      }
      
      // Extract attributes
      const attrs: any = {};
      if ('attributes' in element && element.attributes) {
        Object.entries(element.attributes).forEach(([key, value]) => {
          if (key === 'src' || key === 'alt' || key === 'href') {
            attrs[key] = value;
          } else if (key === 'class') {
            attrs.className = value;
          }
        });
      }
      
      return (
        <Tag
          key={element.id}
          style={style}
          {...attrs}
        >
          {'children' in element && element.children && 
            element.children.map(renderElement)
          }
        </Tag>
      );
    }
    
    // Handle repeat containers and other special elements
    const anyElement = element as any;
    if (anyElement.type === 'repeat-container') {
      return (
        <div key={anyElement.id} style={{ display: 'block', width: '100%' }}>
          {anyElement.items?.map(renderElement)}
        </div>
      );
    }
    
    if (anyElement.type === 'repeat-item') {
      return (
        <div key={anyElement.id} style={{ display: 'block', marginBottom: '0.5rem' }}>
          {anyElement.children?.map(renderElement)}
        </div>
      );
    }
    
    return null;
  };

  return (
    <div 
      className="preview-content" 
      style={{ 
        width: '1500px',
        fontSize: '16px',
        lineHeight: '1.5',
        overflow: 'visible'
      }}
    >
      {renderElement(section)}
    </div>
  );
};