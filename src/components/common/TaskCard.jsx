'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '../ui/Button';

const TaskCard = ({ task, onEdit, onDelete, currentUserId }) => {
  const router = useRouter();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const isOwner = task.submittedBy._id === currentUserId;

  const truncateText = (text, maxLength = 200) => {
    if (!text) return '';
    const stripHtml = (html) => {
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || '';
    };
    const plainText = stripHtml(text);
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength) + '...';
  };

  const handleFileClick = (file) => {
    if (file.mimetype.startsWith('image/')) {
      setImagePreview(`/${file.path}`);
    } else {
      // For PDFs, open in new tab
      window.open(`/${file.path}`, '_blank');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Render plain text from HTML with basic formatting
  const renderFormattedText = (html, isExpanded = false) => {
    const plainText = truncateText(html, isExpanded ? 2000 : 200);
    return plainText;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{task.title}</h3>
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
            <span className="font-medium">{task.company?.name || 'Unknown Company'}</span>
            {task.company?.place && (
              <>
                <span>•</span>
                <span>{task.company.place}</span>
              </>
            )}
            <span>•</span>
            <span>{formatDate(task.createdAt)}</span>
            <span>•</span>
            <span>by {task.submittedBy?.name}</span>
          </div>
        </div>

        {isOwner && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(task)}
            >
              Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this task?')) {
                  onDelete(task._id);
                }
              }}
            >
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Tech Stack */}
      {task.techStack && task.techStack.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {task.techStack.map((stack, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
            >
              {stack}
            </span>
          ))}
        </div>
      )}

      {/* Description */}
      <div className="mb-4">
        <div
          className="text-gray-700 whitespace-pre-wrap"
          dangerouslySetInnerHTML={{
            __html: showFullDescription
              ? task.body
              : truncateText(task.body, 200) + (task.body.length > 200 ? '...' : ''),
          }}
        />
        {task.body.length > 200 && (
          <button
            onClick={() => setShowFullDescription(!showFullDescription)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-1"
          >
            {showFullDescription ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {task.tags.map((tag) => (
            <span
              key={tag._id}
              className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
            >
              #{tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Files */}
      {task.files && task.files.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Attachments ({task.files.length})</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {task.files.map((file, idx) => (
              <div
                key={idx}
                onClick={() => handleFileClick(file)}
                className="border rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              >
                {file.mimetype.startsWith('image/') ? (
                  <img
                    src={`/${file.path}`}
                    alt={file.originalName}
                    className="w-full h-24 object-cover"
                  />
                ) : (
                  <div className="w-full h-24 bg-gray-100 flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-3xl">📄</span>
                      <p className="text-xs text-gray-600 mt-1 px-1 truncate">
                        {file.originalName}
                      </p>
                    </div>
                  </div>
                )}
                <div className="p-2 text-xs text-gray-600 truncate">
                  {file.originalName}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {imagePreview && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setImagePreview(null)}
        >
          <img
            src={imagePreview}
            alt="Preview"
            className="max-w-full max-h-full object-contain"
          />
          <button
            className="absolute top-4 right-4 text-white text-3xl"
            onClick={() => setImagePreview(null)}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
