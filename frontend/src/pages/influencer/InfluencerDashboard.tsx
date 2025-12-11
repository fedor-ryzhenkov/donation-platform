import { Link } from 'react-router-dom'

export default function InfluencerDashboard() {
  return (
    <div className="min-h-screen bg-surface-50">
      <nav className="bg-white shadow-sm border-b border-surface-200">
        <div className="container-page">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="text-xl font-bold text-gradient font-display">
              Donation Platform
            </Link>
            <span className="badge badge-secondary">Influencer Portal</span>
          </div>
        </div>
      </nav>

      <main className="container-page py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold text-surface-950 font-display">My Campaigns</h1>
          <button className="btn btn-primary">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Campaign
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card card-hover p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-surface-500">Total Raised</h3>
                <p className="text-3xl font-bold text-surface-950 mt-2">$0</p>
              </div>
              <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-success-600">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              +0% this month
            </div>
          </div>
          <div className="card card-hover p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-surface-500">Active Campaigns</h3>
                <p className="text-3xl font-bold text-surface-950 mt-2">0</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
            <div className="mt-4 text-sm text-surface-500">
              0 pending approval
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-6 border-b border-surface-200">
            <h2 className="text-lg font-semibold text-surface-950 font-display">Campaign List</h2>
          </div>
          <div className="p-6">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-primary-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <p className="text-surface-600 font-medium">No campaigns yet</p>
              <p className="text-surface-400 text-sm mt-1 mb-6">Create your first campaign to start receiving donations</p>
              <button className="btn btn-outline">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
