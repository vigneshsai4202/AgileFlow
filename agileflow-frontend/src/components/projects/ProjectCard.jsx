import { useNavigate } from 'react-router-dom'
import { Trash2, Users, Calendar } from 'lucide-react'
import { formatDate } from '../../utils/helpers'

export default function ProjectCard({ project, onDelete }) {
  const navigate = useNavigate()

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
          onClick={(e) => {
            e.stopPropagation()
            onDelete(project._id)
          }}
          className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <h3 className="font-semibold text-gray-800 mb-1 truncate">{project.title}</h3>
      <p className="text-sm text-gray-500 line-clamp-2 mb-4">
        {project.description || 'No description'}
      </p>

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
