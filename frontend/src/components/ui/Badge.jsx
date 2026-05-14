export default function Badge({ status, type = 'status' }) {
  const statusColors = {
    TODO: 'bg-gray-100 text-gray-700',
    IN_PROGRESS: 'bg-amber-100 text-amber-700',
    DONE: 'bg-green-100 text-green-700',
    ACTIVE: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-green-100 text-green-700',
    ARCHIVED: 'bg-gray-100 text-gray-600',
    HIGH: 'bg-red-100 text-red-700',
    MEDIUM: 'bg-amber-100 text-amber-700',
    LOW: 'bg-green-100 text-green-700',
  };

  const labels = {
    TODO: 'To Do',
    IN_PROGRESS: 'In Progress',
    DONE: 'Done',
    ACTIVE: 'Active',
    COMPLETED: 'Completed',
    ARCHIVED: 'Archived',
    HIGH: 'High',
    MEDIUM: 'Medium',
    LOW: 'Low',
  };

  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-600'}`}>
      {labels[status] || status}
    </span>
  );
}