import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { projectService } from '../services/projectService'
import { taskService } from '../services/taskService'
import { userService } from '../services/userService'
import { sprintService } from '../services/sprintService'
import KanbanBoard from '../components/tasks/KanbanBoard'
import TaskForm from '../components/tasks/TaskForm'
import TaskDetailModal from '../components/tasks/TaskDetailModal'
import SprintForm from '../components/tasks/SprintForm'
import ProjectForm from '../components/projects/ProjectForm'
import Spinner from '../components/common/Spinner'
import EmptyState from '../components/common/EmptyState'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, ArrowLeft, CheckSquare, BarChart2, Zap, Filter } from 'lucide-react'
import { getErrorMessage, TASK_TYPES, PRIORITIES } from '../utils/helpers'
import useAuthStore from '../store/authStore'

export default function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [sprints, setSprints] = useState([])
  const [loading, setLoading] = useState(true)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showSprintForm, setShowSprintForm] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [filters, setFilters] = useState({ type: '', priority: '', sprintId: '' })

  const load = async () => {
    try {
      const [{ data: proj }, { data: taskList }, { data: users }, { data: sprintList }] =
        await Promise.all([
          projectService.getById(id),
          taskService.getByProject(id),
          userService.getAll(),
          sprintService.getByProject(id),
        ])
      setProject(proj)
      setTasks(taskList)
      setAllUsers(users)
      setSprints(sprintList)
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
    } catch (err) { toast.error(getErrorMessage(err)) }
  }

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return
    try {
      await taskService.delete(taskId)
      setTasks((prev) => prev.filter((t) => t._id !== taskId))
      toast.success('Task deleted')
    } catch (err) { toast.error(getErrorMessage(err)) }
  }

  const handleStatusChange = async (taskId, status) => {
    try {
      const { data } = await taskService.update(taskId, { status })
      setTasks((prev) => prev.map((t) => (t._id === taskId ? data : t)))
    } catch (err) { toast.error(getErrorMessage(err)) }
  }

  const handleTaskUpdate = (updated) => {
    setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)))
    setSelectedTask(updated)
  }

  const handleUpdateProject = async (form) => {
    try {
      const { data } = await projectService.update(id, form)
      setProject(data)
      setShowEditForm(false)
      toast.success('Project updated!')
    } catch (err) { toast.error(getErrorMessage(err)) }
  }

  const handleDeleteProject = async () => {
    if (!confirm('Delete this project and all its tasks?')) return
    try {
      await projectService.delete(id)
      toast.success('Project deleted')
      navigate('/projects')
    } catch (err) { toast.error(getErrorMessage(err)) }
  }

  const handleCreateSprint = async (form) => {
    try {
      const { data } = await sprintService.create(form)
      setSprints((prev) => [data, ...prev])
      setShowSprintForm(false)
      toast.success('Sprint created!')
    } catch (err) { toast.error(getErrorMessage(err)) }
  }

  const handleDeleteSprint = async (sprintId) => {
    if (!confirm('Delete this sprint?')) return
    try {
      await sprintService.delete(sprintId)
      setSprints((prev) => prev.filter((s) => s._id !== sprintId))
      toast.success('Sprint deleted')
    } catch (err) { toast.error(getErrorMessage(err)) }
  }

  if (loading) return <Spinner size="lg" />
  if (!project) return null

  const isOwner = project.createdBy?._id === user?._id || project.createdBy === user?._id

  // Apply filters
  const filteredTasks = tasks.filter((t) => {
    if (filters.type && t.type !== filters.type) return false
    if (filters.priority && t.priority !== filters.priority) return false
    if (filters.sprintId && (t.sprintId?._id || t.sprintId) !== filters.sprintId) return false
    return true
  })

  const done = tasks.filter((t) => t.status === 'Done').length
  const pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/projects')}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{project.title}</h1>
            {project.description && <p className="text-gray-500 text-sm mt-0.5">{project.description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button onClick={() => navigate(`/projects/${id}/reports`)}
            className="btn-secondary flex items-center gap-2 text-sm">
            <BarChart2 size={15} /> Reports
          </button>
          <button onClick={() => setShowSprintForm(true)}
            className="btn-secondary flex items-center gap-2 text-sm">
            <Zap size={15} /> New Sprint
          </button>
          <button onClick={() => setShowTaskForm(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Task
          </button>
          {isOwner && (
            <>
              <button onClick={() => setShowEditForm(true)} className="btn-secondary p-2"><Pencil size={16} /></button>
              <button onClick={handleDeleteProject} className="btn-danger p-2"><Trash2 size={16} /></button>
            </>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="card py-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600 font-medium">Overall Progress</span>
          <span className="text-gray-500">{done}/{tasks.length} tasks · {pct}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div className="bg-blue-500 h-2 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
          <span>{tasks.filter((t) => t.status === 'Todo').length} todo</span>
          <span className="text-blue-600">{tasks.filter((t) => t.status === 'In Progress').length} in progress</span>
          <span className="text-green-600">{done} done</span>
        </div>
      </div>

      {/* Sprints */}
      {sprints.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Sprints:</span>
          {sprints.map((s) => (
            <div key={s._id} className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs">
              <Zap size={11} className="text-blue-500" />
              <span className="font-medium text-gray-700">{s.name}</span>
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                s.status === 'Active' ? 'bg-green-100 text-green-700' :
                s.status === 'Completed' ? 'bg-gray-100 text-gray-500' : 'bg-yellow-100 text-yellow-700'
              }`}>{s.status}</span>
              <button onClick={() => handleDeleteSprint(s._id)} className="ml-1 text-gray-300 hover:text-red-500 transition-colors">
                <Trash2 size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <Filter size={15} className="text-gray-400" />
        <select className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={filters.type} onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}>
          <option value="">All Types</option>
          {TASK_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <select className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={filters.priority} onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))}>
          <option value="">All Priorities</option>
          {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
        </select>
        {sprints.length > 0 && (
          <select className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={filters.sprintId} onChange={(e) => setFilters((f) => ({ ...f, sprintId: e.target.value }))}>
            <option value="">All Sprints</option>
            {sprints.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        )}
        {(filters.type || filters.priority || filters.sprintId) && (
          <button onClick={() => setFilters({ type: '', priority: '', sprintId: '' })}
            className="text-xs text-blue-600 hover:underline">Clear filters</button>
        )}
      </div>

      {/* Kanban */}
      {filteredTasks.length === 0 && tasks.length === 0 ? (
        <EmptyState icon={CheckSquare} title="No tasks yet" description="Add your first task to get started"
          action={<button onClick={() => setShowTaskForm(true)} className="btn-primary">Add Task</button>} />
      ) : (
        <KanbanBoard
          tasks={filteredTasks}
          onDelete={handleDeleteTask}
          onStatusChange={handleStatusChange}
          onCardClick={setSelectedTask}
        />
      )}

      {/* Modals */}
      {showTaskForm && (
        <TaskForm onSubmit={handleCreateTask} onClose={() => setShowTaskForm(false)}
          projectId={id} members={allUsers} sprints={sprints} />
      )}
      {showEditForm && (
        <ProjectForm onSubmit={handleUpdateProject} onClose={() => setShowEditForm(false)} initial={project} allUsers={allUsers} />
      )}
      {showSprintForm && (
        <SprintForm onSubmit={handleCreateSprint} onClose={() => setShowSprintForm(false)} projectId={id} />
      )}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleTaskUpdate}
          onDelete={(taskId) => { handleDeleteTask(taskId); setSelectedTask(null) }}
          members={allUsers}
        />
      )}
    </div>
  )
}
