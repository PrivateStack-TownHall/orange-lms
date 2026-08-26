import React from "react";
import { Search, SlidersHorizontal, Download } from "lucide-react";

import ViewToggle from "./ViewToggle";

const TableControls = ({
  searchQuery,
  setSearchQuery,
  searchPlaceholder = "Search...",

  filters = [],

  // legacy single-filter API (kept for backward compatibility)
  filterOptions = [],
  filterValue,
  setFilterValue,

  sortOptions = [],
  sortKey,
  toggleSort,

  view,
  setView,

  onFilterClick,
  onExportClick,
}) => {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative min-w-[220px] flex-1">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full rounded-sm border border-gray-200 py-2 pl-10 pr-3 text-sm outline-none focus:border-orange-400"
        />
      </div>

      {/* Multi-filter API */}
      {filters.map((filter) => (
        <select
          key={filter.key}
          value={filter.value}
          onChange={(e) => filter.onChange(e.target.value)}
          className="rounded-sm border border-gray-200 px-3 py-2 text-sm outline-none"
        >
          <option value="">{filter.allLabel || `All ${filter.label}`}</option>

          {filter.options.map((option) => (
            <option key={option.value ?? option} value={option.value ?? option}>
              {option.label ?? option}
            </option>
          ))}
        </select>
      ))}

      {/* Legacy single-filter API */}
      {filterOptions.length > 0 && (
        <select
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
          className="rounded-sm border border-gray-200 px-3 py-2 text-sm outline-none"
        >
          <option value="">All</option>

          {filterOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      )}

      {/* Sort */}
      {sortOptions.length > 0 &&
        sortOptions.map((option) => (
          <button
            key={option.key}
            onClick={() => toggleSort(option.key)}
            className="rounded-sm border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
          >
            {option.label}
            {sortKey === option.key && " ↑↓"}
          </button>
        ))}

      {onFilterClick && (
        <button
          type="button"
          onClick={onFilterClick}
          className="flex items-center gap-2 rounded-sm border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <SlidersHorizontal size={16} />
          Filter
        </button>
      )}

      {onExportClick && (
        <button
          type="button"
          onClick={onExportClick}
          className="flex items-center gap-2 rounded-sm border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Download size={16} />
          Export
        </button>
      )}

      <ViewToggle view={view} setView={setView} />
    </div>
  );
};

export default TableControls;
