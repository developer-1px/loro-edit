// src/plugins/database.tsx

import React, { useState, useRef, useEffect } from "react";
import { useAsyncOperation } from "../hooks/useAsyncOperation";
import {
  Table,
  Grid,
  Settings,
  Plus,
  Save,
  X,
  ExternalLink,
  Database,
  ChevronLeft,
  ChevronRight,
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Globe,
} from "lucide-react";
import type { Plugin } from "./types";
import type { DatabaseElement, DatabaseRecord, DatabaseColumn } from "../types";
import { useEditorStore } from "../store/editorStore";

interface DatabaseCardProps {
  record: DatabaseRecord;
  columns: DatabaseColumn[];
}

const DatabaseCard: React.FC<DatabaseCardProps> = ({ record, columns }) => {
  // Helper function to get appropriate icon for field
  const getFieldIcon = (columnId: string, columnName: string) => {
    const id = columnId.toLowerCase();
    const name = columnName.toLowerCase();

    if (id.includes("email") || name.includes("email"))
      return <Mail className="w-4 h-4" />;
    if (id.includes("phone") || name.includes("phone"))
      return <Phone className="w-4 h-4" />;
    if (
      id.includes("address") ||
      name.includes("location") ||
      name.includes("city")
    )
      return <MapPin className="w-4 h-4" />;
    if (id.includes("company") || name.includes("company"))
      return <Building className="w-4 h-4" />;
    if (id.includes("website") || name.includes("website"))
      return <Globe className="w-4 h-4" />;
    if (id.includes("name") || name.includes("name"))
      return <User className="w-4 h-4" />;
    return <User className="w-4 h-4" />;
  };

  // Get avatar/profile image
  const getAvatarUrl = (record: DatabaseRecord): string => {
    // Try common avatar field names
    const avatarFields = [
      "avatar",
      "image",
      "photo",
      "picture",
      "profileImage",
    ];
    for (const field of avatarFields) {
      const value = record[field];
      if (value && typeof value === 'string') return value;
    }
    // Generate avatar based on name or email
    const name = String(record.name || record.email || record.id);
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=6366f1&color=fff&size=80`;
  };

  // Get primary display name
  const getDisplayName = (record: DatabaseRecord) => {
    return String(
      record.name || record.username || record.email || `User ${record.id}`
    );
  };

  // Get secondary info
  const getSecondaryInfo = (record: DatabaseRecord) => {
    if (record.email && record.name) return String(record.email);
    const company = record.company;
    if (company && typeof company === 'object' && company !== null && 'name' in company) {
      const companyObj = company as { name: string | number | boolean | null };
      if (companyObj.name) return String(companyObj.name);
    }
    if (record.phone) return String(record.phone);
    return null;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 hover:shadow-lg transition-all duration-300 group">
      {/* Header with Avatar */}
      <div className="flex items-start gap-4 mb-4">
        <div className="flex-shrink-0">
          <img
            src={getAvatarUrl(record)}
            alt={getDisplayName(record)}
            className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                getDisplayName(record)
              )}&background=6366f1&color=fff&size=80`;
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-lg truncate">
            {getDisplayName(record)}
          </h3>
          {getSecondaryInfo(record) && (
            <p className="text-sm text-gray-600 truncate mt-1">
              {getSecondaryInfo(record)}
            </p>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3">
        {columns.slice(0, 4).map((column) => {
          const value = record[column.id];
          if (
            !value ||
            column.id === "name" ||
            column.id === "email" ||
            column.id === "id"
          )
            return null;

          return (
            <div key={column.id} className="flex items-center gap-3">
              <div className="flex-shrink-0 text-gray-400">
                {getFieldIcon(column.id, column.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-900">
                  {column.type === "checkbox" ? (
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        value
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {value ? "✓ Active" : "✗ Inactive"}
                    </span>
                  ) : column.type === "select" ||
                    column.type === "multiselect" ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {Array.isArray(value) ? value.join(", ") : String(value)}
                    </span>
                  ) : typeof value === "object" && value && value !== null && 'name' in value ? (
                    <span className="truncate">{String((value as { name: string | number | boolean | null }).name)}</span>
                  ) : typeof value === "object" && value && value !== null && 'city' in value ? (
                    <span className="truncate">{String((value as { city: string | number | boolean | null }).city)}</span>
                  ) : (
                    <span className="truncate">{String(value)}</span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {column.name}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Action */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors group-hover:text-blue-700">
          View Details →
        </button>
      </div>
    </div>
  );
};

interface DatabaseCardSliderProps {
  data: DatabaseRecord[];
  columns: DatabaseColumn[];
}

const DatabaseCardSlider: React.FC<DatabaseCardSliderProps> = ({
  data,
  columns,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", checkScrollButtons);
      return () =>
        scrollContainer.removeEventListener("scroll", checkScrollButtons);
    }
  }, [data]);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 312; // Card width (288px) + gap (24px)
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft +
        (direction === "left" ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative">
      {/* Scroll buttons */}
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 rounded-full p-2 shadow-md hover:shadow-lg transition-all duration-200 hover:bg-gray-50"
          style={{ marginLeft: "-20px" }}
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
      )}

      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 rounded-full p-2 shadow-md hover:shadow-lg transition-all duration-200 hover:bg-gray-50"
          style={{ marginRight: "-20px" }}
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      )}

      {/* Cards container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto pb-4"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {data.map((record) => (
          <div key={record.id} className="flex-shrink-0 w-72">
            <DatabaseCard record={record} columns={columns} />
          </div>
        ))}
      </div>

      {/* Gradient overlays for visual effect */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
    </div>
  );
};

interface DatabaseTableProps {
  data: DatabaseRecord[];
  columns: DatabaseColumn[];
}

const DatabaseTable: React.FC<DatabaseTableProps> = ({ data, columns }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-gray-200">
            {columns.map((column) => (
              <th
                key={column.id}
                className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider bg-gray-50"
              >
                {column.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white">
          {data.map((record, index) => (
            <tr
              key={record.id}
              className={`${
                index % 2 === 0 ? "bg-white" : "bg-gray-50"
              } hover:bg-blue-50 transition-colors duration-150`}
            >
              {columns.map((column) => (
                <td key={column.id} className="px-4 py-3 text-sm text-gray-900">
                  {column.type === "checkbox" ? (
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        record[column.id]
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {record[column.id] ? "✓" : "✗"}
                    </span>
                  ) : column.type === "select" ||
                    column.type === "multiselect" ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {Array.isArray(record[column.id])
                        ? (record[column.id] as unknown as string[]).join(", ")
                        : String(record[column.id])}
                    </span>
                  ) : (
                    <span className="block truncate max-w-xs">
                      {record[column.id] || "-"}
                    </span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

interface DatabaseSettingsProps {
  element: DatabaseElement;
  onClose: () => void;
}

const DatabaseSettings: React.FC<DatabaseSettingsProps> = ({
  element,
  onClose,
}) => {
  const [apiUrl, setApiUrl] = useState(element.apiUrl);
  const [columns, setColumns] = useState(element.columns);
  const handleUpdateSettings = useEditorStore(
    (state) => state.handleDatabaseSettingsUpdate
  );

  const addColumn = () => {
    setColumns([...columns, { id: "", name: "", type: "text" }]);
  };

  const updateColumn = (index: number, updates: Partial<DatabaseColumn>) => {
    const newColumns = [...columns];
    newColumns[index] = { ...newColumns[index], ...updates };
    setColumns(newColumns);
  };

  const removeColumn = (index: number) => {
    setColumns(columns.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    // Basic validation
    if (!apiUrl || columns.some((c) => !c.id || !c.name)) {
      alert("API URL and all column IDs and names are required.");
      return;
    }
    handleUpdateSettings(element.id, apiUrl, columns);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Database Settings
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API URL
            </label>
            <input
              type="url"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://api.example.com/data"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Columns
              </label>
              <button
                onClick={addColumn}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                <Plus className="w-4 h-4" />
                Add Column
              </button>
            </div>

            <div className="space-y-3">
              {columns.map((column, index) => (
                <div
                  key={column.id}
                  className="flex gap-3 items-center p-3 border border-gray-200 rounded"
                >
                  <input
                    type="text"
                    value={column.name}
                    onChange={(e) =>
                      updateColumn(index, { name: e.target.value })
                    }
                    className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Column name"
                  />
                  <select
                    value={column.type}
                    onChange={(e) =>
                      updateColumn(index, {
                        type: e.target.value as DatabaseColumn["type"],
                      })
                    }
                    className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="select">Select</option>
                    <option value="multiselect">Multi-select</option>
                    <option value="checkbox">Checkbox</option>
                  </select>
                  <button
                    onClick={() => removeColumn(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

interface DatabaseViewProps {
  element: DatabaseElement;
}

const DatabaseView: React.FC<DatabaseViewProps> = ({
  element,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const handleViewModeChange = useEditorStore(
    (state) => state.handleDatabaseViewModeChange
  );
  const storeHandleFetchData = useEditorStore(
    (state) => state.handleDatabaseFetch
  );

  // Use the simplified useAsyncOperation hook for data fetching
  const dataFetch = useAsyncOperation(
    async () => {
      await storeHandleFetchData(element.id);
    },
    [element.id]
  );

  return (
    <div className="relative" data-element-id={element.id}>

      {/* Compact toolbar as chips */}
      <div className="flex items-center gap-2 mb-3">
        {/* Database info chip */}
        <div className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
          <Database className="w-4 h-4" />
          <span className="font-medium">{element.database}</span>
          <span className="text-blue-600">({element.data.length})</span>
        </div>

        {/* View mode chips */}
        <div className="flex gap-1">
          <button
            onClick={() => handleViewModeChange(element.id, "cards")}
            className={`p-1.5 rounded-md transition-colors ${
              element.viewMode === "cards"
                ? "bg-blue-100 text-blue-600"
                : "text-gray-500 hover:bg-gray-100"
            }`}
            title="Card View"
          >
            <Grid className="w-3 h-3" />
            Cards
          </button>
          <button
            onClick={() => handleViewModeChange(element.id, "table")}
            className={`p-1.5 rounded-md transition-colors ${
              element.viewMode === "table"
                ? "bg-blue-100 text-blue-600"
                : "text-gray-500 hover:bg-gray-100"
            }`}
            title="Table View"
          >
            <Table className="w-3 h-3" />
            Table
          </button>
        </div>

        {/* Action chips */}
        {element.apiUrl && (
          <button
            onClick={() => dataFetch.execute()}
            disabled={dataFetch.loading}
            className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs hover:bg-green-200 disabled:opacity-50 transition-colors"
            title="Fetch Data"
          >
            <ExternalLink className="w-3 h-3" />
            {dataFetch.loading ? "Fetching..." : "Fetch"}
          </button>
        )}

        <button
          onClick={() => setIsSettingsOpen(true)}
          className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs hover:bg-gray-200 transition-colors"
          title="Settings"
        >
          <Settings className="w-3 h-3" />
          Settings
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {element.data.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
            <Database className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No data available</p>
            <p className="text-sm">
              Configure API URL and fetch data to get started
            </p>
          </div>
        ) : element.viewMode === "cards" ? (
          <DatabaseCardSlider data={element.data} columns={element.columns} />
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <DatabaseTable data={element.data} columns={element.columns} />
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <DatabaseSettings
          element={element}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {dataFetch.loading && (
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 text-gray-500">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            Loading data...
          </div>
        </div>
      )}
      {dataFetch.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 text-red-800">
            <X className="w-4 h-4" />
            <span className="font-medium">Error loading data</span>
          </div>
          <p className="text-red-700 mt-1">{dataFetch.error}</p>
          <button
            onClick={() => dataFetch.execute()}
            className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
};

export const databasePlugin: Plugin = {
  name: "database",
  version: "1.0.0",
  description: "Handles database connections with card and table views",

  selectable: {
    enabled: true,
    name: "Database",
    color: "#3b82f6", // blue
    description: "Database with data visualization",
    level: "element",
    elementType: "block",
  },

  match: (element: Element) =>
    element.tagName.toLowerCase() === "div" &&
    element.hasAttribute("data-database-id"),

  parse: (element: Element) => {
    const databaseAttribute = element.getAttribute("data-database");
    if (databaseAttribute) {
      return {
        type: "database" as const,
        id: element.id || crypto.randomUUID(),
        tagName: element.tagName.toLowerCase(),
        database: databaseAttribute,
        apiUrl: element.getAttribute("data-api-url") || undefined,
        viewMode:
          (element.getAttribute("data-view-mode") as "cards" | "table") ||
          "cards",
        data: [],
        columns: [
          { id: "id", name: "ID", type: "text" },
          { id: "name", name: "Name", type: "text" },
          {
            id: "status",
            name: "Status",
            type: "select",
            options: ["Active", "Inactive"],
          },
        ],
        attributes: Array.from(element.attributes).reduce((acc, attr) => {
          acc[attr.name] = attr.value;
          return acc;
        }, {} as Record<string, string>),
      };
    }
    return null;
  },

  render: ({ parsedElement }) => {
    const databaseElement = parsedElement as DatabaseElement;

    return (
      <DatabaseView
        key={databaseElement.id}
        element={databaseElement}
      />
    );
  },
};
