import { useEffect, useState } from 'react'
import { userService } from '../services/userService'
import Spinner from '../components/common/Spinner'
import EmptyState from '../components/common/EmptyState'
import toast from 'react-hot-toast'
import { getErrorMessage, PRIORITY_COLORS, STATUS_COLORS } from '../utils/helpers'
import { Users, Trash2, ChevronDown, ChevronUp, Shield, User } from 'lucide-react'

export default function AdminPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState({})

  const load = async () => {
    try {
      const { data } = await userService.getWithTasks()
      setUsers(data)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const toggleExpand = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return
    try {
      await userService.deleteUser(id)
      setUsers((prev) => prev.filter((u) => u._id !== id))
      toast.success('User deleted')
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const handleRoleChange = async (id, role) => {
    try {
      const { data } = await userService.updateRole(id, role)
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, role: data.role } : u)))
      toast.success(`Role updated to ${data.role}`)
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  if (loading) return <Spinner size="lg" />

  const totalTasks = users.reduce((sum, u) => sum + u.tasks.length, 0)
  const totalDone = users.reduce(
    (sum, u) => sum + u.tasks.filter((t) => t.status === 'Done').length, 0
  )

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card flex items-center gap-4">
          <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <Users size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{users.length}</p>
            <p className="text-sm text-gray-500">Total Users</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-11 h-11 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
            <Shield size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{totalTasks}</p>
            <p className="text-sm text-gray-500">Assigned Tasks</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
            <Shield size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{totalDone}</p>
            <p className="text-sm text-gray-500">Completed Tasks</p>
          </div>
        </div>
      </div>

      {/* Users table */}
      {users.length === 0 ? (
        <EmptyState icon={Users} title="No users found" />
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">All Users & Assigned Tasks</h2>
          </div>

          <div className="divide-y divide-gray-100">
            {users.map((user) => (
              <div key={user._id}>
                {/* User row */}
                <div className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>

                  {/* Role badge + change */}
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                    className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <option value="member">member</option>
                    <option value="admin">admin</option>
                  </select>

                  {/* Task count */}
                  <button
                    onClick={() => toggleExpand(user._id)}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 transition-colors px-2 py-1 rounded-lg hover:bg-blue-50"
                  >
                    <span>{user.tasks.length} task{user.tasks.length !== 1 ? 's' : ''}</span>
                    {expanded[user._id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(user._id, user.name)}
                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* Expanded tasks */}
                {expanded[user._id] && (
                  <div className="bg-gray-50 px-6 pb-4">
                    {user.tasks.length === 0 ? (
                      <p className="text-xs text-gray-400 py-3 flex items-center gap-2">
                        <User size={13} /> No tasks assigned to this user
                      </p>
                    ) : (
                      <div className="space-y-2 pt-2">
                        {user.tasks.map((task) => (
                          <div
                            key={task._id}
                            className="flex items-center gap-3 bg-white rounded-lg px-4 py-3 border border-gray-100 shadow-sm"
                          >
                            {/* Task title + project */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">
                                {task.title}
                              </p>
                              <p className="text-xs text-gray-400 truncate">
                                {task.projectId?.title || 'Unknown project'}
                              </p>
                            </div>

                            {/* Priority */}
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${PRIORITY_COLORS[task.priority]}`}>
                              {task.priority}
                            </span>

                            {/* Status */}
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLORS[task.status]}`}>
                              {task.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
