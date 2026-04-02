'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, ProtectedRoute } from '../../../lib/auth';
import { adminAPI } from '../../../lib/api';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Redirect non-admins away
  useEffect(() => {
    if (user && !['admin', 'super_admin'].includes(user.role)) {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    if (user && ['admin', 'super_admin'].includes(user.role)) {
      fetchStatistics();
    }
  }, [user]);

  const fetchStatistics = async () => {
    try {
      const res = await adminAPI.getStatistics();
      setStats(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <ProtectedRoute>
      {loading ? (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
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
                    className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded"
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
                    className="text-sm font-medium text-gray-600 hover:text-gray-900"
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
            className="flex-1 text-sm font-medium text-blue-600 bg-blue-50 px-3 py-2 rounded"
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
            className="flex-1 text-sm font-medium text-gray-600 bg-gray-50 px-3 py-2 rounded"
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
            <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
            <p className="text-gray-600">System statistics and metrics</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {stats && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                {/* Total Users */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.users.total}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-gray-500">
                    <span>{stats.users.interns} interns</span>
                    <span className="mx-2">•</span>
                    <span>{stats.users.admins} admins</span>
                  </div>
                </div>

                {/* Pending Approval */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                      <p className="text-3xl font-bold text-yellow-600">{stats.users.pendingApproval}</p>
                    </div>
                    <div className="p-3 bg-yellow-100 rounded-full">
                      <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-500">
                    Verified interns awaiting review
                  </div>
                </div>

                {/* Total Tasks */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.tasks.total}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-500">
                    <span>{stats.tasks.recent} added in last 7 days</span>
                  </div>
                </div>

                {/* Blocked Users */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Blocked Users</p>
                      <p className="text-3xl font-bold text-red-600">{stats.users.blocked}</p>
                    </div>
                    <div className="p-3 bg-red-100 rounded-full">
                      <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-500">
                    Currently blocked
                  </div>
                </div>

                {/* Total Companies */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Companies</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.companies?.total || 0}</p>
                    </div>
                    <div className="p-3 bg-indigo-100 rounded-full">
                      <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-500">
                    Registered companies
                  </div>
                </div>
              </div>

              {/* Tech Stack Distribution */}
              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tasks by Tech Stack</h3>
                {stats.tasks.byTechStack.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stats.tasks.byTechStack.map((item, idx) => (
                      <div key={idx} className="border rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-gray-900">{item.count}</p>
                        <p className="text-sm text-gray-600">{item._id}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No tasks yet</p>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => router.push('/admin/users?filter=pending')}
                    className="p-4 border rounded-lg text-left hover:bg-gray-50 transition-colors"
                  >
                    <p className="font-medium text-gray-900">Review Pending Users</p>
                    <p className="text-sm text-gray-600">{stats.users.pendingApproval} awaiting approval</p>
                  </button>
                  <button
                    onClick={() => router.push('/admin/users?filter=blocked')}
                    className="p-4 border rounded-lg text-left hover:bg-gray-50 transition-colors"
                  >
                    <p className="font-medium text-gray-900">Manage Blocked Users</p>
                    <p className="text-sm text-gray-600">{stats.users.blocked} blocked users</p>
                  </button>
                  <button
                    onClick={() => router.push('/admin/users')}
                    className="p-4 border rounded-lg text-left hover:bg-gray-50 transition-colors"
                  >
                    <p className="font-medium text-gray-900">View All Users</p>
                    <p className="text-sm text-gray-600">{stats.users.total} total users</p>
                  </button>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
      )}
    </ProtectedRoute>
  );
};

export default AdminDashboard;
