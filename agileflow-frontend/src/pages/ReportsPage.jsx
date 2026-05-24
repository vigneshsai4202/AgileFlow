import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { reportService } from '../services/reportService'
import { activityService } from '../services/activityService'
import Spinner from '../components/common/Spinner'
import toast from 'react-hot-toast'
import { ArrowLeft, BarChart2 } from 'lucide-react'
import { PRIORITY_COLORS, STATUS_COLORS, TYPE_COLORS, formatDateTime } from '../utils/helpers'

function Bar({ label, value, max, color }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 w-20 shrink-0 text-right">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-3">
        <div className={`h-3 rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-medium text-gray-700 w-6 text-right">{value}</span>
    </div>
  )
}

function BurndownChart({ data }) {
  const max = Math.max(...data.map((d) => d.done), 1)
  return (
    <div className="flex items-end gap-1 h-24">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full bg-blue-400 rounded-t transition-all duration-500"
            style={{ height: `${(d.done / max) * 80}px`, minHeight: d.done > 0 ? '4px' : '0' }}
          />
          {i % 3 === 0 && (
            <span className="text-xs text-gray-400 rotate-45 origin-left" style={{ fontSize: '9px' }}>
              {d.label}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

export default function ReportsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [report, setReport] = useState(null)
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      reportService.getProjectReport(id),
      activityService.getByProject(id),
    ]).then(([{ data: r }, { data: a }]) => {
      setReport(r)
      setActivity(a)
    }).catch(() => toast.error('Failed to load report'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Spinner size="lg" />
  if (!report) return null

  const maxStatus = Math.max(...Object.values(report.byStatus))
  const maxPriority = Math.max(...Object.values(report.byPriority))
  const maxType = Math.max(...Object.values(report.byType))
  const maxMember = Math.max(...Object.values(report.byMember), 1)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Project Reports</h1>
          <p className="text-sm text-gray-500">{report.total} total tasks</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Status */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart2 size={16} className="text-blue-500" /> Tasks by Status
          </h3>
          <div className="space-y-3">
            {Object.entries(report.byStatus).map(([k, v]) => (
              <Bar key={k} label={k} value={v} max={maxStatus} color="bg-blue-400" />
            ))}
          </div>
        </div>

        {/* By Priority */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart2 size={16} className="text-yellow-500" /> Tasks by Priority
          </h3>
          <div className="space-y-3">
            {Object.entries(report.byPriority).map(([k, v]) => (
              <Bar key={k} label={k} value={v} max={maxPriority}
                color={k === 'High' ? 'bg-red-400' : k === 'Medium' ? 'bg-yellow-400' : 'bg-green-400'} />
            ))}
          </div>
        </div>

        {/* By Type */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart2 size={16} className="text-purple-500" /> Tasks by Type
          </h3>
          <div className="space-y-3">
            {Object.entries(report.byType).map(([k, v]) => (
              <Bar key={k} label={k} value={v} max={maxType} color="bg-purple-400" />
            ))}
          </div>
        </div>

        {/* By Member */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart2 size={16} className="text-green-500" /> Tasks by Member
          </h3>
          {Object.keys(report.byMember).length === 0 ? (
            <p className="text-sm text-gray-400">No assigned tasks yet</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(report.byMember).map(([k, v]) => (
                <Bar key={k} label={k} value={v} max={maxMember} color="bg-green-400" />
              ))}
            </div>
          )}
        </div>

        {/* Burndown */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Tasks Completed (Last 14 Days)</h3>
          <BurndownChart data={report.burndown} />
        </div>

        {/* Activity Log */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Activity Log</h3>
          {activity.length === 0 ? (
            <p className="text-sm text-gray-400">No activity yet</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {activity.map((a) => (
                <div key={a._id} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold shrink-0 mt-0.5">
                    {a.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">{a.user?.name}</span>{' '}
                      <span className="text-gray-500">{a.action}</span>{' '}
                      {a.detail && <span className="text-gray-600 font-medium">"{a.detail}"</span>}
                    </p>
                    <p className="text-xs text-gray-400">{formatDateTime(a.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
