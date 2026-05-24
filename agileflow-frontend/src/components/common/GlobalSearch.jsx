import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { taskService } from '../../services/taskService'
import { Search, X } from 'lucide-react'
import { TYPE_COLORS, PRIORITY_COLORS } from '../../utils/helpers'

export default function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const ref = useRef()
  const navigate = useNavigate()

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const { data } = await taskService.search(query)
        setResults(data)
      } catch { setResults([]) }
      finally { setLoading(false) }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSelect = (task) => {
    navigate(`/projects/${task.projectId._id || task.projectId}`)
    setQuery('')
    setResults([])
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative w-64">
      <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
        <Search size={15} className="text-gray-400 shrink-0" />
        <input
          className="bg-transparent text-sm w-full focus:outline-none placeholder-gray-400"
          placeholder="Search tasks..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults([]) }}>
            <X size={14} className="text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {open && query && (
        <div className="absolute top-full mt-1 w-full bg-white rounded-xl shadow-lg border border-gray-100 z-50 max-h-72 overflow-y-auto">
          {loading ? (
            <p className="text-xs text-gray-400 p-3 text-center">Searching...</p>
          ) : results.length === 0 ? (
            <p className="text-xs text-gray-400 p-3 text-center">No tasks found</p>
          ) : (
            results.map((task) => (
              <button
                key={task._id}
                onClick={() => handleSelect(task)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${TYPE_COLORS[task.type]}`}>
                    {task.type}
                  </span>
                  <span className="text-sm text-gray-800 truncate">{task.title}</span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5 truncate">
                  {task.projectId?.title}
                </p>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
