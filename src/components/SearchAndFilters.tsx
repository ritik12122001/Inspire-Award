import React from 'react';
import { Search, X, ArrowDownAZ, ArrowUp10, ArrowDown10, SlidersHorizontal } from 'lucide-react';
import { SortOrder } from '../types';

interface SearchAndFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  sortOrder: SortOrder;
  onSortOrderChange: (value: SortOrder) => void;
  totalFiltered: number;
  totalAvailable: number;
}

export const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  searchTerm,
  onSearchChange,
  onClearSearch,
  sortOrder,
  onSortOrderChange,
  totalFiltered,
  totalAvailable,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3.5 mb-6 shadow-xs" id="dashboard-search-filters">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Search input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            id="block-search-input"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by Block Name (e.g. Shambhuganj, Amarpur, Rajoun)..."
            className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-300 rounded-md text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
          />
          {searchTerm && (
            <button
              type="button"
              id="clear-search-button"
              onClick={onClearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort Controls & Counter */}
        <div className="flex items-center gap-2.5 shrink-0 justify-between sm:justify-end">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium px-2.5 py-1.5 bg-slate-100 rounded">
            <span>Showing:</span>
            <span className="font-bold text-slate-900">{totalFiltered}</span>
            <span>of {totalAvailable} Blocks</span>
          </div>

          <div className="flex items-center gap-1.5">
            <label htmlFor="sort-select" className="text-xs text-slate-500 font-medium hidden sm:inline">
              Sort:
            </label>
            <div className="relative">
              <select
                id="sort-select"
                value={sortOrder}
                onChange={(e) => onSortOrderChange(e.target.value as SortOrder)}
                className="text-xs font-semibold bg-white border border-slate-300 rounded-md py-1.5 pl-3 pr-8 text-slate-700 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
              >
                <option value="name-asc">Block Name (A to Z)</option>
                <option value="name-desc">Block Name (Z to A)</option>
                <option value="count-desc">Pending Count (Highest First)</option>
                <option value="count-asc">Pending Count (Lowest First)</option>
              </select>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
