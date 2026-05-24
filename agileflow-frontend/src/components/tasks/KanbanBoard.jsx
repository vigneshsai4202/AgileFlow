import { useState } from 'react'
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors, closestCorners,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import TaskCard from './TaskCard'
import { STATUS_COLORS, STATUSES } from '../../utils/helpers'

const COLUMN_STYLES = {
  Todo: 'border-t-gray-400',
  'In Progress': 'border-t-blue-500',
  Done: 'border-t-green-500',
}

function SortableTaskCard({ task, onDelete, onStatusChange, onCardClick }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task._id,
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard
        task={task}
        onDelete={onDelete}
        onStatusChange={onStatusChange}
        onClick={() => onCardClick(task)}
      />
    </div>
  )
}

export default function KanbanBoard({ tasks, onDelete, onStatusChange, onCardClick }) {
  const [activeTask, setActiveTask] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const columns = STATUSES.map((status) => ({
    status,
    tasks: tasks.filter((t) => t.status === status),
  }))

  const handleDragStart = ({ active }) => {
    setActiveTask(tasks.find((t) => t._id === active.id))
  }

  const handleDragEnd = ({ active, over }) => {
    setActiveTask(null)
    if (!over) return
    const draggedTask = tasks.find((t) => t._id === active.id)
    if (!draggedTask) return

    // Check if dropped on a column header or a task in another column
    const overTask = tasks.find((t) => t._id === over.id)
    const targetStatus = overTask ? overTask.status : over.id

    if (STATUSES.includes(targetStatus) && draggedTask.status !== targetStatus) {
      onStatusChange(draggedTask._id, targetStatus)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {columns.map(({ status, tasks: colTasks }) => (
          <SortableContext
            key={status}
            id={status}
            items={colTasks.map((t) => t._id)}
            strategy={verticalListSortingStrategy}
          >
            <div
              className={`bg-gray-100 rounded-xl border-t-4 ${COLUMN_STYLES[status]} p-4`}
              id={status}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-700 text-sm">{status}</h3>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[status]}`}>
                  {colTasks.length}
                </span>
              </div>
              <div className="space-y-3 min-h-[80px]">
                {colTasks.map((task) => (
                  <SortableTaskCard
                    key={task._id}
                    task={task}
                    onDelete={onDelete}
                    onStatusChange={onStatusChange}
                    onCardClick={onCardClick}
                  />
                ))}
              </div>
            </div>
          </SortableContext>
        ))}
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="rotate-2 scale-105 opacity-90">
            <TaskCard
              task={activeTask}
              onDelete={() => {}}
              onStatusChange={() => {}}
              onClick={() => {}}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
