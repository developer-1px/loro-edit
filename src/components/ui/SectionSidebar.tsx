// src/components/ui/SectionSidebar.tsx

import React, { useState } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { useHistory } from '../../features/history';
import { SectionPreview } from './SectionPreview';
import { DesignBlockLibrary } from './DesignBlockLibrary';
import { PlusIcon, LayoutGridIcon } from 'lucide-react';

export const SectionSidebar: React.FC = () => {
  const { parsedElements, setSelection, selection } = useEditorStore();
  const { executeMoveSection } = useHistory();
  const [activeTab, setActiveTab] = useState<'sections' | 'library'>('sections');

  // Extract sections from parsed elements (recursively search)
  const findSections = (elements: any[]): any[] => {
    const sections: any[] = [];
    
    const searchInElement = (element: any) => {
      if (element.type === 'element' && 'tagName' in element && element.tagName === 'section') {
        sections.push(element);
      }
      
      if (element.children && Array.isArray(element.children)) {
        element.children.forEach(searchInElement);
      }
    };
    
    elements.forEach(searchInElement);
    return sections;
  };
  
  const sections = findSections(parsedElements);

  const handleSectionMove = (fromIndex: number, toIndex: number) => {
    if (fromIndex !== toIndex) {
      executeMoveSection(fromIndex, toIndex);
    }
  };

  const handleSectionSelect = (sectionId: string) => {
    setSelection({
      selectedElementId: sectionId,
      mode: 'block'
    });
  };

  return (
    <div className="w-48 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-white">
        <h2 className="text-sm font-semibold text-gray-900">Pages</h2>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setActiveTab('sections')}
            className={`p-1.5 rounded ${
              activeTab === 'sections' 
                ? 'bg-blue-100 text-blue-600' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
            title="Sections"
          >
            <LayoutGridIcon size={14} />
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`p-1.5 rounded ${
              activeTab === 'library' 
                ? 'bg-blue-100 text-blue-600' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
            title="Design Library"
          >
            <PlusIcon size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'sections' ? (
          <div className="p-2 space-y-2">
            {sections.map((section, index) => (
              <SectionPreview
                key={section.id}
                section={section}
                index={index}
                isSelected={selection.selectedElementId === section.id}
                onMove={handleSectionMove}
                onSelect={handleSectionSelect}
              />
            ))}
            {sections.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <LayoutGridIcon size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-xs">No sections found</p>
              </div>
            )}
          </div>
        ) : (
          <DesignBlockLibrary />
        )}
      </div>
    </div>
  );
};