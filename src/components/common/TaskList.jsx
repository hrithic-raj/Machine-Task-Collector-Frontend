'use client';

import { useRouter } from 'next/navigation';
import TaskCard from './TaskCard';
import Pagination from '../ui/Pagination';
import Button from '../ui/Button';
import { useAuth } from '../../lib/auth';

const TaskList = ({ tasks, total, currentPage, totalPages, onPageChange, onEdit, onDelete, refreshList }) => {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <div>
      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No tasks found.</p>
          <p className="text-gray-400 text-sm mt-2">
            Be the first to add a machine task!
          </p>
        </div>
      ) : (
        <>
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              currentUserId={user?._id}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </>
      )}

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};

export default TaskList;
