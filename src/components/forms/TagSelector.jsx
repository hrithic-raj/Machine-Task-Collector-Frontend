'use client';

import { useState, useEffect, useRef } from 'react';
import { tagsAPI } from '../../lib/api';
import Button from '../ui/Button';

const TagSelector = ({ selectedTags, setSelectedTags }) => {
  const [search, setSearch] = useState('');
  const [availableTags, setAvailableTags] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showNewTagForm, setShowNewTagForm] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [creating, setCreating] = useState(false);

  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (search.length >= 2) {
      debounceRef.current = setTimeout(() => {
        fetchTags(search);
      }, 300);
    } else {
      setAvailableTags([]);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [search]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchTags = async (query) => {
    setLoading(true);
    try {
      const res = await tagsAPI.getAll(query);
      setAvailableTags(res.data.data);
      setShowDropdown(true);
    } catch (err) {
      console.error('Failed to fetch tags:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTag = (tag) => {
    if (!selectedTags.some((t) => t._id === tag._id)) {
      setSelectedTags([...selectedTags, tag]);
    }
    setSearch('');
    setShowDropdown(false);
    setShowNewTagForm(false);
  };

  const handleRemoveTag = (tagId) => {
    setSelectedTags(selectedTags.filter((t) => t._id !== tagId));
  };

  const handleCreateNew = () => {
    setShowNewTagForm(!showNewTagForm);
    setSearch('');
  };

  const handleNewTagSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent form bubbling to parent TaskForm
    if (!newTagName.trim()) return;

    setCreating(true);
    try {
      const res = await tagsAPI.create({ name: newTagName.trim() });
      handleSelectTag(res.data.data);
      setNewTagName('');
      setShowNewTagForm(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create tag');
    } finally {
      setCreating(false);
    }
  };

  const handleInputChange = (e) => {
    setSearch(e.target.value);
    setShowNewTagForm(false);
  };

  return (
    <div className="mb-4 relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Tags (Optional)
      </label>

      {/* Selected tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedTags.map((tag) => (
            <span
              key={tag._id}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
            >
              {tag.name}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag._id)}
                className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={handleInputChange}
          onFocus={() => search.length >= 2 && setShowDropdown(true)}
          placeholder={selectedTags.length === 0 ? "Search tags (min 2 characters)" : "Add more tags..."}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {loading && (
          <div className="absolute right-3 top-2.5">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        )}

        {/* Dropdown */}
        {showDropdown && !showNewTagForm && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {availableTags.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500">
                {loading ? 'Searching...' : (
                  <div className='flex justify-between'>
                    <span>No tags found</span>
                    <button
                      type="button"
                      onClick={handleCreateNew}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      + Create one "{search}"
                    </button>
                  </div>
                )}
              </div>
            ) : (
              availableTags.map((tag) => (
                <div
                  key={tag._id}
                  onClick={() => handleSelectTag(tag)}
                  className={`px-4 py-3 cursor-pointer hover:bg-blue-50 ${
                    selectedTags.some((t) => t._id === tag._id)
                      ? 'bg-blue-100'
                      : ''
                  }`}
                >
                  <div className="font-medium">{tag.name}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Create new tag option */}
      {search.length >= 2 && !showNewTagForm && (
        <div className="mt-2">
          <button
            type="button"
            onClick={handleCreateNew}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            + Create new tag "{search}"
          </button>
        </div>
      )}

      {/* New tag form */}
      {showNewTagForm && (
        <div className="absolute z-20 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
          <h4 className="font-medium mb-3">Create New Tag</h4>
          {/* Remove form tag to avoid nested forms - handle via button onClick */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Enter tag name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.stopPropagation();
                  handleNewTagSubmit(e);
                }
              }}
            />
            <Button
              type="button"
              onClick={handleNewTagSubmit}
              variant="primary"
              size="sm"
              disabled={creating || !newTagName.trim()}
            >
              {creating ? 'Creating...' : 'Add'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setShowNewTagForm(false);
                setNewTagName('');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TagSelector;
