import TaskCard from './TaskCard'
import { STATUS_COLORS, STATUSES } from '../../utils/helpers'

const COLUMN_STYLES = {
  Todo: 'border-t-gray-400',
  'In Progress': 'border-t-blue-500',
  Done: 'border-t-green-500',
}

export default function KanbanBoard({ tasks, onDelete, onStatusChange }) {
  const columns = STATUSES.map((status) => ({
    status,
    tasks: tasks.filter((t) => t.status === status),
  }))

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {columns.map(({ status, tasks: colTasks }) => (
        <div
          key={status}
          className={`bg-gray-100 rounded-xl border-t-4 ${COLUMN_STYLES[status]} p-4`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700 text-sm">{status}</h3>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[status]}`}>
              {colTasks.length}
            </span>
          </div>

          <div className="space-y-3 min-h-[100px]">
            {colTasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onDelete={onDelete}
                onStatusChange={onStatusChange}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
