'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { tasksAPI, companiesAPI, tagsAPI } from '../../lib/api';
import { TECH_STACKS } from '../../lib/constants';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import RichTextEditor from './RichTextEditor';
import FileUploader from './FileUploader';
import CompanySelect from './CompanySelect';
import TagSelector from './TagSelector';

const TaskForm = ({ isOpen, onClose, initialData = null, onSuccess }) => {
  const router = useRouter();

  // Reset form when initialData changes or modal opens/closes
  useEffect(() => {
    if (initialData) {
      // Edit mode - populate with existing task data
      setFormData({
        title: initialData.title || '',
        body: initialData.body || '',
        techStack: initialData.techStack || [],
        companyId: initialData.company?._id || '',
        companyName: initialData.company?.name || '',
        tagIds: initialData.tags?.map((t) => t._id) || [],
        tags: initialData.tags || [],
      });
      setExistingFiles(initialData.files || []);
    } else {
      // Create mode - reset form
      setFormData({
        title: '',
        body: '',
        techStack: [],
        companyId: '',
        companyName: '',
        tagIds: [],
        tags: [],
      });
      setExistingFiles([]);
    }
    setNewFiles([]); // Always clear new files when switching tasks
    setFilesToDelete([]); // Clear files to delete
  }, [initialData]);

  const [formData, setFormData] = useState({
    title: '',
    body: '',
    techStack: [],
    companyId: '',
    companyName: '',
    tagIds: [],
    tags: [],
  });
  const [newFiles, setNewFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);
  const [filesToDelete, setFilesToDelete] = useState([]); // Track file IDs to delete
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // For company creation callback
  const handleCreateCompany = async (companyData) => {
    const res = await companiesAPI.create(companyData);
    return res;
  };

  // For tag creation callback
  const handleCreateTag = async (tagData) => {
    const res = await tagsAPI.create(tagData);
    return res;
  };

  // Handle removal of existing file (for edit mode)
  const handleRemoveExistingFile = (fileId) => {
    // Remove from existingFiles array
    setExistingFiles((prev) => prev.filter((f) => f._id !== fileId));
    // Add to filesToDelete list
    setFilesToDelete((prev) => [...prev, fileId]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = new FormData();

      // Append basic fields
      payload.append('title', formData.title.trim());
      payload.append('body', formData.body);

      // Append techStack as array
      formData.techStack.forEach((stack) => {
        payload.append('techStack', stack);
      });

      // Append company
      if (formData.newCompanyName) {
        payload.append('newCompanyName', formData.newCompanyName);
        if (formData.newCompanyPlace) payload.append('newCompanyPlace', formData.newCompanyPlace);
        if (formData.newCompanyEmail) payload.append('newCompanyEmail', formData.newCompanyEmail);
        if (formData.newCompanyPhone) payload.append('newCompanyPhone', formData.newCompanyPhone);
      } else if (formData.companyId) {
        payload.append('companyId', formData.companyId);
      }

      // Append tags - use tags array to get IDs
      if (formData.tags && formData.tags.length > 0) {
        formData.tags.forEach((tag) => {
          payload.append('tagIds', tag._id);
        });
      }

      // Append new tag names (if any are being created)
      // In a real implementation, we'd track newly created tag names
      // For now, assume tagIds covers both existing and newly created tags
      // because TagSelector returns the created tag object with _id

      // Append files to delete (for editing)
      if (filesToDelete.length > 0) {
        filesToDelete.forEach((fileId) => {
          payload.append('filesToDelete', fileId);
        });
      }

      // Append new files
      newFiles.forEach((fileObj) => {
        payload.append('files', fileObj.file);
      });

      const res = initialData
        ? await tasksAPI.update(initialData._id, payload)
        : await tasksAPI.create(payload);

      if (res.data.success) {
        onClose();
        if (onSuccess) {
          onSuccess();
        } else {
          router.refresh(); // Fallback refresh
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const handleTechStackChange = (stack) => {
    setFormData((prev) => {
      if (prev.techStack.includes(stack)) {
        return {
          ...prev,
          techStack: prev.techStack.filter((s) => s !== stack),
        };
      } else {
        return {
          ...prev,
          techStack: [...prev.techStack, stack],
        };
      }
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      body: '',
      techStack: [],
      companyId: '',
      companyName: '',
      tagIds: [],
      tags: [],
    });
    setNewFiles([]);
    setExistingFiles([]);
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={initialData ? 'Edit Task' : 'Add New Machine Task'}
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/*Company */}
          <CompanySelect
            selectedCompanyId={formData.companyId}
            onCompanySelect={(id, name) => {
              setFormData((prev) => ({
                ...prev,
                companyId: id,
                companyName: name,
                newCompanyName: '',
              }));
            }}
            onCreateCompany={handleCreateCompany}
          />

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter task title"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Rich Text Body */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <RichTextEditor
              content={formData.body}
              onChange={(body) => setFormData({ ...formData, body })}
              placeholder="Describe the machine task in detail. You can use formatting, lists, code blocks, etc."
            />
          </div>

          {/* Tech Stack */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tech Stack
            </label>
            <div className="flex flex-wrap gap-2">
              {TECH_STACKS.map((stack) => (
                <button
                  key={stack}
                  type="button"
                  onClick={() => handleTechStackChange(stack)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    formData.techStack.includes(stack)
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {stack}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <TagSelector
            selectedTags={formData.tags}
            setSelectedTags={(tags) => setFormData({ ...formData, tags })}
          />

          {/* File Upload */}
          <FileUploader
            files={newFiles}
            setFiles={setNewFiles}
            existingFiles={existingFiles}
            onRemoveFile={handleRemoveExistingFile}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading || !formData.title || !formData.body || !formData.companyId}
          >
            {loading
              ? 'Saving...'
              : initialData
              ? 'Update Task'
              : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskForm;
