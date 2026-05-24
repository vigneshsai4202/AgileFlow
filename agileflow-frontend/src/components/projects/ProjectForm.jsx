import { useState } from 'react'
import Modal from '../common/Modal'
import { X } from 'lucide-react'

export default function ProjectForm({ onSubmit, onClose, initial = {}, allUsers = [] }) {
  const initialMemberIds = (initial.members || []).map((m) => m._id || m)
  const [form, setForm] = useState({
    title: initial.title || '',
    description: initial.description || '',
  })
  const [memberIds, setMemberIds] = useState(initialMemberIds)
  const [loading, setLoading] = useState(false)

  const toggleMember = (id) =>
    setMemberIds((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    )

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setLoading(true)
    await onSubmit({ ...form, members: memberIds })
    setLoading(false)
  }

  return (
    <Modal title={initial._id ? 'Edit Project' : 'New Project'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input
            className="input-field"
            placeholder="Project title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            className="input-field resize-none"
            rows={3}
            placeholder="Project description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        {allUsers.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Members</label>
            <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto">
              {allUsers.map((u) => {
                const selected = memberIds.includes(u._id)
                return (
                  <button
                    key={u._id}
                    type="button"
                    onClick={() => toggleMember(u._id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      selected
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    {u.name}
                    {selected && <X size={11} />}
                  </button>
                )
              })}
            </div>
          </div>
        )}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? 'Saving...' : initial._id ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
