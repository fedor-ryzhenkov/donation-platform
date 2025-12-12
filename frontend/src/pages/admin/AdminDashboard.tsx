import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { authApi, statsApi, donationsApi, campaignsApi, influencersApi } from '../../api/client'
import type { Stats, Donation, Campaign, Influencer } from '../../api/client'
import PasswordGate from '../../components/PasswordGate'

export default function AdminDashboard() {
  const initialUnlocked = sessionStorage.getItem('admin_unlocked') === 'true'
  const [unlocked, setUnlocked] = useState(initialUnlocked)
  const [stats, setStats] = useState<Stats | null>(null)
  const [donations, setDonations] = useState<Donation[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [influencers, setInfluencers] = useState<Influencer[]>([])
  const [loading, setLoading] = useState(initialUnlocked)
  const [activeTab, setActiveTab] = useState<'donations' | 'campaigns' | 'influencers'>('donations')
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    if (unlocked) loadData()
  }, [unlocked])

  async function loadData() {
    try {
      const [statsData, donationsData, campaignsData, influencersData] = await Promise.all([
        statsApi.get(),
        donationsApi.list(),
        campaignsApi.list(),
        influencersApi.list(),
      ])
      setStats(statsData)
      setDonations(donationsData)
      setCampaigns(campaignsData)
      setInfluencers(influencersData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteDonation(id: number) {
    if (!confirm('Are you sure you want to delete this donation?')) return
    setDeletingId(id)
    try {
      await donationsApi.delete(id)
      setDonations(donations.filter(d => d.id !== id))
      // Refresh stats
      const newStats = await statsApi.get()
      setStats(newStats)
    } catch (error) {
      console.error('Failed to delete donation:', error)
    } finally {
      setDeletingId(null)
    }
  }

  async function handleDeleteCampaign(id: number) {
    if (!confirm('Are you sure you want to delete this campaign? All associated donations will be lost.')) return
    setDeletingId(id)
    try {
      await campaignsApi.delete(id)
      setCampaigns(campaigns.filter(c => c.id !== id))
      // Refresh data
      const [newStats, newDonations] = await Promise.all([
        statsApi.get(),
        donationsApi.list(),
      ])
      setStats(newStats)
      setDonations(newDonations)
    } catch (error) {
      console.error('Failed to delete campaign:', error)
    } finally {
      setDeletingId(null)
    }
  }

  async function handleDeleteInfluencer(id: number) {
    if (!confirm('Are you sure you want to delete this influencer? All their campaigns and donations will be lost.')) return
    setDeletingId(id)
    try {
      await influencersApi.delete(id)
      setInfluencers(influencers.filter(i => i.id !== id))
      // Refresh all data
      loadData()
    } catch (error) {
      console.error('Failed to delete influencer:', error)
    } finally {
      setDeletingId(null)
    }
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (!unlocked) {
    return (
      <PasswordGate
        title="Admin Dashboard"
        subtitle="Enter the admin password to continue."
        submitLabel="Enter"
        onVerify={async (password) => {
          await authApi.verifyAdmin(password)
          sessionStorage.setItem('admin_unlocked', 'true')
          setUnlocked(true)
          setLoading(true)
        }}
      />
    )
  }

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
            <span className="badge badge-primary">Admin Dashboard</span>
          </div>
        </div>
      </nav>

      <main className="container-page py-8">
        <h1 className="text-3xl font-bold text-surface-950 mb-8 font-display">Admin Dashboard</h1>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card card-hover p-6">
            <h3 className="text-sm font-medium text-surface-500">Total Donations</h3>
            <p className="text-3xl font-bold text-surface-950 mt-2">
              {formatCurrency(stats?.overview.totalDonationAmount || 0)}
            </p>
            <div className="mt-4 text-sm text-surface-500">
              {stats?.overview.totalDonations || 0} donations
            </div>
          </div>
          <div className="card card-hover p-6">
            <h3 className="text-sm font-medium text-surface-500">Active Campaigns</h3>
            <p className="text-3xl font-bold text-surface-950 mt-2">{stats?.campaigns.active || 0}</p>
            <div className="mt-4">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${stats ? (stats.campaigns.active / (stats.overview.totalCampaigns || 1)) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
          <div className="card card-hover p-6">
            <h3 className="text-sm font-medium text-surface-500">Total Influencers</h3>
            <p className="text-3xl font-bold text-surface-950 mt-2">{stats?.overview.totalInfluencers || 0}</p>
            <div className="mt-4 text-sm text-surface-500">
              {stats?.overview.totalCampaigns || 0} campaigns
            </div>
          </div>
          <div className="card card-hover p-6">
            <h3 className="text-sm font-medium text-surface-500">Total Donors</h3>
            <p className="text-3xl font-bold text-surface-950 mt-2">{stats?.overview.totalDonors || 0}</p>
            <div className="mt-4 text-sm text-surface-500">
              Avg: {formatCurrency(stats?.overview.averageDonationAmount || 0)}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card">
          <div className="border-b border-surface-200">
            <div className="flex gap-0">
              <button
                onClick={() => setActiveTab('donations')}
                className={`px-6 py-4 font-medium text-sm transition-colors relative ${
                  activeTab === 'donations'
                    ? 'text-primary-600'
                    : 'text-surface-500 hover:text-surface-700'
                }`}
              >
                All Donations
                {activeTab === 'donations' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('campaigns')}
                className={`px-6 py-4 font-medium text-sm transition-colors relative ${
                  activeTab === 'campaigns'
                    ? 'text-primary-600'
                    : 'text-surface-500 hover:text-surface-700'
                }`}
              >
                All Campaigns
                {activeTab === 'campaigns' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('influencers')}
                className={`px-6 py-4 font-medium text-sm transition-colors relative ${
                  activeTab === 'influencers'
                    ? 'text-primary-600'
                    : 'text-surface-500 hover:text-surface-700'
                }`}
              >
                All Influencers
                {activeTab === 'influencers' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"></div>
                )}
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Donations Tab */}
            {activeTab === 'donations' && (
              donations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-surface-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-8 h-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-surface-500">No donations yet</p>
                  <p className="text-surface-400 text-sm mt-1">Donations will appear here once campaigns receive funding</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-surface-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-surface-700">Donor</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-surface-700">Campaign</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-surface-700">Amount</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-surface-700">Message</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-surface-700">Date</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-surface-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {donations.map((donation) => (
                        <tr key={donation.id} className="border-b border-surface-100 hover:bg-surface-50">
                          <td className="py-3 px-4">
                            <div className="font-medium text-surface-900">{donation.donor?.name}</div>
                            <div className="text-sm text-surface-500">{donation.donor?.email}</div>
                          </td>
                          <td className="py-3 px-4 text-surface-700">{donation.campaign?.title}</td>
                          <td className="py-3 px-4 font-semibold text-success-600">{formatCurrency(donation.amount)}</td>
                          <td className="py-3 px-4 text-surface-600 max-w-xs truncate">{donation.message || '-'}</td>
                          <td className="py-3 px-4 text-surface-500 text-sm">{formatDate(donation.createdAt)}</td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleDeleteDonation(donation.id)}
                              disabled={deletingId === donation.id}
                              className="text-error-600 hover:text-error-700 text-sm font-medium disabled:opacity-50"
                            >
                              {deletingId === donation.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {/* Campaigns Tab */}
            {activeTab === 'campaigns' && (
              campaigns.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-surface-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-8 h-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <p className="text-surface-500">No campaigns yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-surface-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-surface-700">Campaign</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-surface-700">Influencer</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-surface-700">Progress</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-surface-700">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-surface-700">Created</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-surface-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaigns.map((campaign) => (
                        <tr key={campaign.id} className="border-b border-surface-100 hover:bg-surface-50">
                          <td className="py-3 px-4">
                            <div className="font-medium text-surface-900">{campaign.title}</div>
                            <div className="text-sm text-surface-500 max-w-xs truncate">{campaign.description}</div>
                          </td>
                          <td className="py-3 px-4 text-surface-700">{campaign.influencer?.name}</td>
                          <td className="py-3 px-4">
                            <div className="text-sm font-medium text-surface-900">
                              {formatCurrency(campaign.currentAmount)} / {formatCurrency(campaign.goalAmount)}
                            </div>
                            <div className="progress-bar mt-1 w-32">
                              <div 
                                className="progress-fill" 
                                style={{ width: `${Math.min((campaign.currentAmount / campaign.goalAmount) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`badge ${
                              campaign.status === 'active' ? 'badge-success' :
                              campaign.status === 'completed' ? 'badge-primary' : 'badge-warning'
                            }`}>
                              {campaign.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-surface-500 text-sm">{formatDate(campaign.createdAt)}</td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleDeleteCampaign(campaign.id)}
                              disabled={deletingId === campaign.id}
                              className="text-error-600 hover:text-error-700 text-sm font-medium disabled:opacity-50"
                            >
                              {deletingId === campaign.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {/* Influencers Tab */}
            {activeTab === 'influencers' && (
              influencers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-surface-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-8 h-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <p className="text-surface-500">No influencers yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-surface-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-surface-700">Influencer</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-surface-700">Bio</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-surface-700">Campaigns</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-surface-700">Joined</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-surface-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {influencers.map((influencer) => (
                        <tr key={influencer.id} className="border-b border-surface-100 hover:bg-surface-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img 
                                src={influencer.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${influencer.name}`} 
                                alt={influencer.name}
                                className="w-10 h-10 rounded-full bg-surface-200"
                              />
                              <div className="font-medium text-surface-900">{influencer.name}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-surface-600 max-w-xs truncate">{influencer.bio || '-'}</td>
                          <td className="py-3 px-4 text-surface-700">{influencer.campaigns?.length || 0} campaigns</td>
                          <td className="py-3 px-4 text-surface-500 text-sm">{formatDate(influencer.createdAt)}</td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleDeleteInfluencer(influencer.id)}
                              disabled={deletingId === influencer.id}
                              className="text-error-600 hover:text-error-700 text-sm font-medium disabled:opacity-50"
                            >
                              {deletingId === influencer.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
