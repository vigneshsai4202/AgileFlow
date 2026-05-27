import { useEffect, useState } from 'react'
import { notificationService } from '../services/notificationService'
import toast from 'react-hot-toast'

const PREFS = [
  { key: 'emailOnAssign', label: 'Email when assigned to a task' },
  { key: 'emailOnComment', label: 'Email on new comments on your tasks' },
  { key: 'emailOnChange', label: 'Email when task status changes' },
  { key: 'dailyDigest', label: 'Daily digest email of assigned tasks' },
]

export default function NotificationSettingsPage() {
  const [prefs, setPrefs] = useState({
    emailOnAssign: true,
    emailOnComment: true,
    emailOnChange: false,
    dailyDigest: false,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    notificationService.getPreferences().then(({ data }) => setPrefs(data)).catch(() => {})
  }, [])

  const toggle = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }))

  const save = async () => {
    setSaving(true)
    try {
      await notificationService.updatePreferences(prefs)
      toast.success('Preferences saved')
    } catch {
      toast.error('Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-lg">
      <h2 className="text-lg font-semibold text-gray-800 mb-1">Notification Preferences</h2>
      <p className="text-sm text-gray-500 mb-6">Choose how and when you receive notifications.</p>

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {PREFS.map(({ key, label }) => (
          <label key={key} className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors">
            <span className="text-sm text-gray-700">{label}</span>
            <button
              type="button"
              onClick={() => toggle(key)}
              className={`relative w-10 h-5 rounded-full transition-colors ${prefs[key] ? 'bg-blue-500' : 'bg-gray-300'}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${prefs[key] ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </button>
          </label>
        ))}
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="mt-5 px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {saving ? 'Saving…' : 'Save Preferences'}
      </button>
    </div>
  )
}
