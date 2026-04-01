'use client';

export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, ProtectedRoute } from '../../../lib/auth';
import { adminAPI } from '../../../lib/api';
import Button from '../../../components/ui/Button';
import { Suspense } from 'react';

const AdminUsersContent = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const pageSize = 20;

  // Redirect non-admins away
  useEffect(() => {
    if (user && !['admin', 'super_admin'].includes(user.role)) {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Set initial filters from URL params
  useEffect(() => {
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const filter = searchParams.get('filter');

    if (filter === 'pending') {
      setRoleFilter('intern');
      setStatusFilter('pending');
    } else if (filter === 'blocked') {
      setStatusFilter('blocked');
    }

    if (role) setRoleFilter(role);
    if (status) setStatusFilter(status);
  }, [searchParams]);

  useEffect(() => {
    if (user && ['admin', 'super_admin'].includes(user.role)) {
      fetchUsers(1);
    }
  }, [roleFilter, statusFilter, search, user]);

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit: pageSize,
      };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter === 'pending') params.isApproved = false;
      else if (statusFilter === 'approved') params.isApproved = true;
      if (statusFilter === 'blocked') params.isBlocked = true;

      const res = await adminAPI.getUsers(params);
      setUsers(res.data.data);
      setTotal(res.data.total);
      setCurrentPage(res.data.page);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    fetchUsers(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleApprove = async (userId) => {
    if (!window.confirm('Approve this user? They will be able to access the dashboard.')) {
      return;
    }
    try {
      await adminAPI.approveUser(userId);
      fetchUsers(currentPage);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve user');
    }
  };

  const handleReject = async (userId) => {
    if (!window.confirm('Reject this user? They will not be able to access the dashboard.')) {
      return;
    }
    try {
      await adminAPI.rejectUser(userId);
      fetchUsers(currentPage);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject user');
    }
  };

  const handleBlock = async (userId) => {
    const reason = prompt('Reason for blocking (optional):');
    try {
      await adminAPI.blockUser(userId, reason);
      fetchUsers(currentPage);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to block user');
    }
  };

  const handleUnblock = async (userId) => {
    if (!window.confirm('Unblock this user?')) {
      return;
    }
    try {
      await adminAPI.unblockUser(userId);
      fetchUsers(currentPage);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to unblock user');
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    const action = newRole === 'super_admin' ? 'promote to super admin' : `change role to ${newRole}`;
    if (!window.confirm(`Are you sure you want to ${action}?`)) {
      return;
    }
    try {
      await adminAPI.changeUserRole(userId, newRole);
      fetchUsers(currentPage);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to change role');
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeClass = (user) => {
    if (user.isBlocked) {
      return 'bg-red-100 text-red-800';
    }
    if (!user.isApproved) {
      return 'bg-yellow-100 text-yellow-800';
    }
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (user) => {
    if (user.isBlocked) return 'Blocked';
    if (!user.isApproved) return 'Pending';
    return 'Active';
  };

  return (
    <ProtectedRoute>
      {loading ? (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading users...</p>
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
                    className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded"
                  >
                    User Management
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
            className="flex-1 text-sm font-medium text-blue-600 bg-blue-50 px-3 py-2 rounded"
          >
            Users
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
            <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
            <p className="text-gray-600">Manage user accounts, roles, and approvals</p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Name or email..."
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">All Roles</option>
                  <option value="intern">Intern</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">All Statuses</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch('');
                    setRoleFilter('');
                    setStatusFilter('');
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registered
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {u.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {u.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeClass(u.role)}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(u)}`}>
                            {getStatusText(u)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2 flex-wrap">
                            {u.role === 'intern' && !u.isApproved && !u.isBlocked && (
                              <button
                                onClick={() => handleApprove(u._id)}
                                className="text-green-600 hover:text-green-900 font-medium"
                              >
                                Approve
                              </button>
                            )}
                            {u.role === 'intern' && u.isApproved && !u.isBlocked && (
                              <button
                                onClick={() => handleReject(u._id)}
                                className="text-yellow-600 hover:text-yellow-900 font-medium"
                              >
                                Reject
                              </button>
                            )}
                            {!u.isBlocked ? (
                              <button
                                onClick={() => handleBlock(u._id)}
                                className="text-red-600 hover:text-red-900 font-medium"
                              >
                                Block
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUnblock(u._id)}
                                className="text-green-600 hover:text-green-900 font-medium"
                              >
                                Unblock
                              </button>
                            )}
                            <button
                              onClick={() => handleChangeRole(u._id, u.role === 'super_admin' ? 'admin' : u.role === 'admin' ? 'intern' : 'admin')}
                              className="text-blue-600 hover:text-blue-900 font-medium"
                              title="Toggle role"
                            >
                              Role: {u.role}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {(currentPage - 1) * pageSize + 1} to{' '}
                {Math.min(currentPage * pageSize, total)} of {total} users
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Warning about super_admin limit */}
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-yellow-800 mb-2">
              Admin Instructions
            </h4>
            <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
              <li>Only verified users with intern role need approval. Admin and Super Admin roles auto-approve users.</li>
              <li>Approving an intern allows them to access the dashboard and create tasks.</li>
              <li>Blocked users cannot log in or access the system.</li>
              <li>Only Super Admins can assign the Super Admin role to others.</li>
              <li>Change user roles carefully. Promoting to Super Admin gives full system access.</li>
            </ul>
          </div>
        </main>
      </div>
      )}
    </ProtectedRoute>
  );
};

const AdminUsersPage = () => {
  return (
    <ProtectedRoute>
      <Suspense fallback={<div>Loading...</div>}>
        <AdminUsersContent />
      </Suspense>
    </ProtectedRoute>
  );
};

export default AdminUsersPage;