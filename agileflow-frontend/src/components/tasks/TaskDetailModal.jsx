import { useState, useEffect } from 'react'
import { commentService } from '../../services/commentService'
import { taskService } from '../../services/taskService'
import useAuthStore from '../../store/authStore'
import { X, Trash2, Send } from 'lucide-react'
import { PRIORITY_COLORS, STATUS_COLORS, TYPE_COLORS, TYPE_ICONS, STATUSES, PRIORITIES, TASK_TYPES, formatDate, formatDateTime, getErrorMessage } from '../../utils/helpers'
import toast from 'react-hot-toast'

export default function TaskDetailModal({ task, onClose, onUpdate, onDelete, members = [] }) {
  const { user } = useAuthStore()
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [editField, setEditField] = useState(null)
  const [localTask, setLocalTask] = useState(task)

  useEffect(() => {
    commentService.getByTask(task._id).then(({ data }) => setComments(data)).catch(() => {})
  }, [task._id])

  const handleFieldUpdate = async (field, value) => {
    try {
      const { data } = await taskService.update(task._id, { [field]: value })
      setLocalTask(data)
      onUpdate(data)
      setEditField(null)
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return
    setSubmitting(true)
    try {
      const { data } = await commentService.add(task._id, commentText)
      setComments((prev) => [...prev, data])
      setCommentText('')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteComment = async (id) => {
    try {
      await commentService.delete(id)
      setComments((prev) => prev.filter((c) => c._id !== id))
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_COLORS[localTask.type]}`}>
              {TYPE_ICONS[localTask.type]} {localTask.type}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_COLORS[localTask.priority]}`}>
              {localTask.priority}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[localTask.status]}`}>
              {localTask.status}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { onDelete(task._id); onClose() }}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={16} />
            </button>
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Title */}
          {editField === 'title' ? (
            <input
              autoFocus
              className="text-xl font-bold text-gray-800 w-full border-b-2 border-blue-500 focus:outline-none pb-1"
              defaultValue={localTask.title}
              onBlur={(e) => handleFieldUpdate('title', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
            />
          ) : (
            <h2
              className="text-xl font-bold text-gray-800 cursor-pointer hover:text-blue-600 transition-colors"
              onClick={() => setEditField('title')}
            >
              {localTask.title}
            </h2>
          )}

          {/* Description */}
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Description</p>
            {editField === 'description' ? (
              <textarea
                autoFocus
                className="w-full text-sm text-gray-700 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
                defaultValue={localTask.description}
                onBlur={(e) => handleFieldUpdate('description', e.target.value)}
              />
            ) : (
              <p
                className="text-sm text-gray-600 cursor-pointer hover:bg-gray-50 rounded-lg p-2 -ml-2 transition-colors min-h-[36px]"
                onClick={() => setEditField('description')}
              >
                {localTask.description || <span className="text-gray-400 italic">Add description...</span>}
              </p>
            )}
          </div>

          {/* Fields grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Status</p>
              <select
                className="input-field text-sm"
                value={localTask.status}
                onChange={(e) => handleFieldUpdate('status', e.target.value)}
              >
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Priority</p>
              <select
                className="input-field text-sm"
                value={localTask.priority}
                onChange={(e) => handleFieldUpdate('priority', e.target.value)}
              >
                {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Type</p>
              <select
                className="input-field text-sm"
                value={localTask.type}
                onChange={(e) => handleFieldUpdate('type', e.target.value)}
              >
                {TASK_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Assignee</p>
              <select
                className="input-field text-sm"
                value={localTask.assignedTo?._id || localTask.assignedTo || ''}
                onChange={(e) => handleFieldUpdate('assignedTo', e.target.value || null)}
              >
                <option value="">Unassigned</option>
                {members.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Due Date</p>
              <input
                type="date"
                className="input-field text-sm"
                value={localTask.dueDate ? localTask.dueDate.split('T')[0] : ''}
                onChange={(e) => handleFieldUpdate('dueDate', e.target.value || null)}
              />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Created</p>
              <p className="text-sm text-gray-600 pt-2">{formatDate(localTask.createdAt)}</p>
            </div>
          </div>

          {/* Comments */}
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
              Comments ({comments.length})
            </p>
            <div className="space-y-3 mb-4">
              {comments.map((c) => (
                <div key={c._id} className="flex gap-3 group">
                  <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold shrink-0">
                    {c.author?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-700">{c.author?.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{formatDateTime(c.createdAt)}</span>
                        {c.author?._id === user?._id && (
                          <button
                            onClick={() => handleDeleteComment(c._id)}
                            className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Add comment */}
            <form onSubmit={handleAddComment} className="flex gap-2">
              <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold shrink-0">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 flex gap-2">
                <input
                  className="input-field text-sm flex-1"
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={submitting || !commentText.trim()}
                  className="btn-primary px-3 py-2"
                >
                  <Send size={14} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
