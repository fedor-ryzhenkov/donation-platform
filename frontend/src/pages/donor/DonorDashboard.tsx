import { Link } from 'react-router-dom'

export default function DonorDashboard() {
  return (
    <div className="min-h-screen bg-surface-50">
      <nav className="bg-white shadow-sm border-b border-surface-200">
        <div className="container-page">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="text-xl font-bold text-gradient font-display">
              Donation Platform
            </Link>
            <span className="badge badge-success">Donor Portal</span>
          </div>
        </div>
      </nav>

      <main className="container-page py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-surface-950 font-display">Browse Campaigns</h1>
          <p className="text-surface-500 mt-2">Discover campaigns from your favorite creators and make a difference</p>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Search campaigns..." 
              className="input pl-10"
            />
          </div>
          <select className="input w-full sm:w-48">
            <option value="">All Categories</option>
            <option value="gaming">Gaming</option>
            <option value="music">Music</option>
            <option value="art">Art</option>
            <option value="education">Education</option>
          </select>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Empty state */}
          <div className="card p-8 text-center col-span-full">
            <div className="max-w-sm mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <svg className="w-10 h-10 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-surface-900 mb-2 font-display">No campaigns available</h3>
              <p className="text-surface-500 mb-6">Check back soon for new campaigns to support! We're working with amazing creators.</p>
              <Link to="/" className="btn btn-ghost">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </Link>
            </div>
          </div>

          {/* Campaign card template (hidden, for reference) */}
          {/* 
          <div className="card card-hover overflow-hidden">
            <div className="aspect-video bg-surface-200 relative">
              <img src="..." alt="..." className="w-full h-full object-cover" />
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <img src="..." alt="..." className="w-8 h-8 rounded-full" />
                <span className="text-sm text-surface-600">Creator Name</span>
              </div>
              <h3 className="text-lg font-semibold text-surface-900 mb-2">Campaign Title</h3>
              <p className="text-surface-500 text-sm mb-4 line-clamp-2">Campaign description goes here...</p>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-surface-900">$5,000</span>
                  <span className="text-surface-500">of $10,000</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '50%' }}></div>
                </div>
              </div>
              <button className="btn btn-primary w-full">Donate Now</button>
            </div>
          </div>
          */}
        </div>
      </main>
    </div>
  )
}
