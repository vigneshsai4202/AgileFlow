import { Calendar, User } from 'lucide-react'
import { PRIORITY_COLORS, TYPE_COLORS, TYPE_ICONS, formatDate } from '../../utils/helpers'

export default function TaskCard({ task, onDelete, onStatusChange, onClick }) {
  return (
    <div
      className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center gap-1.5 mb-2">
        <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${TYPE_COLORS[task.type]}`}>
          {TYPE_ICONS[task.type]} {task.type}
        </span>
        <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${PRIORITY_COLORS[task.priority]}`}>
          {task.priority}
        </span>
      </div>

      <h4 className="text-sm font-medium text-gray-800 leading-snug mb-2">{task.title}</h4>

      {task.description && (
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{task.description}</p>
      )}

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

      <div className="mt-3 pt-3 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task._id, e.target.value)}
          className="w-full text-xs border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
        >
          <option>Todo</option>
          <option>In Progress</option>
          <option>Done</option>
        </select>
      </div>
    </div>
  )
}
