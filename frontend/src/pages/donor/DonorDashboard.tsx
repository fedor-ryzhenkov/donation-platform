import { Link } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import { authApi, campaignsApi, donorsApi, donationsApi } from '../../api/client'
import type { Campaign, Donor, CreateDonation } from '../../api/client'

export default function DonorDashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [donor, setDonor] = useState<Donor | null>(null)
  const [donorId, setDonorId] = useState<number | null>(() => {
    const raw = sessionStorage.getItem('donor_id')
    const n = raw ? parseInt(raw) : NaN
    return Number.isFinite(n) ? n : null
  })
  const [loading, setLoading] = useState(true)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '' })
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [showDonateModal, setShowDonateModal] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [donationForm, setDonationForm] = useState({ amount: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      const [campaignsData, donorData] = await Promise.all([
        campaignsApi.list(),
        donorId ? donorsApi.get(donorId) : Promise.resolve(null),
      ])
      setCampaigns(campaignsData)
      setDonor(donorData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }, [donorId])

  useEffect(() => {
    loadData()
  }, [loadData])

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setAuthError(null)
    try {
      const newDonor = await donorsApi.create(signupForm)
      sessionStorage.setItem('donor_id', String(newDonor.id))
      setDonorId(newDonor.id)
      setDonor(newDonor)
      setSignupForm({ name: '', email: '', password: '' })
    } catch (error) {
      console.error('Failed to create donor:', error)
      setAuthError('Failed to create account.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setAuthError(null)
    try {
      const { id } = await authApi.loginDonor(loginForm.email, loginForm.password)
      sessionStorage.setItem('donor_id', String(id))
      setDonorId(id)
      const loaded = await donorsApi.get(id)
      setDonor(loaded)
      setLoginForm({ email: '', password: '' })
    } catch (error) {
      console.error('Failed to login:', error)
      setAuthError('Invalid email or password.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDonate(e: React.FormEvent) {
    e.preventDefault()
    if (!donor || !selectedCampaign) return

    setSubmitting(true)
    try {
      const donation: CreateDonation = {
        donorId: donor.id,
        campaignId: selectedCampaign.id,
        amount: parseFloat(donationForm.amount),
        message: donationForm.message,
      }
      await donationsApi.create(donation)
      
      // Refresh campaigns to update amounts
      const updatedCampaigns = await campaignsApi.list()
      setCampaigns(updatedCampaigns)
      
      setShowDonateModal(false)
      setSelectedCampaign(null)
      setDonationForm({ amount: '', message: '' })
      alert('Thank you for your donation!')
    } catch (error) {
      console.error('Failed to create donation:', error)
      alert('Failed to process donation. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function openDonateModal(campaign: Campaign) {
    if (!donor) return
    setSelectedCampaign(campaign)
    setShowDonateModal(true)
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  // Filter campaigns
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         campaign.influencer?.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = !statusFilter || campaign.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Only show active campaigns by default
  const activeCampaigns = filteredCampaigns.filter(c => c.status === 'active')
  const displayCampaigns = statusFilter ? filteredCampaigns : activeCampaigns

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-surface-600">Loading campaigns...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <nav className="bg-white shadow-sm border-b border-surface-200">
        <div className="container-page">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="text-xl font-bold text-gradient font-display">
              Donation Platform
            </Link>
            <div className="flex items-center gap-4">
              {donor ? (
                <>
                  <span className="text-sm text-surface-600">Signed in as <span className="font-medium text-surface-900">{donor.name}</span></span>
                  <button
                    onClick={() => {
                      sessionStorage.removeItem('donor_id')
                      setDonorId(null)
                      setDonor(null)
                    }}
                    className="btn btn-ghost text-sm"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <span className="text-sm text-surface-500">Not signed in</span>
              )}
              <span className="badge badge-success">Donor Portal</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="container-page py-8">
        {!donor && (
          <div className="card p-6 mb-8">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-semibold text-surface-950 font-display">
                  {authMode === 'login' ? 'Log in' : 'Sign up'}
                </h2>
                <p className="text-sm text-surface-500 mt-1">
                  {authMode === 'login'
                    ? 'Use your email as username.'
                    : 'Create a donor account to start donating.'}
                </p>
              </div>
              <button
                onClick={() => {
                  setAuthError(null)
                  setAuthMode(authMode === 'login' ? 'signup' : 'login')
                }}
                className="btn btn-ghost text-sm"
              >
                {authMode === 'login' ? 'Need an account?' : 'Already have an account?'}
              </button>
            </div>

            {authMode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="label">Email (username)</label>
                  <input
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    className="input"
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="label">Password</label>
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="input"
                    placeholder="Enter password"
                    required
                  />
                </div>
                {authError && (
                  <div className="text-sm text-error-700 bg-error-50 border border-error-200 rounded-lg p-3">
                    {authError}
                  </div>
                )}
                <div className="flex justify-end">
                  <button type="submit" disabled={submitting} className="btn btn-primary">
                    {submitting ? 'Logging in...' : 'Log in'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="label">Your Name</label>
                  <input
                    type="text"
                    value={signupForm.name}
                    onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                    className="input"
                    placeholder="John Smith"
                    required
                  />
                </div>
                <div>
                  <label className="label">Email (username)</label>
                  <input
                    type="email"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                    className="input"
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="label">Password</label>
                  <input
                    type="password"
                    value={signupForm.password}
                    onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                    className="input"
                    placeholder="Create a password"
                    required
                  />
                </div>
                {authError && (
                  <div className="text-sm text-error-700 bg-error-50 border border-error-200 rounded-lg p-3">
                    {authError}
                  </div>
                )}
                <div className="flex justify-end">
                  <button type="submit" disabled={submitting} className="btn btn-primary">
                    {submitting ? 'Creating...' : 'Create account'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-surface-950 font-display">Browse Campaigns</h1>
          <p className="text-surface-500 mt-2">Discover campaigns from your favorite creators and make a difference</p>
        </div>

        {/* My Donation History */}
        {donor && donor.donations && donor.donations.length > 0 && (
          <div className="card p-6 mb-8">
            <h2 className="text-lg font-semibold text-surface-950 mb-4 font-display">My Recent Donations</h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {donor.donations.slice(0, 5).map((donation) => (
                <div key={donation.id} className="shrink-0 bg-surface-50 rounded-lg p-4 min-w-[200px]">
                  <p className="font-semibold text-success-600">{formatCurrency(donation.amount)}</p>
                  <p className="text-sm text-surface-600 truncate">{donation.campaign?.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Search campaigns or creators..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input w-full sm:w-48"
          >
            <option value="">Active Campaigns</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        
        {/* Campaign Grid */}
        {displayCampaigns.length === 0 ? (
          <div className="card p-8 text-center">
            <div className="max-w-sm mx-auto">
              <div className="w-20 h-20 bg-linear-to-br from-primary-100 to-secondary-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <svg className="w-10 h-10 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-surface-900 mb-2 font-display">
                {searchQuery ? 'No campaigns found' : 'No active campaigns'}
              </h3>
              <p className="text-surface-500 mb-6">
                {searchQuery 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'Check back soon for new campaigns to support!'}
              </p>
              {searchQuery && (
                <button 
                  onClick={() => { setSearchQuery(''); setStatusFilter(''); }}
                  className="btn btn-ghost"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayCampaigns.map((campaign) => (
              <div key={campaign.id} className="card card-hover overflow-hidden flex flex-col">
                {/* Campaign Header with Gradient */}
                <div className="h-32 bg-linear-to-br from-primary-500 to-secondary-500 relative">
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className={`badge ${
                      campaign.status === 'active' ? 'bg-white/90 text-success-700' :
                      campaign.status === 'completed' ? 'bg-white/90 text-primary-700' : 
                      'bg-white/90 text-warning-700'
                    }`}>
                      {campaign.status}
                    </span>
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  {/* Creator Info */}
                  <div className="flex items-center gap-2 mb-3">
                    <img 
                      src={campaign.influencer?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${campaign.influencer?.name}`}
                      alt={campaign.influencer?.name}
                      className="w-8 h-8 rounded-full bg-surface-200"
                    />
                    <span className="text-sm text-surface-600">{campaign.influencer?.name}</span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-surface-900 mb-2">{campaign.title}</h3>
                  <p className="text-surface-500 text-sm mb-4 line-clamp-2 flex-1">{campaign.description}</p>
                  
                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-semibold text-surface-900">{formatCurrency(campaign.currentAmount)}</span>
                      <span className="text-surface-500">of {formatCurrency(campaign.goalAmount)}</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${Math.min((campaign.currentAmount / campaign.goalAmount) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-surface-500 mt-1">
                      <span>{Math.round((campaign.currentAmount / campaign.goalAmount) * 100)}% funded</span>
                      <span>{campaign.donations?.length || 0} donations</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => openDonateModal(campaign)}
                    disabled={campaign.status !== 'active' || !donor}
                    className="btn btn-primary w-full disabled:opacity-50"
                  >
                    {!donor ? 'Log in to donate' : (campaign.status === 'active' ? 'Donate Now' : 'Campaign Ended')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Donate Modal */}
      {showDonateModal && selectedCampaign && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md">
            <div className="p-6 border-b border-surface-200">
              <h2 className="text-xl font-semibold text-surface-950 font-display">
                Donate to {selectedCampaign.title}
              </h2>
              <p className="text-sm text-surface-500 mt-1">
                by {selectedCampaign.influencer?.name}
              </p>
            </div>
            <form onSubmit={handleDonate}>
              <div className="p-6 space-y-4">
                {/* Quick amounts */}
                <div>
                  <label className="label">Quick Select</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[10, 25, 50, 100].map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => setDonationForm({ ...donationForm, amount: amount.toString() })}
                        className={`p-2 rounded-lg border text-sm font-medium transition-colors ${
                          donationForm.amount === amount.toString()
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-surface-300 hover:border-surface-400'
                        }`}
                      >
                        ${amount}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="label">Donation Amount ($)</label>
                  <input
                    type="number"
                    value={donationForm.amount}
                    onChange={(e) => setDonationForm({ ...donationForm, amount: e.target.value })}
                    className="input"
                    placeholder="Enter amount"
                    min="1"
                    step="0.01"
                    required
                  />
                </div>
                
                <div>
                  <label className="label">Message (optional)</label>
                  <textarea
                    value={donationForm.message}
                    onChange={(e) => setDonationForm({ ...donationForm, message: e.target.value })}
                    className="input min-h-[80px]"
                    placeholder="Leave a message for the creator..."
                  />
                </div>

                {donor && (
                  <div className="bg-surface-50 rounded-lg p-4">
                    <p className="text-sm text-surface-600">
                      Donating as <span className="font-medium text-surface-900">{donor.name}</span>
                    </p>
                    <p className="text-xs text-surface-500">{donor.email}</p>
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-surface-200 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowDonateModal(false)
                    setSelectedCampaign(null)
                    setDonationForm({ amount: '', message: '' })
                  }}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !donationForm.amount}
                  className="btn btn-primary"
                >
                  {submitting ? 'Processing...' : `Donate ${donationForm.amount ? formatCurrency(parseFloat(donationForm.amount)) : ''}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
