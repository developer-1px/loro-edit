import React, { useState } from 'react';
import { X, Plus, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { useEditorStore } from '../../store/editorStore';
import { parseAndRenderHTML } from '../../utils/htmlParser';
import { TEMPLATE_CATEGORIES, getTemplatesByCategory } from '../../data/sectionTemplates';
import type { SectionTemplate } from '../../types';

interface SectionTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  insertPosition?: number;
}

export const SectionTemplateModal: React.FC<SectionTemplateModalProps> = ({
  isOpen,
  onClose,
  insertPosition,
}) => {
  const { addSection, updateSectionElements } = useEditorStore();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

  const filteredTemplates = getTemplatesByCategory(selectedCategory).filter(
    template => 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSection = (template: SectionTemplate) => {
    // Add the section to the store
    addSection(template, insertPosition);
    
    // Parse the template HTML and update the section elements
    const parsedElements = parseAndRenderHTML(template.html);
    
    // Get the newly created section (it's the last one if no position specified)
    const sections = useEditorStore.getState().sections;
    const newSection = insertPosition !== undefined 
      ? sections[insertPosition]
      : sections[sections.length - 1];
    
    if (newSection) {
      updateSectionElements(newSection.id, parsedElements);
    }
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col bg-gray-900 text-white border-gray-800">
        <DialogHeader className="border-b border-gray-800 pb-4">
          <DialogTitle className="text-xl font-bold flex items-center justify-between">
            <span>Add Section</span>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-800 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </DialogTitle>
        </DialogHeader>

        {/* Search and Filter */}
        <div className="p-4 border-b border-gray-800 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search sections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {TEMPLATE_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Template Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="relative group cursor-pointer"
                onMouseEnter={() => setHoveredTemplate(template.id)}
                onMouseLeave={() => setHoveredTemplate(null)}
                onClick={() => handleAddSection(template)}
              >
                <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:border-blue-500 transition-all">
                  {/* Thumbnail Preview */}
                  <div className="h-32 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center relative overflow-hidden">
                    <span className="text-3xl">{template.thumbnail}</span>
                    
                    {/* HTML Preview on Hover */}
                    {hoveredTemplate === template.id && (
                      <div className="absolute inset-0 bg-gray-900 bg-opacity-95 p-2 overflow-hidden">
                        <div className="text-xs text-gray-400 font-mono overflow-hidden">
                          <pre className="whitespace-pre-wrap">{template.html.substring(0, 150)}...</pre>
                        </div>
                      </div>
                    )}
                    
                    {/* Add Button Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                      <button className="bg-blue-600 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity transform scale-90 group-hover:scale-100">
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Template Info */}
                  <div className="p-3">
                    <h3 className="font-medium text-sm mb-1">{template.name}</h3>
                    <p className="text-xs text-gray-400">{template.description}</p>
                    <div className="mt-2">
                      <span className="text-xs text-blue-400 bg-blue-500 bg-opacity-20 px-2 py-0.5 rounded">
                        {template.category}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-sm">No sections found matching your criteria</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};