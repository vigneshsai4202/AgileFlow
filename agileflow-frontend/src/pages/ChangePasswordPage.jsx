import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'
import { getErrorMessage } from '../utils/helpers'
import { Zap, KeyRound } from 'lucide-react'

export default function ChangePasswordPage() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const { user, setAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.newPassword.length < 6) return toast.error('New password must be at least 6 characters')
    if (form.newPassword !== form.confirmPassword) return toast.error('Passwords do not match')

    setLoading(true)
    try {
      await authService.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      })
      // Clear the mustChangePassword flag in local store
      setAuth({ ...user, mustChangePassword: false }, useAuthStore.getState().token)
      toast.success('Password changed successfully!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500 rounded-xl mb-4">
            <Zap size={24} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">AgileFlow</h1>
          <p className="text-slate-400 mt-1">Change your password</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-6">
            <KeyRound size={18} className="text-blue-600 shrink-0" />
            <p className="text-sm text-blue-700">
              For your security, you must set a new password before continuing.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="Password from your welcome email"
                value={form.currentPassword}
                onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="Min. 6 characters"
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="Repeat new password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-2">
              {loading ? 'Saving...' : 'Set New Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
