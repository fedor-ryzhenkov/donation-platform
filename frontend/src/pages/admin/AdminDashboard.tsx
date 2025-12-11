import { Link } from 'react-router-dom'

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="text-xl font-bold text-indigo-600">
              Donation Platform
            </Link>
            <span className="text-sm text-gray-500">Admin Dashboard</span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <h3 className="text-sm font-medium text-gray-500">Total Donations</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">$0</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <h3 className="text-sm font-medium text-gray-500">Active Campaigns</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <h3 className="text-sm font-medium text-gray-500">Total Influencers</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">All Donations</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-500 text-center py-8">No donations yet</p>
          </div>
        </div>
      </main>
    </div>
  )
}
