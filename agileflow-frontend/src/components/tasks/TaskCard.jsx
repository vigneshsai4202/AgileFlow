import { Trash2, Calendar, User } from 'lucide-react'
import { PRIORITY_COLORS, formatDate } from '../../utils/helpers'

export default function TaskCard({ task, onDelete, onStatusChange }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-sm font-medium text-gray-800 leading-snug">{task.title}</h4>
        <button
          onClick={() => onDelete(task._id)}
          className="shrink-0 p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {task.description && (
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center gap-2 mb-3">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_COLORS[task.priority]}`}>
          {task.priority}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <User size={12} />
          <span className="truncate max-w-[80px]">
            {task.assignedTo?.name || 'Unassigned'}
          </span>
        </div>
        {task.dueDate && (
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>{formatDate(task.dueDate)}</span>
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100">
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task._id, e.target.value)}
          className="w-full text-xs border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
          onClick={(e) => e.stopPropagation()}
        >
          <option>Todo</option>
          <option>In Progress</option>
          <option>Done</option>
        </select>
      </div>
    </div>
  )
}
