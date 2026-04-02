'use client';

import { useState, useEffect, useRef } from 'react';
import { companiesAPI } from '../../lib/api';
import Button from '../ui/Button';
import Input from '../ui/Input';

const CompanySelect = ({ selectedCompanyId, onCompanySelect, onCreateCompany }) => {
  const [search, setSearch] = useState('');
  const [companies, setCompanies] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: '',
    place: '',
    contactEmail: '',
    contactPhone: '',
  });
  const [creating, setCreating] = useState(false);

  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (search.length >= 2) {
      debounceRef.current = setTimeout(() => {
        fetchCompanies(search);
      }, 300);
    } else {
      setCompanies([]);
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

  const fetchCompanies = async (query) => {
    setLoading(true);
    try {
      const res = await companiesAPI.getAll(query);
      setCompanies(res.data.data);
      setShowDropdown(true);
    } catch (err) {
      console.error('Failed to fetch companies:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (company) => {
    onCompanySelect(company._id, company.name);
    setSearch(company.name);
    setShowDropdown(false);
    setShowNewForm(false);
  };

  const handleCreateNew = () => {
    setShowNewForm(!showNewForm);
    setSearch('');
  };

  const handleNewCompanySubmit = async (e) => {
    // Since this is now a button click (not form submit), we just stop propagation
    if (e) e.stopPropagation();
    if (!newCompany.name.trim()) return;

    setCreating(true);
    try {
      if (onCreateCompany) {
        const result = await onCreateCompany(newCompany);
        // The API returns { success, message, data: company }
        handleSelect(result.data.data);
      }
      setNewCompany({ name: '', place: '', contactEmail: '', contactPhone: '' });
      setShowNewForm(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create company');
    } finally {
      setCreating(false);
    }
  };

  const handleInputChange = (e) => {
    setSearch(e.target.value);
    setShowNewForm(false);
    // If input is cleared, deselect
    if (e.target.value === '') {
      onCompanySelect('', '');
    }
  };

  return (
    <div className="mb-4 relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Company
        <span className="text-red-500 ml-1">*</span>
      </label>

      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={handleInputChange}
          onFocus={() => search.length >= 2 && setShowDropdown(true)}
          placeholder="Search for a company (min 2 characters)"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {loading && (
          <div className="absolute right-3 top-2.5">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        )}

        {/* Dropdown */}
        {showDropdown && !showNewForm && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {companies.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500">
                {loading ? 'Searching...' : (
                  <div className='flex justify-between'>
                    <span>No companies found</span> 
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
              companies.map((company) => (
                <div
                  key={company._id}
                  onClick={() => handleSelect(company)}
                  className={`px-4 py-3 cursor-pointer hover:bg-blue-50 ${
                    selectedCompanyId === company._id
                      ? 'bg-blue-100'
                      : ''
                  }`}
                >
                  <div className="font-medium">{company.name}</div>
                  {company.place && (
                    <div className="text-sm text-gray-500">{company.place}</div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Create new company option - only show if no company is selected */}
      {search.length >= 2 && !showNewForm && !selectedCompanyId && (
        <div className="mt-2">
          <button
            type="button"
            onClick={handleCreateNew}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            + Create new company "{search}"
          </button>
        </div>
      )}

      {/* New company form */}
      {showNewForm && (
        <div className="absolute z-20 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
          <h4 className="font-medium mb-3">Create New Company</h4>
          {/* Remove form tag to avoid nested forms - handle via button onClick */}
          <div className="space-y-3">
            <Input
              label="Company Name"
              name="name"
              value={newCompany.name}
              onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.stopPropagation();
                  handleNewCompanySubmit(e);
                }
              }}
              required
              className="mb-0"
              inputClassName="text-sm py-1"
            />
            <Input
              label="Place (Optional)"
              name="place"
              value={newCompany.place}
              onChange={(e) => setNewCompany({ ...newCompany, place: e.target.value })}
              className="mb-0"
              inputClassName="text-sm py-1"
            />
            <Input
              label="Contact Email (Optional)"
              name="contactEmail"
              type="email"
              value={newCompany.contactEmail}
              onChange={(e) => setNewCompany({ ...newCompany, contactEmail: e.target.value })}
              className="mb-0"
              inputClassName="text-sm py-1"
            />
            <Input
              label="Contact Phone (Optional)"
              name="contactPhone"
              value={newCompany.contactPhone}
              onChange={(e) => setNewCompany({ ...newCompany, contactPhone: e.target.value })}
              className="mb-0"
              inputClassName="text-sm py-1"
            />
          </div>
          <div className="flex gap-2 mt-3">
            <Button
              type="button"
              onClick={handleNewCompanySubmit}
              variant="primary"
              size="sm"
              disabled={creating || !newCompany.name.trim()}
            >
              {creating ? 'Creating...' : 'Create'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setShowNewForm(false);
                setNewCompany({ name: '', place: '', contactEmail: '', contactPhone: '' });
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Hidden input to track selected company ID */}
      <input type="hidden" value={selectedCompanyId} onChange={() => {}} />
    </div>
  );
};

export default CompanySelect;
