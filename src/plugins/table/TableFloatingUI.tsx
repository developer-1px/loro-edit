// src/plugins/table/TableFloatingUI.tsx

import React, { useState, useEffect } from 'react';
import { Database, Columns, RefreshCw } from 'lucide-react';
import { FloatingDropdown, FloatingInput, FloatingToolbar } from '../../features/floating-ui';
import type { DropdownItem, ToolbarButton } from '../../features/floating-ui';
import type { FloatingUIRenderProps } from '../types';
import type { RegularElement } from '../../types';

// Common API presets
const API_PRESETS = [
  { id: 'users', label: 'Users', url: 'https://jsonplaceholder.typicode.com/users' },
  { id: 'posts', label: 'Posts', url: 'https://jsonplaceholder.typicode.com/posts' },
  { id: 'todos', label: 'Todos', url: 'https://jsonplaceholder.typicode.com/todos' },
  { id: 'custom', label: 'Custom API', url: '' }
];

export const TableFloatingUI: React.FC<FloatingUIRenderProps> = ({
  element,
  updateElement,
  selectionColor
}) => {
  const tableElement = element as RegularElement;
  const currentApiUrl = tableElement.attributes?.['data-api-url'] || '';
  const currentColumns = tableElement.attributes?.['data-columns']?.split(',').filter(Boolean) || [];
  
  const [showApiConfig, setShowApiConfig] = useState(true);
  const [showColumnConfig, setShowColumnConfig] = useState(false);
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(currentColumns);
  
  // Fetch sample data to get available columns
  useEffect(() => {
    if (currentApiUrl) {
      fetchColumns(currentApiUrl);
    }
  }, [currentApiUrl]);

  const fetchColumns = async (url: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) return;
      
      const data = await response.json();
      const firstItem = Array.isArray(data) ? data[0] : data;
      
      if (firstItem) {
        const columns = Object.keys(firstItem);
        setAvailableColumns(columns);
        
        // If no columns selected yet, select all
        if (selectedColumns.length === 0) {
          setSelectedColumns(columns);
        }
      }
    } catch (error) {
      console.error('Failed to fetch columns:', error);
    }
  };

  const handleApiChange = (url: string) => {
    updateElement(element.id, {
      attributes: {
        ...tableElement.attributes,
        'data-api-url': url
      }
    });
  };

  const handleColumnToggle = (column: string) => {
    const newColumns = selectedColumns.includes(column)
      ? selectedColumns.filter(c => c !== column)
      : [...selectedColumns, column];
    
    setSelectedColumns(newColumns);
    
    updateElement(element.id, {
      attributes: {
        ...tableElement.attributes,
        'data-columns': newColumns.join(',')
      }
    });
  };

  const handleRefresh = () => {
    // Trigger a re-fetch by updating a timestamp attribute
    updateElement(element.id, {
      attributes: {
        ...tableElement.attributes,
        'data-refresh': Date.now().toString()
      }
    });
  };

  const toolbarButtons: ToolbarButton[] = [
    {
      id: 'api',
      label: 'API',
      icon: <Database className="w-3 h-3" />,
      onClick: () => {
        setShowApiConfig(!showApiConfig);
        setShowColumnConfig(false);
      },
      isActive: showApiConfig
    },
    {
      id: 'columns',
      label: 'Columns',
      icon: <Columns className="w-3 h-3" />,
      onClick: () => {
        setShowColumnConfig(!showColumnConfig);
        setShowApiConfig(false);
      },
      isActive: showColumnConfig
    },
    {
      id: 'refresh',
      label: 'Refresh',
      icon: <RefreshCw className="w-3 h-3" />,
      onClick: handleRefresh
    }
  ];

  const apiPresetItems: DropdownItem[] = API_PRESETS.map(preset => ({
    id: preset.id,
    label: preset.label,
    onClick: () => {
      if (preset.url) {
        handleApiChange(preset.url);
      }
    },
    isActive: currentApiUrl === preset.url
  }));

  return (
    <div className="flex flex-col gap-1">
      <FloatingToolbar buttons={toolbarButtons} selectionColor={selectionColor} />
      
      {showApiConfig && (
        <div className="flex items-center gap-1">
          <FloatingDropdown
            items={apiPresetItems}
            placeholder="Select API"
            selectionColor={selectionColor}
          />
          
          <FloatingInput
            value={currentApiUrl}
            onChange={() => {}}
            onSave={handleApiChange}
            placeholder="Enter API URL..."
            type="url"
            width="w-48"
            selectionColor={selectionColor}
          />
        </div>
      )}
      
      {showColumnConfig && availableColumns.length > 0 && (
        <div className="bg-gray-900 rounded p-1.5 max-w-xs" style={{ borderWidth: '1px', borderStyle: 'solid', borderColor: `${selectionColor}30` }}>
          <div className="text-[9px] text-gray-400 mb-1">Select columns to display:</div>
          <div className="grid grid-cols-2 gap-0.5">
            {availableColumns.map((column) => (
              <label
                key={column}
                className="flex items-center gap-1 p-0.5 rounded hover:bg-gray-800 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedColumns.includes(column)}
                  onChange={() => handleColumnToggle(column)}
                  className="w-3 h-3 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-0"
                />
                <span className="text-[10px] text-gray-300">{column}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};