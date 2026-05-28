import { useEffect, useState } from 'react'
import { projectService } from '../services/projectService'
import { taskService } from '../services/taskService'
import { userService } from '../services/userService'
import ProjectCard from '../components/projects/ProjectCard'
import ProjectForm from '../components/projects/ProjectForm'
import EmptyState from '../components/common/EmptyState'
import Spinner from '../components/common/Spinner'
import toast from 'react-hot-toast'
import { Plus, FolderKanban } from 'lucide-react'
import { getErrorMessage } from '../utils/helpers'
import useAuthStore from '../store/authStore'

export default function ProjectsPage() {
  const [projects, setProjects] = useState([])
  const [taskStats, setTaskStats] = useState({})
  const [allUsers, setAllUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const { user } = useAuthStore()
  const canCreate = ['admin', 'team_leader'].includes(user?.role)

  const load = async () => {
    try {
      const [{ data: projectList }, { data: users }] = await Promise.all([
        projectService.getAll(),
        userService.getAll(),
      ])
      setProjects(projectList)
      setAllUsers(users.filter((u) => u._id !== user?._id && u.role !== 'admin'))
      const stats = {}
      await Promise.all(projectList.map(async (p) => {
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
        {canCreate && (
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> New Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <EmptyState icon={FolderKanban} title="No projects yet"
          description={canCreate ? 'Create your first project to get started' : 'You have not been added to any projects yet'}
          action={canCreate ? <button onClick={() => setShowForm(true)} className="btn-primary">Create Project</button> : null} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {projects.map((p) => (
            <ProjectCard key={p._id} project={p} onDelete={handleDelete} taskStats={taskStats[p._id]} />
          ))}
        </div>
      )}

      {showForm && <ProjectForm onSubmit={handleCreate} onClose={() => setShowForm(false)} allUsers={allUsers} />}
    </div>
  )
}
