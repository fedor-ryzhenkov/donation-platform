import { Link } from 'react-router-dom'

export default function InfluencerDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="text-xl font-bold text-indigo-600">
              Donation Platform
            </Link>
            <span className="text-sm text-gray-500">Influencer Portal</span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Campaigns</h1>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
            Create Campaign
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <h3 className="text-sm font-medium text-gray-500">Total Raised</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">$0</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <h3 className="text-sm font-medium text-gray-500">Active Campaigns</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Campaign List</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-500 text-center py-8">No campaigns yet. Create your first campaign!</p>
          </div>
        </div>
      </main>
    </div>
  )
}
