'use client';

import Button from '../ui/Button';

const TaskCard = ({ task, onClick }) => {
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => onClick?.(task)}
    >
      {/* Header */}
      <div className="mb-4">
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
          <span>{task.files?.length || 0} attachments</span>
        </div>
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

      {/* Description - truncated */}
      <div className="mb-4">
        <p className="text-gray-700 leading-relaxed">
          {truncateText(task.body, 200)}
        </p>
      </div>

      {/* Tags - limited to 3 */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {task.tags.slice(0, 3).map((tag) => (
            <span
              key={tag._id}
              className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
            >
              #{tag.name}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-sm">
              +{task.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* View Details Button */}
      <div className="flex justify-end">
        <Button
          variant="primary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onClick(task);
          }}
        >
          View Details
        </Button>
      </div>

      {/* Image Preview Modal (removed - now in TaskDetailModal) */}
    </div>
  );
};

export default TaskCard;
