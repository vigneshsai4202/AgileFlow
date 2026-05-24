export const PRIORITY_COLORS = {
  Low: 'bg-green-100 text-green-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  High: 'bg-red-100 text-red-700',
}

export const STATUS_COLORS = {
  Todo: 'bg-gray-100 text-gray-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  Done: 'bg-green-100 text-green-700',
}

export const STATUSES = ['Todo', 'In Progress', 'Done']
export const PRIORITIES = ['Low', 'Medium', 'High']

export const formatDate = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export const getErrorMessage = (err) =>
  err?.response?.data?.message || err?.message || 'Something went wrong'
