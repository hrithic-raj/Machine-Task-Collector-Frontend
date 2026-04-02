'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, ProtectedRoute } from '../../../lib/auth';
import { companiesAPI } from '../../../lib/api';
import Button from '../../../components/ui/Button';
import { Suspense } from 'react';

const AdminCompaniesContent = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // For editing
  const [editingCompany, setEditingCompany] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    place: '',
    contactEmail: '',
    contactPhone: '',
  });
  const [saving, setSaving] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: '',
    place: '',
    contactEmail: '',
    contactPhone: '',
  });
  const [creating, setCreating] = useState(false);

  // Redirect non-admins away
  useEffect(() => {
    if (user && !['admin', 'super_admin'].includes(user.role)) {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    if (user && ['admin', 'super_admin'].includes(user.role)) {
      fetchCompanies();
    }
  }, [user]);

  const fetchCompanies = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await companiesAPI.getAll();
      setCompanies(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (company) => {
    setEditingCompany(company._id);
    setEditForm({
      name: company.name,
      place: company.place || '',
      contactEmail: company.contactEmail || '',
      contactPhone: company.contactPhone || '',
    });
  };

  const handleCancelEdit = () => {
    setEditingCompany(null);
    setEditForm({ name: '', place: '', contactEmail: '', contactPhone: '' });
  };

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    if (!newCompany.name.trim()) {
      alert('Company name is required');
      return;
    }

    setCreating(true);
    setError('');
    try {
      await companiesAPI.create(newCompany);
      setNewCompany({ name: '', place: '', contactEmail: '', contactPhone: '' });
      setShowCreateForm(false);
      fetchCompanies(); // Refresh list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create company');
    } finally {
      setCreating(false);
    }
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
    setNewCompany({ name: '', place: '', contactEmail: '', contactPhone: '' });
  };

  const handleUpdateCompany = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) {
      alert('Company name is required');
      return;
    }

    setSaving(true);
    try {
      await companiesAPI.update(editingCompany, editForm);
      setEditingCompany(null);
      setEditForm({ name: '', place: '', contactEmail: '', contactPhone: '' });
      fetchCompanies(); // Refresh list
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update company');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const getCreatedBy = (userId) => {
    // For simplicity, show truncated user ID
    return userId ? `${userId.toString().slice(-8)}` : 'Unknown';
  };

  return (
    <ProtectedRoute>
      {loading ? (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading companies...</p>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-gray-50">
          {/* Navigation */}
          <nav className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-8">
                  <h1 className="text-xl font-bold text-gray-900">
                    Admin Panel
                  </h1>
                  <div className="hidden md:flex items-center gap-4">
                    <button
                      onClick={() => router.push('/admin/dashboard')}
                      className="text-sm font-medium text-gray-600 hover:text-gray-900"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => router.push('/admin/users')}
                      className="text-sm font-medium text-gray-600 hover:text-gray-900"
                    >
                      User Management
                    </button>
                    <button
                      onClick={() => router.push('/admin/companies')}
                      className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded"
                    >
                      Companies
                    </button>
                    <button
                      onClick={() => router.push('/dashboard')}
                      className="text-sm font-medium text-gray-600 hover:text-gray-500"
                    >
                      Back to Tasks
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    {user?.name} ({user?.role})
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </nav>

          {/* Mobile Navigation */}
          <div className="md:hidden bg-white border-b px-4 py-2 flex gap-2">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="flex-1 text-sm font-medium text-gray-600 bg-gray-50 px-3 py-2 rounded"
            >
              Dashboard
            </button>
            <button
              onClick={() => router.push('/admin/users')}
              className="flex-1 text-sm font-medium text-gray-600 bg-gray-50 px-3 py-2 rounded"
            >
              Users
            </button>
            <button
              onClick={() => router.push('/admin/companies')}
              className="flex-1 text-sm font-medium text-blue-600 bg-blue-50 px-3 py-2 rounded"
            >
              Companies
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="flex-1 text-sm font-medium text-gray-600 bg-gray-50 px-3 py-2 rounded"
            >
              Tasks
            </button>
          </div>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-bold text-gray-900">Company Management</h2>
                <Button
                  variant="primary"
                  onClick={() => {
                    setError('');
                    setShowCreateForm(!showCreateForm);
                  }}
                >
                  {showCreateForm ? 'Hide Form' : '+ Create New Company'}
                </Button>
              </div>
              <p className="text-gray-600">Manage company information and contacts</p>
            </div>

            {/* Create Company Form */}
            {showCreateForm && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Company</h3>
                <form onSubmit={handleCreateCompany} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={newCompany.name}
                        onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                        className="w-full border rounded px-3 py-2 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        name="place"
                        value={newCompany.place}
                        onChange={(e) => setNewCompany({ ...newCompany, place: e.target.value })}
                        placeholder="City, State"
                        className="w-full border rounded px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        name="contactEmail"
                        value={newCompany.contactEmail}
                        onChange={(e) => setNewCompany({ ...newCompany, contactEmail: e.target.value })}
                        placeholder="email@company.com"
                        className="w-full border rounded px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        name="contactPhone"
                        value={newCompany.contactPhone}
                        onChange={(e) => setNewCompany({ ...newCompany, contactPhone: e.target.value })}
                        placeholder="+1 (555) 123-4567"
                        className="w-full border rounded px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={creating}
                    >
                      {creating ? 'Creating...' : 'Create Company'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCancelCreate}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            {/* Companies Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created At
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {companies.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                          No companies found
                        </td>
                      </tr>
                    ) : (
                      companies.map((company) => (
                        <React.Fragment key={company._id}>
                          {/* Company row */}
                          <tr className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {company.name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {company.place || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {company.contactEmail || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {company.contactPhone || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {getCreatedBy(company.createdBy)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(company.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {editingCompany === company._id ? (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={handleCancelEdit}
                                >
                                  Cancel Edit
                                </Button>
                              ) : (
                                <button
                                  onClick={() => handleEdit(company)}
                                  className="text-blue-600 hover:text-blue-900 font-medium"
                                >
                                  Edit
                                </button>
                              )}
                            </td>
                          </tr>
                          {/* Edit row - only shown when this company is being edited */}
                          {editingCompany === company._id && (
                            <tr className="bg-gray-50">
                              <td colSpan="7" className="px-6 py-4">
                                <form onSubmit={handleUpdateCompany} className="space-y-3">
                                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Company Name *
                                      </label>
                                      <input
                                        type="text"
                                        name="name"
                                        value={editForm.name}
                                        onChange={handleInputChange}
                                        className="w-full border rounded px-3 py-2 text-sm"
                                        required
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Location
                                      </label>
                                      <input
                                        type="text"
                                        name="place"
                                        value={editForm.place}
                                        onChange={handleInputChange}
                                        placeholder="Place"
                                        className="w-full border rounded px-3 py-2 text-sm"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Contact Email
                                      </label>
                                      <input
                                        type="email"
                                        name="contactEmail"
                                        value={editForm.contactEmail}
                                        onChange={handleInputChange}
                                        placeholder="Email"
                                        className="w-full border rounded px-3 py-2 text-sm"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Contact Phone
                                      </label>
                                      <input
                                        type="tel"
                                        name="contactPhone"
                                        value={editForm.contactPhone}
                                        onChange={handleInputChange}
                                        placeholder="Phone"
                                        className="w-full border rounded px-3 py-2 text-sm"
                                      />
                                    </div>
                                  </div>
                                  <div className="flex justify-end gap-3">
                                    <Button
                                      type="submit"
                                      variant="primary"
                                      size="sm"
                                      disabled={saving}
                                    >
                                      {saving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={handleCancelEdit}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </form>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Info box */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">
                Company Management Notes
              </h4>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li>Company information can be edited by Admins and Super Admins.</li>
                <li>Company name must be unique (case-insensitive).</li>
                <li>Changes to company details are reflected in associated tasks automatically.</li>
                <li>Created By shows the user ID of the admin who added the company.</li>
              </ul>
            </div>
          </main>
        </div>
      )}
    </ProtectedRoute>
  );
};

const AdminCompaniesPage = () => {
  return (
    <ProtectedRoute>
      <Suspense fallback={<div>Loading...</div>}>
        <AdminCompaniesContent />
      </Suspense>
    </ProtectedRoute>
  );
};

export default AdminCompaniesPage;
