import { Link } from 'react-router-dom'

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-surface-50">
      <nav className="bg-white shadow-sm border-b border-surface-200">
        <div className="container-page">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="text-xl font-bold text-gradient font-display">
              Donation Platform
            </Link>
            <span className="badge badge-primary">Admin Dashboard</span>
          </div>
        </div>
      </nav>

      <main className="container-page py-8">
        <h1 className="text-3xl font-bold text-surface-950 mb-8 font-display">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card card-hover p-6">
            <h3 className="text-sm font-medium text-surface-500">Total Donations</h3>
            <p className="text-3xl font-bold text-surface-950 mt-2">$0</p>
            <div className="mt-4 flex items-center text-sm text-success-600">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              +0% from last month
            </div>
          </div>
          <div className="card card-hover p-6">
            <h3 className="text-sm font-medium text-surface-500">Active Campaigns</h3>
            <p className="text-3xl font-bold text-surface-950 mt-2">0</p>
            <div className="mt-4">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '0%' }}></div>
              </div>
            </div>
          </div>
          <div className="card card-hover p-6">
            <h3 className="text-sm font-medium text-surface-500">Total Influencers</h3>
            <p className="text-3xl font-bold text-surface-950 mt-2">0</p>
            <div className="mt-4 text-sm text-surface-500">
              0 new this month
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-6 border-b border-surface-200">
            <h2 className="text-lg font-semibold text-surface-950 font-display">All Donations</h2>
          </div>
          <div className="p-6">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-surface-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-surface-500">No donations yet</p>
              <p className="text-surface-400 text-sm mt-1">Donations will appear here once campaigns receive funding</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
