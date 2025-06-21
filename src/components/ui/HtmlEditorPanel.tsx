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
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Code2 className="w-5 h-5 text-gray-700" />
          <span className="text-sm text-gray-600">TailwindCSS HTML</span>
        </div>

        <button
          onClick={onApplyHtml}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors mb-4 flex items-center justify-center gap-2"
          title="Apply HTML changes"
        >
          <Eye className="w-4 h-4" />
          Apply
        </button>

        <div className="flex justify-between text-xs text-gray-500">
          <span>History: {pastStates}</span>
          <span>Future: {futureStates}</span>
        </div>
      </div>

      <div className="flex-1 p-4">
        <textarea
          value={htmlInput}
          onChange={(e) => onHtmlInputChange(e.target.value)}
          className="w-full h-full p-3 border border-gray-300 rounded-md font-mono text-xs resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter your TailwindCSS HTML here..."
          spellCheck={false}
        />
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex items-center gap-2">
            <kbd className="bg-gray-100 px-1 rounded text-xs">ESC</kbd>
            <span>Deselect</span>
          </div>
          <div className="flex items-center gap-2">
            <Copy className="w-3 h-3" />
            <kbd className="bg-gray-100 px-1 rounded text-xs">⌘+C</kbd>
            <span>Copy</span>
          </div>
          <div className="flex items-center gap-2">
            <Scissors className="w-3 h-3" />
            <kbd className="bg-gray-100 px-1 rounded text-xs">⌘+X</kbd>
            <span>Cut</span>
          </div>
          <div className="flex items-center gap-2">
            <Clipboard className="w-3 h-3" />
            <kbd className="bg-gray-100 px-1 rounded text-xs">⌘+V</kbd>
            <span>Paste</span>
          </div>
          <div className="flex items-center gap-2">
            <Trash2 className="w-3 h-3" />
            <kbd className="bg-gray-100 px-1 rounded text-xs">Del</kbd>
            <span>Delete</span>
          </div>
        </div>
      </div>
    </>
  );
};