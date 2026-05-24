import { useNavigate } from 'react-router-dom'
import { Trash2, Users, Calendar } from 'lucide-react'
import { formatDate } from '../../utils/helpers'

export default function ProjectCard({ project, onDelete, taskStats }) {
  const navigate = useNavigate()
  const total = taskStats?.total || 0
  const done = taskStats?.done || 0
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div
      className="card hover:shadow-md transition-shadow cursor-pointer group"
      onClick={() => navigate(`/projects/${project._id}`)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-lg">
          {project.title.charAt(0).toUpperCase()}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(project._id) }}
          className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <h3 className="font-semibold text-gray-800 mb-1 truncate">{project.title}</h3>
      <p className="text-sm text-gray-500 line-clamp-2 mb-3">
        {project.description || 'No description'}
      </p>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
          <span>{done}/{total} tasks done</span>
          <span>{pct}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div
            className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <Users size={13} />
          <span>{project.members?.length || 0} members</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar size={13} />
          <span>{formatDate(project.createdAt)}</span>
        </div>
      </div>
    </div>
  )
}
