'use client';

import { useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useAuth } from '../../lib/auth';

const TaskDetailModal = ({
  isOpen,
  onClose,
  task,
  currentUserId,
  onEdit,
  onDelete,
  onFormSuccess,
}) => {
  const isOwner = task?.submittedBy?._id === currentUserId;

  // Close modal on Escape key is handled by Modal component

  // Handle file click - open any file in new tab
  const handleFileClick = (file) => {
    const fileUrl = file.url || `/${file.path}`;
    window.open(fileUrl, '_blank');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDeleteClick = () => {
    if (
      window.confirm(
        'Are you sure you want to delete this task? This action cannot be undone.'
      )
    ) {
      onDelete(task._id);
      onClose();
    }
  };

  const handleDownload = () => {
    // Create an invisible iframe to trigger download without opening new tab
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = `${process.env.NEXT_PUBLIC_API_URL}/tasks/${task._id}/download`;
    document.body.appendChild(iframe);

    // Clean up after a delay (download will have started)
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 5000);
  };

  if (!task) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task.title} size="lg">
      <div className="space-y-6">
        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 border-b pb-4">
          <span className="font-medium text-gray-900">
            {task.company?.name || 'Unknown Company'}
          </span>
          {task.company?.place && (
            <>
              <span>•</span>
              <span>{task.company.place}</span>
            </>
          )}
          <span>•</span>
          <span>Created {formatDate(task.createdAt)}</span>
          {task.submittedBy && (
            <>
              <span>•</span>
              <span>by {task.submittedBy.name}</span>
            </>
          )}
        </div>

        {/* Tech Stack */}
        {task.techStack && task.techStack.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Tech Stack</h4>
            <div className="flex flex-wrap gap-2">
              {task.techStack.map((stack, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                >
                  {stack}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
          <div
            className="prose prose-sm max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: task.body }}
          />
        </div>

        {/* Attachments */}
        {task.files && task.files.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Attachments ({task.files.length})
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {task.files.map((file, idx) => {
                const fileUrl = file.url || `/${file.path}`;
                const isImage = file.mimetype?.startsWith('image/');
                const isPdf = file.mimetype === 'application/pdf';

                return (
                  <div
                    key={idx}
                    onClick={() => handleFileClick(file)}
                    className="border rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow group"
                  >
                    {isImage ? (
                      <img
                        src={fileUrl}
                        alt={file.originalName}
                        className="w-full h-24 object-cover"
                      />
                    ) : (
                      <div className="w-full h-24 bg-gray-100 flex items-center justify-center">
                        <div className="text-center">
                          <span className="text-3xl">📄</span>
                          <p className="text-xs text-gray-600 mt-1 px-1 truncate">
                            PDF
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="p-2 bg-gray-50">
                      <p className="text-xs text-gray-600 truncate" title={file.originalName}>
                        {file.originalName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {task.tags.map((tag) => (
                <span
                  key={tag._id}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Creator Info */}
        {task.submittedBy && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Submitted By
            </h4>
            <div className="text-sm text-gray-600">
              <p className="font-medium">{task.submittedBy.name}</p>
              {task.submittedBy.email && (
                <p className="text-gray-500">{task.submittedBy.email}</p>
              )}
              <p className="text-gray-400 text-xs mt-1">
                Created: {formatDate(task.createdAt)}
              </p>
            </div>
          </div>
        )}

        {/* Footer - Actions */}
        <div className="flex justify-end gap-3 border-t pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="secondary"
            onClick={handleDownload}
          >
            Download Task
          </Button>
          {isOwner && (
            <>
              <Button
                variant="primary"
                onClick={() => {
                  onClose();
                  onEdit(task);
                }}
              >
                Edit Task
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteClick}
              >
                Delete
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default TaskDetailModal;
