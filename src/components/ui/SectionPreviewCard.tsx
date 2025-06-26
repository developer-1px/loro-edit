import React from 'react';
import { Trash2Icon } from 'lucide-react';
import type { Section } from '../../types';
import { SectionPreviewRenderer } from './SectionPreviewRenderer';

interface SectionPreviewCardProps {
  section: Section;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export const SectionPreviewCard: React.FC<SectionPreviewCardProps> = ({
  section,
  index,
  isSelected,
  onSelect,
  onDelete,
}) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <div
      className={`group relative bg-white border rounded-lg overflow-hidden cursor-pointer transition-all ${
        isSelected
          ? 'border-blue-500 shadow-lg ring-2 ring-blue-200'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
      }`}
      onClick={onSelect}
    >
      {/* Preview Only */}
      <div className="relative bg-gray-50 overflow-hidden">
        <SectionPreviewRenderer 
          section={section} 
          scale={0.1}
          className=""
        />
        
        {/* Hover overlay */}
        <div className={`absolute inset-0 bg-black transition-opacity ${
          isSelected ? 'bg-opacity-10' : 'bg-opacity-0 group-hover:bg-opacity-10'
        }`} />

        {/* Delete button */}
        <button
          onClick={handleDelete}
          className={`absolute top-1 right-1 p-0.5 bg-white/80 backdrop-blur-sm rounded text-gray-400 hover:text-red-600 transition-all ${
            isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
          title="Delete (Del)"
        >
          <Trash2Icon size={10} />
        </button>
        
        {/* Position indicator */}
        <div className={`absolute bottom-1 left-1 px-1 py-0.5 bg-black/60 text-white text-[9px] rounded transition-opacity ${
          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
        }`}>
          {index + 1}
        </div>
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-blue-500" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-blue-500" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-blue-500" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-blue-500" />
        </div>
      )}
    </div>
  );
};