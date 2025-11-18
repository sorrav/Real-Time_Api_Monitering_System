import React from 'react';
import { FilterType, SortType } from '../../types';
import { Star, CheckCircle, AlertCircle, Activity, AlertTriangle } from 'lucide-react';

interface FilterBarProps {
  filter: FilterType;
  sort: SortType;
  onFilterChange: (filter: FilterType) => void;
  onSortChange: (sort: SortType) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  filter,
  sort,
  onFilterChange,
  onSortChange,
}) => {
  const filterOptions: { value: FilterType; label: string; icon: React.ReactNode }[] = [
    { value: 'all', label: 'All', icon: <Activity className="w-4 h-4" /> },
    { value: 'favorites', label: 'Favorites', icon: <Star className="w-4 h-4" /> },
    { value: 'up', label: 'Up', icon: <CheckCircle className="w-4 h-4" /> },
    { value: 'down', label: 'Down', icon: <AlertCircle className="w-4 h-4" /> },
    { value: 'high-latency', label: 'High Latency', icon: <AlertTriangle className="w-4 h-4" /> },
  ];

  const sortOptions: { value: SortType; label: string }[] = [
    { value: 'recent', label: 'Recently Checked' },
    { value: 'status', label: 'Status' },
    { value: 'latency-asc', label: 'Latency (Low to High)' },
    { value: 'latency-desc', label: 'Latency (High to Low)' },
    { value: 'name-asc', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-700 flex items-center mr-2">
            Filter:
          </span>
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onFilterChange(option.value)}
              className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === option.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.icon}
              <span className="ml-1.5">{option.label}</span>
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="text-sm font-medium text-gray-700">
            Sort by:
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortType)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;