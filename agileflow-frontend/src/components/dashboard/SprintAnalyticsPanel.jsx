import { TrendingDown, Zap, CheckCircle2, Clock, ListTodo } from 'lucide-react'

// ── Burndown Chart ────────────────────────────────────────────────────────────
function BurndownChart({ data, total }) {
  if (!data || data.length === 0) return <p className="text-sm text-gray-400 text-center py-6">No data yet</p>

  const W = 480
  const H = 140
  const PAD = { top: 10, right: 10, bottom: 28, left: 32 }
  const chartW = W - PAD.left - PAD.right
  const chartH = H - PAD.top - PAD.bottom

  const xStep = data.length > 1 ? chartW / (data.length - 1) : chartW
  const yMax = total || Math.max(...data.map((d) => d.remaining), 1)

  const toX = (i) => PAD.left + i * xStep
  const toY = (v) => PAD.top + chartH - (v / yMax) * chartH

  const actualPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${toX(i)},${toY(d.remaining)}`).join(' ')
  const idealPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${toX(i)},${toY(d.ideal ?? 0)}`).join(' ')

  const areaPath = `${actualPath} L${toX(data.length - 1)},${PAD.top + chartH} L${PAD.left},${PAD.top + chartH} Z`

  const labelStep = Math.ceil(data.length / 6)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 140 }}>
      {/* Y gridlines */}
      {[0, 0.25, 0.5, 0.75, 1].map((f) => {
        const y = PAD.top + chartH * (1 - f)
        const val = Math.round(yMax * f)
        return (
          <g key={f}>
            <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="#f0f0f0" strokeWidth="1" />
            <text x={PAD.left - 4} y={y + 4} textAnchor="end" fontSize="9" fill="#aaa">{val}</text>
          </g>
        )
      })}
      {/* Ideal line */}
      <path d={idealPath} fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeDasharray="4 3" />
      {/* Actual area */}
      <path d={areaPath} fill="rgba(59,130,246,0.08)" />
      {/* Actual line */}
      <path d={actualPath} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* X labels */}
      {data.map((d, i) =>
        i % labelStep === 0 ? (
          <text key={i} x={toX(i)} y={H - 6} textAnchor="middle" fontSize="9" fill="#9ca3af">{d.label}</text>
        ) : null
      )}
      {/* Legend */}
      <line x1={W - 110} y1={12} x2={W - 96} y2={12} stroke="#3b82f6" strokeWidth="2" />
      <text x={W - 92} y={16} fontSize="9" fill="#6b7280">Actual</text>
      <line x1={W - 60} y1={12} x2={W - 46} y2={12} stroke="#d1d5db" strokeWidth="1.5" strokeDasharray="4 3" />
      <text x={W - 42} y={16} fontSize="9" fill="#6b7280">Ideal</text>
    </svg>
  )
}

// ── Velocity Chart ────────────────────────────────────────────────────────────
function VelocityChart({ data, avgVelocity }) {
  if (!data || data.length === 0) return <p className="text-sm text-gray-400 text-center py-6">No sprint data yet</p>

  const maxVal = Math.max(...data.map((d) => d.total), 1)
  const BAR_W = Math.min(48, Math.floor(360 / data.length) - 8)

  return (
    <div className="space-y-3">
      {avgVelocity > 0 && (
        <p className="text-xs text-gray-500">
          Avg velocity (completed sprints): <span className="font-semibold text-blue-600">{avgVelocity} tasks/sprint</span>
        </p>
      )}
      <div className="flex items-end gap-2 h-28 overflow-x-auto pb-1">
        {data.map((d, i) => {
          const totalH = maxVal > 0 ? Math.round((d.total / maxVal) * 88) : 0
          const doneH = d.total > 0 ? Math.round((d.completed / d.total) * totalH) : 0
          const remainH = totalH - doneH
          return (
            <div key={i} className="flex flex-col items-center gap-1 shrink-0" style={{ width: BAR_W }}>
              <span className="text-[9px] text-gray-500 font-medium">{d.completed}/{d.total}</span>
              <div className="flex flex-col justify-end rounded-t overflow-hidden" style={{ width: BAR_W, height: 88 }}>
                {remainH > 0 && <div style={{ height: remainH }} className="bg-gray-200" />}
                {doneH > 0 && <div style={{ height: doneH }} className="bg-blue-500" />}
              </div>
              <span
                className="text-[9px] text-gray-400 text-center leading-tight truncate w-full text-center"
                title={d.sprintName}
              >
                {d.sprintName.length > 8 ? d.sprintName.slice(0, 7) + '…' : d.sprintName}
              </span>
            </div>
          )
        })}
      </div>
      <div className="flex items-center gap-4 text-[10px] text-gray-500">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" /> Completed</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-gray-200 inline-block" /> Remaining</span>
      </div>
    </div>
  )
}

// ── Sprint Summary Stats ──────────────────────────────────────────────────────
function SprintStat({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={13} />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  )
}

// ── Main Export ───────────────────────────────────────────────────────────────
export function SprintBurndownCard({ report }) {
  if (!report) return null
  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <TrendingDown size={16} className="text-blue-500" />
          Burndown — {report.sprint.name}
        </h3>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          report.sprint.status === 'Active' ? 'bg-green-100 text-green-700' :
          report.sprint.status === 'Completed' ? 'bg-gray-100 text-gray-600' : 'bg-yellow-100 text-yellow-700'
        }`}>{report.sprint.status}</span>
      </div>

      {report.sprint.goal && (
        <p className="text-xs text-gray-500 italic">Goal: {report.sprint.goal}</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SprintStat icon={ListTodo} label="Total" value={report.total} color="bg-gray-100 text-gray-600" />
        <SprintStat icon={CheckCircle2} label="Done" value={report.completed} color="bg-green-100 text-green-600" />
        <SprintStat icon={Clock} label="In Progress" value={report.inProgress} color="bg-blue-100 text-blue-600" />
        <SprintStat icon={Zap} label="Completion" value={`${report.completionRate}%`} color="bg-purple-100 text-purple-600" />
      </div>

      <BurndownChart data={report.burndown} total={report.total} />
    </div>
  )
}

export function VelocityCard({ data, avgVelocity }) {
  return (
    <div className="card space-y-3">
      <h3 className="font-semibold text-gray-800 flex items-center gap-2">
        <Zap size={16} className="text-yellow-500" />
        Sprint Velocity
      </h3>
      <VelocityChart data={data} avgVelocity={avgVelocity} />
    </div>
  )
}
