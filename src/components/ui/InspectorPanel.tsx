// src/components/ui/InspectorPanel.tsx

import React, { useState } from 'react';
import { History, Target, Keyboard, Download } from 'lucide-react';
import type { ParsedElement, SelectionState } from '../../types';
import { HistoryInspector } from './HistoryInspector';
import { SelectionInspector } from './SelectionInspector';
import { KeyboardInspector } from './KeyboardInspector';
import { Button } from './button';
import { useEditorStore } from '../../store/editorStore';

interface InspectorPanelProps {
  selection: SelectionState;
  parsedElements: ParsedElement[];
}

type TabType = 'history' | 'selection' | 'keyboard';

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  selection,
  parsedElements,
}) => {
  // History가 기본 탭
  const [activeTab, setActiveTab] = useState<TabType>('history');
  const { generateFullHtml, sections } = useEditorStore();
  
  const handleExportHtml = () => {
    const html = generateFullHtml();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exported-page.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const tabs = [
    {
      id: 'history' as TabType,
      label: 'History',
      icon: History,
      component: <HistoryInspector />
    },
    {
      id: 'selection' as TabType,
      label: 'Selection',
      icon: Target,
      component: <SelectionInspector selection={selection} parsedElements={parsedElements} />
    },
    {
      id: 'keyboard' as TabType,
      label: 'Keyboard',
      icon: Keyboard,
      component: <KeyboardInspector />
    }
  ];

  return (
    <div className="h-full bg-white border-l border-gray-200 flex flex-col">
      {/* Export Button */}
      <div className="p-2 border-b border-gray-200">
        <Button
          onClick={handleExportHtml}
          disabled={sections.length === 0}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-1.5"
        >
          <Download className="w-3 h-3 mr-1.5" />
          Export HTML
        </Button>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex-shrink-0 border-b border-gray-200">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <Button
                key={tab.id}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 rounded-none border-0 h-8 flex items-center justify-center gap-0.5 ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500' 
                    : 'hover:bg-gray-50 text-gray-600 border-b-2 border-transparent'
                }`}
                title={tab.label}
              >
                <Icon className="w-2.5 h-2.5" />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {tabs.find(tab => tab.id === activeTab)?.component}
      </div>
    </div>
  );
};