import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-gray-200">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mt-4">Page not found</h2>
        <p className="text-gray-500 mt-2 mb-6">The page you're looking for doesn't exist.</p>
        <Link to="/dashboard" className="btn-primary inline-block">
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
