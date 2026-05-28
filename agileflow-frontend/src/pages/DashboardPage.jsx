import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { projectService } from '../services/projectService'
import { taskService } from '../services/taskService'
import { reportService } from '../services/reportService'
import StatCard from '../components/dashboard/StatCard'
import ProjectCard from '../components/projects/ProjectCard'
import { VelocityCard } from '../components/dashboard/SprintAnalyticsPanel'
import Spinner from '../components/common/Spinner'
import toast from 'react-hot-toast'
import { FolderKanban, CheckSquare, Clock, BarChart3 } from 'lucide-react'
import { PRIORITY_COLORS, STATUS_COLORS, formatDate } from '../utils/helpers'

export default function DashboardPage() {
  const [projects, setProjects] = useState([])
  const [recentTasks, setRecentTasks] = useState([])
  const [velocityData, setVelocityData] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await projectService.getAll()
        setProjects(data)

        // Load tasks from first 3 projects
        const taskPromises = data.slice(0, 3).map((p) =>
          taskService.getByProject(p._id).then((r) => r.data)
        )
        const taskArrays = await Promise.all(taskPromises)
        const allTasks = taskArrays.flat().slice(0, 8)
        setRecentTasks(allTasks)

        // Load velocity from first project that has sprints
        if (data.length > 0) {
          for (const p of data.slice(0, 3)) {
            try {
              const { data: vel } = await reportService.getVelocityReport(p._id)
              if (vel.velocity?.length > 0) { setVelocityData(vel); break }
            } catch {}
          }
        }
      } catch {
        toast.error('Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <Spinner size="lg" />

  const totalTasks = recentTasks.length
  const doneTasks = recentTasks.filter((t) => t.status === 'Done').length
  const pendingTasks = recentTasks.filter((t) => t.status !== 'Done').length

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Projects" value={projects.length} icon={FolderKanban} color="blue" />
        <StatCard label="Total Tasks" value={totalTasks} icon={BarChart3} color="purple" />
        <StatCard label="Completed" value={doneTasks} icon={CheckSquare} color="green" />
        <StatCard label="Pending" value={pendingTasks} icon={Clock} color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Recent Projects</h2>
            <button
              onClick={() => navigate('/projects')}
              className="text-sm text-blue-600 hover:underline"
            >
              View all
            </button>
          </div>
          {projects.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No projects yet</p>
          ) : (
            <div className="space-y-3">
              {projects.slice(0, 4).map((p) => (
                <div
                  key={p._id}
                  onClick={() => navigate(`/projects/${p._id}`)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-sm shrink-0">
                    {p.title.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{p.title}</p>
                    <p className="text-xs text-gray-400">{formatDate(p.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Tasks */}
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4">Recent Tasks</h2>
          {recentTasks.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No tasks yet</p>
          ) : (
            <div className="space-y-3">
              {recentTasks.slice(0, 6).map((t) => (
                <div key={t._id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{t.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${STATUS_COLORS[t.status]}`}>
                        {t.status}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${PRIORITY_COLORS[t.priority]}`}>
                        {t.priority}
                      </span>
                    </div>
                  </div>
                  {t.dueDate && (
                    <span className="text-xs text-gray-400 shrink-0">{formatDate(t.dueDate)}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sprint Velocity */}
      {velocityData && (
        <VelocityCard data={velocityData.velocity} avgVelocity={velocityData.avgVelocity} />
      )}
    </div>
  )
}
