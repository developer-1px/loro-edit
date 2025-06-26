// src/components/ui/SectionSidebar.tsx

import React, { useState } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { SectionTemplateModal } from './SectionTemplateModal';
import { SectionPreviewCard } from './SectionPreviewCard';
import { PlusIcon, LayoutGridIcon } from 'lucide-react';

export const SectionSidebar: React.FC = () => {
  const { sections, setSelection, selection, removeSection } = useEditorStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSectionSelect = (sectionId: string) => {
    setSelection({
      selectedElementId: sectionId,
      mode: 'block'
    });
  };

  const handleSectionDelete = (sectionId: string) => {
    removeSection(sectionId);
  };

  return (
    <>
      <div className="w-40 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-2 py-1.5 border-b border-gray-200 bg-white">
          <h2 className="text-xs font-semibold text-gray-700">Sections</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            title="Add Section"
          >
            <PlusIcon size={12} />
          </button>
        </div>

        {/* Section List */}
        <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
          {sections.map((section, index) => (
            <SectionPreviewCard
              key={section.id}
              section={section}
              index={index}
              isSelected={selection.selectedElementId === section.id}
              onSelect={() => handleSectionSelect(section.id)}
              onDelete={() => handleSectionDelete(section.id)}
            />
          ))}
          
          {sections.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <LayoutGridIcon size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-xs mb-3">No sections yet</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition-colors"
              >
                Add First Section
              </button>
            </div>
          )}
        </div>

        {/* Add Section Button at Bottom */}
        {sections.length > 0 && (
          <div className="p-1.5 border-t border-gray-200">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full py-1.5 border border-dashed border-gray-300 rounded text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors text-[10px] font-medium"
            >
              + Add Section
            </button>
          </div>
        )}
      </div>

      {/* Section Template Modal */}
      <SectionTemplateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};