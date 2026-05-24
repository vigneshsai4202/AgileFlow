import { useState } from 'react'
import Modal from '../common/Modal'

export default function ProjectForm({ onSubmit, onClose, initial = {} }) {
  const [form, setForm] = useState({
    title: initial.title || '',
    description: initial.description || '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setLoading(true)
    await onSubmit(form)
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
