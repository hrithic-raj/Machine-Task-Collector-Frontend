'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth';
import { tasksAPI } from '../../lib/api';
import { ProtectedRoute } from '../../lib/auth';
import Button from '../../components/ui/Button';
import SearchBar from '../../components/common/SearchBar';
import TaskList from '../../components/common/TaskList';
import TaskForm from '../../components/forms/TaskForm';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [tasks, setTasks] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTechStacks, setSelectedTechStacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const pageSize = 10;

  const fetchTasks = async (page = 1, search = '', techStacks = []) => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit: pageSize,
      };
      if (search) params.search = search;
      if (techStacks.length > 0) params.techStack = techStacks;

      const res = await tasksAPI.getAll(params);
      setTasks(res.data.data);
      setTotal(res.data.total);
      setCurrentPage(res.data.page);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tasks');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks(1, searchQuery, selectedTechStacks);
  }, [searchQuery, selectedTechStacks]);

  const handleSearch = (search, techStacks) => {
    setCurrentPage(1);
    fetchTasks(1, search, techStacks);
  };

  const handleClear = () => {
    setCurrentPage(1);
    fetchTasks(1, '', []);
  };

  const handlePageChange = (page) => {
    fetchTasks(page, searchQuery, selectedTechStacks);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleDelete = async (taskId) => {
    setDeletingId(taskId);
    try {
      await tasksAPI.delete(taskId);
      // Refresh current page
      fetchTasks(currentPage, searchQuery, selectedTechStacks);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete task');
    } finally {
      setDeletingId(null);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingTask(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    fetchTasks(currentPage, searchQuery, selectedTechStacks);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Loading state
  if (loading && tasks.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-xl font-bold text-gray-900">
                Machine Task Collector
              </h1>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  Welcome, {user?.name}
                </span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Machine Tasks</h2>
              <p className="text-gray-600">
                Showing {tasks.length} of {total} tasks
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => setIsFormOpen(true)}
            >
              + Add New Task
            </Button>
          </div>

          {/* Search & Filters */}
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedTechStacks={selectedTechStacks}
            setSelectedTechStacks={setSelectedTechStacks}
            onSearch={handleSearch}
            onClear={handleClear}
          />

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Task List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading more tasks...</p>
            </div>
          ) : (
            <TaskList
              tasks={tasks}
              total={total}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </main>

        {/* Task Form Modal */}
        <TaskForm
          isOpen={isFormOpen}
          onClose={handleFormClose}
          initialData={editingTask}
        />
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;
