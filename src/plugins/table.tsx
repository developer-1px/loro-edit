// src/plugins/table.tsx

import React, { useState, useEffect } from "react";
import type { Plugin } from "./types";
import type { RegularElement } from "../types";
import { parseBasicElement, createElementProps } from "./utils";
import { TableFloatingUI } from "./table/TableFloatingUI";

interface TableData {
  apiUrl: string;
  columns: string[];
  data: Record<string, any>[];
  loading: boolean;
  error: string | null;
}

const TableComponent: React.FC<{
  element: RegularElement;
  isSelected: boolean;
}> = ({ element, isSelected }) => {
  const [tableData, setTableData] = useState<TableData>({
    apiUrl: element.attributes?.['data-api-url'] || '',
    columns: element.attributes?.['data-columns']?.split(',') || [],
    data: [],
    loading: false,
    error: null
  });

  // Fetch data when API URL changes or refresh is triggered
  useEffect(() => {
    const apiUrl = element.attributes?.['data-api-url'];
    if (apiUrl) {
      fetchTableData(apiUrl);
    }
  }, [element.attributes?.['data-api-url'], element.attributes?.['data-refresh']]);

  const fetchTableData = async (url: string) => {
    setTableData(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch data');
      
      const data = await response.json();
      const dataArray = Array.isArray(data) ? data : [data];
      
      setTableData(prev => ({ 
        ...prev, 
        data: dataArray,
        loading: false 
      }));
    } catch (error) {
      setTableData(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to load data',
        loading: false 
      }));
    }
  };

  const displayColumns = tableData.columns.length > 0 
    ? tableData.columns 
    : tableData.data.length > 0 
      ? Object.keys(tableData.data[0])
      : [];

  return (
    <div 
      {...createElementProps(element, isSelected)}
      className={`${element.attributes?.class || ''} overflow-x-auto`}
    >
      {tableData.loading && (
        <div className="text-center py-4 text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p className="text-sm">Loading data...</p>
        </div>
      )}

      {tableData.error && (
        <div className="text-center py-4 text-red-500">
          <p className="text-sm">{tableData.error}</p>
        </div>
      )}

      {!tableData.loading && !tableData.error && tableData.data.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          <p className="text-sm">No data available. Configure API in floating menu.</p>
        </div>
      )}

      {!tableData.loading && !tableData.error && tableData.data.length > 0 && (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {displayColumns.map((column) => (
                <th
                  key={column}
                  className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tableData.data.slice(0, 10).map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                {displayColumns.map((column) => (
                  <td
                    key={column}
                    className="px-3 py-2 whitespace-nowrap text-xs text-gray-900"
                  >
                    {typeof row[column] === 'object' 
                      ? JSON.stringify(row[column])
                      : String(row[column] || '')
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export const tablePlugin: Plugin = {
  name: "table",
  
  selectable: {
    enabled: true,
    name: "Table",
    color: "#8b5cf6", // purple
    level: "element",
    elementType: "block",
    priority: 1
  },

  floatingUI: {
    enabled: true,
    position: 'top',
    offset: 8,
    render: TableFloatingUI
  },

  match: (element: Element) => 
    element.tagName.toLowerCase() === "table" ||
    element.hasAttribute("data-table"),

  parse: (element: Element) => parseBasicElement(element, "element"),

  render: ({ parsedElement, isSelected }) => {
    const element = parsedElement as RegularElement;
    
    return (
      <TableComponent 
        element={element} 
        isSelected={isSelected || false} 
      />
    );
  },
};