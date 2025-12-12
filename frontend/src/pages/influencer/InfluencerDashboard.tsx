import { Link } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import { authApi, influencersApi, campaignsApi, donationsApi, setAuthToken, clearAuthToken } from '../../api/client'
import type { Influencer, Campaign, Donation, CreateCampaign, UpdateCampaign, CampaignStatus } from '../../api/client'

export default function InfluencerDashboard() {
  const [influencer, setInfluencer] = useState<Influencer | null>(null)
  const [influencerId, setInfluencerId] = useState<number | null>(() => {
    const raw = sessionStorage.getItem('influencer_id')
    const n = raw ? parseInt(raw) : NaN
    return Number.isFinite(n) ? n : null
  })
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [loginForm, setLoginForm] = useState({ name: '', password: '' })
  const [signupForm, setSignupForm] = useState({ name: '', bio: '', avatarUrl: '', password: '' })
  const [authError, setAuthError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [formData, setFormData] = useState({ title: '', description: '', goalAmount: '' })
  const [editFormData, setEditFormData] = useState({ title: '', description: '', goalAmount: '', status: 'active' as CampaignStatus })
  const [submitting, setSubmitting] = useState(false)

  const loadData = useCallback(async () => {
    try {
      if (!influencerId) {
        setInfluencer(null)
        return
      }
      const token = sessionStorage.getItem('influencer_token')
      if (!token) throw new Error('Not authenticated')
      setAuthToken(token)
      const [inf, campaignsData, donationsData] = await Promise.all([
        influencersApi.get(influencerId),
        campaignsApi.list({ influencerId }),
        donationsApi.list(),
      ])
      setInfluencer(inf)
      setCampaigns(campaignsData)
      const campaignIds = new Set(campaignsData.map(c => c.id))
      setDonations(donationsData.filter(d => campaignIds.has(d.campaignId)))
    } catch (error) {
      console.error('Failed to load influencer data:', error)
      setInfluencer(null)
    } finally {
      setLoading(false)
    }
  }, [influencerId])

  useEffect(() => {
    loadData()
  }, [loadData])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setAuthError(null)
    try {
      const { id, token } = await authApi.loginInfluencer(loginForm.name, loginForm.password)
      sessionStorage.setItem('influencer_id', String(id))
      sessionStorage.setItem('influencer_token', token)
      setAuthToken(token)
      setInfluencerId(id)
      setLoginForm({ name: '', password: '' })
    } catch (error) {
      console.error('Failed to login:', error)
      setAuthError('Invalid name or password.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setAuthError(null)
    try {
      const created = await influencersApi.create({
        name: signupForm.name,
        bio: signupForm.bio,
        avatarUrl: signupForm.avatarUrl || undefined,
        password: signupForm.password,
      })
      sessionStorage.setItem('influencer_id', String(created.id))
      sessionStorage.setItem('influencer_token', created.token)
      setAuthToken(created.token)
      setInfluencerId(created.id)
      setInfluencer(created)
      setSignupForm({ name: '', bio: '', avatarUrl: '', password: '' })
    } catch (error) {
      console.error('Failed to create influencer:', error)
      setAuthError('Failed to create account.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleCreateCampaign(e: React.FormEvent) {
    e.preventDefault()
    if (!influencer) return
    
    setSubmitting(true)
    try {
      const newCampaign: CreateCampaign = {
        influencerId: influencer.id,
        title: formData.title,
        description: formData.description,
        goalAmount: parseFloat(formData.goalAmount),
      }
      await campaignsApi.create(newCampaign)
      setShowCreateModal(false)
      setFormData({ title: '', description: '', goalAmount: '' })
      loadData()
    } catch (error) {
      console.error('Failed to create campaign:', error)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleEditCampaign(e: React.FormEvent) {
    e.preventDefault()
    if (!editingCampaign) return
    
    setSubmitting(true)
    try {
      const updateData: UpdateCampaign = {
        title: editFormData.title,
        description: editFormData.description,
        goalAmount: parseFloat(editFormData.goalAmount),
        status: editFormData.status,
      }
      await campaignsApi.update(editingCampaign.id, updateData)
      setShowEditModal(false)
      setEditingCampaign(null)
      loadData()
    } catch (error) {
      console.error('Failed to update campaign:', error)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteCampaign(id: number) {
    if (!confirm('Are you sure you want to delete this campaign?')) return
    
    try {
      await campaignsApi.delete(id)
      loadData()
    } catch (error) {
      console.error('Failed to delete campaign:', error)
    }
  }

  function openEditModal(campaign: Campaign) {
    setEditingCampaign(campaign)
    setEditFormData({
      title: campaign.title,
      description: campaign.description,
      goalAmount: campaign.goalAmount.toString(),
      status: campaign.status,
    })
    setShowEditModal(true)
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const totalRaised = campaigns.reduce((sum, c) => sum + c.currentAmount, 0)
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-surface-600">Loading dashboard...</p>
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
              {influencer ? (
                <>
                  <span className="text-sm text-surface-600">Signed in as <span className="font-medium text-surface-900">{influencer.name}</span></span>
                  <button
                    onClick={() => {
                      sessionStorage.removeItem('influencer_id')
                      sessionStorage.removeItem('influencer_token')
                      clearAuthToken()
                      setInfluencerId(null)
                      setInfluencer(null)
                      setCampaigns([])
                      setDonations([])
                    }}
                    className="btn btn-ghost text-sm"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <span className="text-sm text-surface-500">Not signed in</span>
              )}
              <span className="badge badge-secondary">Influencer Portal</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="container-page py-8">
        {!influencer && (
          <div className="card p-6 mb-8">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-semibold text-surface-950 font-display">
                  {authMode === 'login' ? 'Log in' : 'Sign up'}
                </h2>
                <p className="text-sm text-surface-500 mt-1">
                  {authMode === 'login'
                    ? 'Use your influencer name as username.'
                    : 'Create an influencer account to manage campaigns.'}
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
                  <label className="label">Name (username)</label>
                  <input
                    type="text"
                    value={loginForm.name}
                    onChange={(e) => setLoginForm({ ...loginForm, name: e.target.value })}
                    className="input"
                    placeholder="Alex Gaming"
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
                  <label className="label">Name (username)</label>
                  <input
                    type="text"
                    value={signupForm.name}
                    onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                    className="input"
                    placeholder="Alex Gaming"
                    required
                  />
                </div>
                <div>
                  <label className="label">Bio</label>
                  <textarea
                    value={signupForm.bio}
                    onChange={(e) => setSignupForm({ ...signupForm, bio: e.target.value })}
                    className="input min-h-[100px]"
                    placeholder="Tell supporters about you..."
                    required
                  />
                </div>
                <div>
                  <label className="label">Avatar URL (optional)</label>
                  <input
                    type="url"
                    value={signupForm.avatarUrl}
                    onChange={(e) => setSignupForm({ ...signupForm, avatarUrl: e.target.value })}
                    className="input"
                    placeholder="https://..."
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

        {!influencer ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-surface-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <p className="text-surface-500">Sign in to manage your campaigns</p>
          </div>
        ) : (
          <>
            {/* Profile Header */}
            <div className="card p-6 mb-8">
              <div className="flex items-center gap-4">
                <img
                  src={influencer.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${influencer.name}`}
                  alt={influencer.name}
                  className="w-16 h-16 rounded-full bg-surface-200"
                />
                <div>
                  <h1 className="text-2xl font-bold text-surface-950 font-display">{influencer.name}</h1>
                  <p className="text-surface-600">{influencer.bio}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <h2 className="text-xl font-bold text-surface-950 font-display">My Campaigns</h2>
              <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Campaign
              </button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="card card-hover p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-surface-500">Total Raised</h3>
                    <p className="text-3xl font-bold text-surface-950 mt-2">{formatCurrency(totalRaised)}</p>
                  </div>
                  <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="card card-hover p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-surface-500">Active Campaigns</h3>
                    <p className="text-3xl font-bold text-surface-950 mt-2">{activeCampaigns}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="card card-hover p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-surface-500">Total Donations</h3>
                    <p className="text-3xl font-bold text-surface-950 mt-2">{donations.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Campaigns List */}
            {campaigns.length === 0 ? (
              <div className="card">
                <div className="p-6">
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-primary-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <svg className="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <p className="text-surface-600 font-medium">No campaigns yet</p>
                    <p className="text-surface-400 text-sm mt-1 mb-6">Create your first campaign to start receiving donations</p>
                    <button onClick={() => setShowCreateModal(true)} className="btn btn-outline">
                      Get Started
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="card card-hover overflow-hidden">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-surface-900">{campaign.title}</h3>
                          <span className={`badge mt-2 ${
                            campaign.status === 'active' ? 'badge-success' :
                            campaign.status === 'completed' ? 'badge-primary' : 'badge-warning'
                          }`}>
                            {campaign.status}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(campaign)}
                            className="p-2 text-surface-500 hover:text-surface-700 hover:bg-surface-100 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteCampaign(campaign.id)}
                            className="p-2 text-error-500 hover:text-error-700 hover:bg-error-50 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <p className="text-surface-600 text-sm mb-4 line-clamp-2">{campaign.description}</p>
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
                        <div className="text-xs text-surface-500 mt-1">
                          {Math.round((campaign.currentAmount / campaign.goalAmount) * 100)}% funded
                        </div>
                      </div>
                      <div className="text-sm text-surface-500">
                        Created {formatDate(campaign.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Recent Donations */}
            {donations.length > 0 && (
              <div className="card">
                <div className="p-6 border-b border-surface-200">
                  <h2 className="text-lg font-semibold text-surface-950 font-display">Recent Donations</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {donations.slice(0, 10).map((donation) => (
                      <div key={donation.id} className="flex items-center justify-between py-3 border-b border-surface-100 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-linear-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-primary-700">
                              {donation.donor?.name?.charAt(0) || '?'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-surface-900">{donation.donor?.name}</p>
                            <p className="text-sm text-surface-500">
                              {donation.campaign?.title} • {formatDate(donation.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-success-600">{formatCurrency(donation.amount)}</p>
                          {donation.message && (
                            <p className="text-sm text-surface-500 max-w-xs truncate">{donation.message}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md">
            <div className="p-6 border-b border-surface-200">
              <h2 className="text-xl font-semibold text-surface-950 font-display">Create Campaign</h2>
            </div>
            <form onSubmit={handleCreateCampaign}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="label">Campaign Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input"
                    placeholder="e.g., New Streaming Setup"
                    required
                  />
                </div>
                <div>
                  <label className="label">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input min-h-[100px]"
                    placeholder="Describe what this campaign is for..."
                    required
                  />
                </div>
                <div>
                  <label className="label">Goal Amount ($)</label>
                  <input
                    type="number"
                    value={formData.goalAmount}
                    onChange={(e) => setFormData({ ...formData, goalAmount: e.target.value })}
                    className="input"
                    placeholder="5000"
                    min="1"
                    step="0.01"
                    required
                  />
                </div>
              </div>
              <div className="p-6 border-t border-surface-200 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                >
                  {submitting ? 'Creating...' : 'Create Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Campaign Modal */}
      {showEditModal && editingCampaign && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md">
            <div className="p-6 border-b border-surface-200">
              <h2 className="text-xl font-semibold text-surface-950 font-display">Edit Campaign</h2>
            </div>
            <form onSubmit={handleEditCampaign}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="label">Campaign Title</label>
                  <input
                    type="text"
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Description</label>
                  <textarea
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    className="input min-h-[100px]"
                    required
                  />
                </div>
                <div>
                  <label className="label">Goal Amount ($)</label>
                  <input
                    type="number"
                    value={editFormData.goalAmount}
                    onChange={(e) => setEditFormData({ ...editFormData, goalAmount: e.target.value })}
                    className="input"
                    min="1"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="label">Status</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as CampaignStatus })}
                    className="input"
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="p-6 border-t border-surface-200 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingCampaign(null)
                  }}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
