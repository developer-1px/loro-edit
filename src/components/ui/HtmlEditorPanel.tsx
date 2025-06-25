// src/components/ui/HtmlEditorPanel.tsx

import React from 'react';
import { Code2, Eye, Copy, Scissors, Clipboard, Trash2 } from 'lucide-react';

interface HtmlEditorPanelProps {
  htmlInput: string;
  onHtmlInputChange: (html: string) => void;
  onApplyHtml: () => void;
  pastStates?: number;
  futureStates?: number;
}

export const HtmlEditorPanel: React.FC<HtmlEditorPanelProps> = ({
  htmlInput,
  onHtmlInputChange,
  onApplyHtml,
  pastStates = 0,
  futureStates = 0,
}) => {
  return (
    <>
      <div className="p-2 border-b border-gray-200">
        <div className="flex items-center gap-1.5 mb-2">
          <Code2 className="w-4 h-4 text-gray-700" />
          <span className="text-xs text-gray-600">TailwindCSS HTML</span>
        </div>

        <button
          onClick={onApplyHtml}
          className="w-full px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors mb-2 flex items-center justify-center gap-1.5 text-xs"
          title="Apply HTML changes"
        >
          <Eye className="w-3.5 h-3.5" />
          Apply
        </button>

        <div className="flex justify-between text-[10px] text-gray-500">
          <span>History: {pastStates}</span>
          <span>Future: {futureStates}</span>
        </div>
      </div>

      <div className="flex-1 p-2">
        <textarea
          value={htmlInput}
          onChange={(e) => onHtmlInputChange(e.target.value)}
          className="w-full h-full p-2 border border-gray-300 rounded font-mono text-[11px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter your TailwindCSS HTML here..."
          spellCheck={false}
        />
      </div>

      <div className="p-2 border-t border-gray-200 bg-gray-50">
        <div className="text-[10px] text-gray-500 space-y-0.5">
          <div className="flex items-center gap-2">
            <kbd className="bg-gray-100 px-0.5 rounded text-[9px]">ESC</kbd>
            <span>Deselect</span>
          </div>
          <div className="flex items-center gap-2">
            <Copy className="w-2.5 h-2.5" />
            <kbd className="bg-gray-100 px-0.5 rounded text-[9px]">⌘+C</kbd>
            <span>Copy</span>
          </div>
          <div className="flex items-center gap-2">
            <Scissors className="w-2.5 h-2.5" />
            <kbd className="bg-gray-100 px-0.5 rounded text-[9px]">⌘+X</kbd>
            <span>Cut</span>
          </div>
          <div className="flex items-center gap-2">
            <Clipboard className="w-2.5 h-2.5" />
            <kbd className="bg-gray-100 px-0.5 rounded text-[9px]">⌘+V</kbd>
            <span>Paste</span>
          </div>
          <div className="flex items-center gap-2">
            <Trash2 className="w-2.5 h-2.5" />
            <kbd className="bg-gray-100 px-0.5 rounded text-[9px]">Del</kbd>
            <span>Delete</span>
          </div>
        </div>
      </div>
    </>
  );
};