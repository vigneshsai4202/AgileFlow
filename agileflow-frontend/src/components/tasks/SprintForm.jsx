import { useState } from 'react'
import Modal from '../common/Modal'

export default function SprintForm({ onSubmit, onClose, projectId }) {
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '', goal: '', projectId })
  const [loading, setLoading] = useState(false)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.startDate || !form.endDate) return
    setLoading(true)
    await onSubmit(form)
    setLoading(false)
  }

  return (
    <Modal title="New Sprint" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sprint Name *</label>
          <input className="input-field" placeholder="e.g. Sprint 1" value={form.name}
            onChange={(e) => set('name', e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Goal</label>
          <input className="input-field" placeholder="Sprint goal" value={form.goal}
            onChange={(e) => set('goal', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
            <input type="date" className="input-field" value={form.startDate}
              onChange={(e) => set('startDate', e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
            <input type="date" className="input-field" value={form.endDate}
              onChange={(e) => set('endDate', e.target.value)} required />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? 'Creating...' : 'Create Sprint'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
