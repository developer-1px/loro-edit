// src/components/ui/InspectorPanel.tsx

import React from 'react';
import type { ParsedElement, SelectionState } from '../../types';
import { pluginManager } from '../../plugins/PluginManager';

interface InspectorPanelProps {
  selection: SelectionState;
  parsedElements: ParsedElement[];
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  selection,
  parsedElements,
}) => {
  const selectedElement = selection.selectedElementId 
    ? findElementById(parsedElements, selection.selectedElementId)
    : null;

  const selectedPlugin = selection.selectedElementId 
    ? pluginManager.getPluginById(selection.selectedElementId)
    : null;

  return (
    <div className="h-full bg-white border-l border-gray-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h2 className="text-sm font-semibold text-gray-900">Inspector</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Selection Status */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h3 className="text-xs font-medium text-blue-900 mb-2">Selection Status</h3>
          <div className="space-y-1 text-xs">
            <div>
              <span className="text-blue-700">Mode:</span>{' '}
              <span className="font-mono bg-blue-100 px-1 rounded">{selection.mode}</span>
            </div>
            <div>
              <span className="text-blue-700">Selected ID:</span>{' '}
              <span className="font-mono bg-blue-100 px-1 rounded text-xs break-all">
                {selection.selectedElementId || 'None'}
              </span>
            </div>
          </div>
        </div>

        {/* Selected Element */}
        {selectedElement ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <h3 className="text-xs font-medium text-green-900 mb-2">Selected Element</h3>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-green-700">Type:</span>{' '}
                <span className="font-mono bg-green-100 px-1 rounded">{selectedElement.type}</span>
              </div>
              {('tagName' in selectedElement) && (
                <div>
                  <span className="text-green-700">Tag:</span>{' '}
                  <span className="font-mono bg-green-100 px-1 rounded">{selectedElement.tagName}</span>
                </div>
              )}
              {('attributes' in selectedElement) && selectedElement.attributes && (
                <div>
                  <span className="text-green-700">Classes:</span>{' '}
                  <span className="font-mono bg-green-100 px-1 rounded text-xs break-all">
                    {selectedElement.attributes.class || 'None'}
                  </span>
                </div>
              )}
              <div>
                <span className="text-green-700">Children:</span>{' '}
                <span className="font-mono bg-green-100 px-1 rounded">
                  {'children' in selectedElement ? selectedElement.children?.length || 0 : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-600">No element selected</p>
          </div>
        )}

        {/* Selected Plugin */}
        {selectedPlugin ? (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <h3 className="text-xs font-medium text-purple-900 mb-2">Active Plugin</h3>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-purple-700">Name:</span>{' '}
                <span className="font-mono bg-purple-100 px-1 rounded">{selectedPlugin.name}</span>
              </div>
              <div>
                <span className="text-purple-700">Selectable:</span>{' '}
                <span className="font-mono bg-purple-100 px-1 rounded">
                  {selectedPlugin.selectable?.enabled ? 'Yes' : 'No'}
                </span>
              </div>
              {selectedPlugin.selectable?.enabled && (
                <>
                  <div>
                    <span className="text-purple-700">Level:</span>{' '}
                    <span className="font-mono bg-purple-100 px-1 rounded">
                      {selectedPlugin.selectable.level}
                    </span>
                  </div>
                  <div>
                    <span className="text-purple-700">Priority:</span>{' '}
                    <span className="font-mono bg-purple-100 px-1 rounded">
                      {selectedPlugin.selectable.priority}
                    </span>
                  </div>
                  <div>
                    <span className="text-purple-700">Color:</span>{' '}
                    <span 
                      className="inline-block w-4 h-4 rounded border ml-1"
                      style={{ backgroundColor: selectedPlugin.selectable.color }}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        ) : selection.selectedElementId ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <h3 className="text-xs font-medium text-red-900 mb-2">Plugin Error</h3>
            <p className="text-xs text-red-700">
              No plugin found for selected element
            </p>
          </div>
        ) : null}

        {/* All Registered Plugins */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <h3 className="text-xs font-medium text-gray-900 mb-2">Registered Plugins</h3>
          <div className="space-y-1">
            {pluginManager.plugins.map((plugin) => (
              <div key={plugin.name} className="flex items-center justify-between text-xs">
                <span className="font-mono">{plugin.name}</span>
                <span className={`px-1 rounded text-xs ${
                  plugin.selectable?.enabled 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {plugin.selectable?.enabled ? 'Selectable' : 'Not Selectable'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Debug Info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <h3 className="text-xs font-medium text-yellow-900 mb-2">Debug Info</h3>
          <div className="space-y-1 text-xs">
            <div>
              <span className="text-yellow-700">Total Elements:</span>{' '}
              <span className="font-mono bg-yellow-100 px-1 rounded">
                {countAllElements(parsedElements)}
              </span>
            </div>
            <div>
              <span className="text-yellow-700">Click Handler:</span>{' '}
              <span className="font-mono bg-yellow-100 px-1 rounded">
                Check console for click events
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions
function findElementById(elements: ParsedElement[], id: string): ParsedElement | null {
  for (const element of elements) {
    if (element.id === id) return element;
    if ('children' in element && element.children) {
      const found = findElementById(element.children, id);
      if (found) return found;
    }
  }
  return null;
}

function countAllElements(elements: ParsedElement[]): number {
  let count = elements.length;
  for (const element of elements) {
    if ('children' in element && element.children) {
      count += countAllElements(element.children);
    }
  }
  return count;
}