import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { projectService } from '../services/projectService'
import { taskService } from '../services/taskService'
import KanbanBoard from '../components/tasks/KanbanBoard'
import TaskForm from '../components/tasks/TaskForm'
import ProjectForm from '../components/projects/ProjectForm'
import Spinner from '../components/common/Spinner'
import EmptyState from '../components/common/EmptyState'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, ArrowLeft, CheckSquare } from 'lucide-react'
import { getErrorMessage } from '../utils/helpers'
import useAuthStore from '../store/authStore'

export default function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)

  const load = async () => {
    try {
      const [{ data: proj }, { data: taskList }] = await Promise.all([
        projectService.getById(id),
        taskService.getByProject(id),
      ])
      setProject(proj)
      setTasks(taskList)
    } catch {
      toast.error('Failed to load project')
      navigate('/projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  const handleCreateTask = async (form) => {
    try {
      const { data } = await taskService.create(form)
      setTasks((prev) => [data, ...prev])
      setShowTaskForm(false)
      toast.success('Task created!')
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return
    try {
      await taskService.delete(taskId)
      setTasks((prev) => prev.filter((t) => t._id !== taskId))
      toast.success('Task deleted')
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const handleStatusChange = async (taskId, status) => {
    try {
      const { data } = await taskService.update(taskId, { status })
      setTasks((prev) => prev.map((t) => (t._id === taskId ? data : t)))
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const handleUpdateProject = async (form) => {
    try {
      const { data } = await projectService.update(id, form)
      setProject(data)
      setShowEditForm(false)
      toast.success('Project updated!')
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const handleDeleteProject = async () => {
    if (!confirm('Delete this project and all its tasks?')) return
    try {
      await projectService.delete(id)
      toast.success('Project deleted')
      navigate('/projects')
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  if (loading) return <Spinner size="lg" />
  if (!project) return null

  const isOwner = project.createdBy?._id === user?._id || project.createdBy === user?._id

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/projects')}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{project.title}</h1>
            {project.description && (
              <p className="text-gray-500 text-sm mt-0.5">{project.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTaskForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            Add Task
          </button>
          {isOwner && (
            <>
              <button
                onClick={() => setShowEditForm(true)}
                className="btn-secondary p-2"
              >
                <Pencil size={16} />
              </button>
              <button onClick={handleDeleteProject} className="btn-danger p-2">
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Task stats */}
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <span>{tasks.length} total tasks</span>
        <span>·</span>
        <span className="text-green-600">{tasks.filter((t) => t.status === 'Done').length} done</span>
        <span>·</span>
        <span className="text-blue-600">{tasks.filter((t) => t.status === 'In Progress').length} in progress</span>
      </div>

      {/* Kanban */}
      {tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks yet"
          description="Add your first task to get started"
          action={
            <button onClick={() => setShowTaskForm(true)} className="btn-primary">
              Add Task
            </button>
          }
        />
      ) : (
        <KanbanBoard
          tasks={tasks}
          onDelete={handleDeleteTask}
          onStatusChange={handleStatusChange}
        />
      )}

      {showTaskForm && (
        <TaskForm
          onSubmit={handleCreateTask}
          onClose={() => setShowTaskForm(false)}
          projectId={id}
          members={project.members || []}
        />
      )}

      {showEditForm && (
        <ProjectForm
          onSubmit={handleUpdateProject}
          onClose={() => setShowEditForm(false)}
          initial={project}
        />
      )}
    </div>
  )
}
