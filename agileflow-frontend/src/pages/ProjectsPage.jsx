import { useEffect, useState } from 'react'
import { projectService } from '../services/projectService'
import { taskService } from '../services/taskService'
import ProjectCard from '../components/projects/ProjectCard'
import ProjectForm from '../components/projects/ProjectForm'
import EmptyState from '../components/common/EmptyState'
import Spinner from '../components/common/Spinner'
import toast from 'react-hot-toast'
import { Plus, FolderKanban } from 'lucide-react'
import { getErrorMessage } from '../utils/helpers'

export default function ProjectsPage() {
  const [projects, setProjects] = useState([])
  const [taskStats, setTaskStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const load = async () => {
    try {
      const { data } = await projectService.getAll()
      setProjects(data)
      // Load task stats for each project
      const stats = {}
      await Promise.all(data.map(async (p) => {
        const { data: tasks } = await taskService.getByProject(p._id)
        stats[p._id] = { total: tasks.length, done: tasks.filter((t) => t.status === 'Done').length }
      }))
      setTaskStats(stats)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (form) => {
    try {
      const { data } = await projectService.create(form)
      setProjects((prev) => [data, ...prev])
      setTaskStats((prev) => ({ ...prev, [data._id]: { total: 0, done: 0 } }))
      setShowForm(false)
      toast.success('Project created!')
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this project?')) return
    try {
      await projectService.delete(id)
      setProjects((prev) => prev.filter((p) => p._id !== id))
      toast.success('Project deleted')
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  if (loading) return <Spinner size="lg" />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <EmptyState icon={FolderKanban} title="No projects yet" description="Create your first project to get started"
          action={<button onClick={() => setShowForm(true)} className="btn-primary">Create Project</button>} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {projects.map((p) => (
            <ProjectCard key={p._id} project={p} onDelete={handleDelete} taskStats={taskStats[p._id]} />
          ))}
        </div>
      )}

      {showForm && <ProjectForm onSubmit={handleCreate} onClose={() => setShowForm(false)} />}
    </div>
  )
}
