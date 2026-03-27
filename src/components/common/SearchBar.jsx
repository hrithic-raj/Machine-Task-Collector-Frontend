'use client';

import { useState, useEffect } from 'react';
import { TECH_STACKS } from '../../lib/constants';
import Button from '../ui/Button';

const SearchBar = ({
  searchQuery,
  setSearchQuery,
  selectedTechStacks,
  setSelectedTechStacks,
  onSearch,
  onClear,
}) => {
  const [localSearch, setLocalSearch] = useState(searchQuery || '');
  const [debounceTimer, setDebounceTimer] = useState(null);

  // Handle search input change with debounce
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearch(value);

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      setSearchQuery(value);
      onSearch(value, selectedTechStacks);
    }, 500);

    setDebounceTimer(timer);
  };

  // Handle tech stack toggle
  const handleTechStackToggle = (stack) => {
    let newStacks;
    if (selectedTechStacks.includes(stack)) {
      newStacks = selectedTechStacks.filter((s) => s !== stack);
    } else {
      newStacks = [...selectedTechStacks, stack];
    }
    setSelectedTechStacks(newStacks);
    onSearch(localSearch, newStacks);
  };

  // Clear all filters
  const handleClear = () => {
    setLocalSearch('');
    setSearchQuery('');
    setSelectedTechStacks([]);
    onClear();
  };

  // When selectedTechStacks changes from outside, update local search
  useEffect(() => {
    // This is just for syncing
  }, [selectedTechStacks]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search input */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search by company name or task title
          </label>
          <div className="relative">
            <input
              type="text"
              value={localSearch}
              onChange={handleSearchChange}
              placeholder="Search tasks..."
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Tech Stack Filters */}
        <div className="lg:w-auto">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Tech Stack
          </label>
          <div className="flex flex-wrap gap-2">
            {TECH_STACKS.map((stack) => (
              <button
                key={stack}
                type="button"
                onClick={() => handleTechStackToggle(stack)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedTechStacks.includes(stack)
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {stack}
              </button>
            ))}
          </div>
        </div>

        {/* Clear button */}
        <div className="flex items-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleClear}
            disabled={!localSearch && selectedTechStacks.length === 0}
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Active filters display */}
      {(localSearch || selectedTechStacks.length > 0) && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-gray-600">Active filters:</span>
          {localSearch && (
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800">
              Search: "{localSearch}"
              <button
                onClick={() => {
                  setLocalSearch('');
                  setSearchQuery('');
                  onSearch('', selectedTechStacks);
                }}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}
          {selectedTechStacks.map((stack) => (
            <span
              key={stack}
              className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800"
            >
              {stack}
              <button
                onClick={() => handleTechStackToggle(stack)}
                className="ml-2 text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
