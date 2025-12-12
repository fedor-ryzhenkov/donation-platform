const API_BASE = '/api'

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`)
  }

  // Handle 204 No Content responses
  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}

// Auth
export const authApi = {
  verifyAdmin: (password: string) =>
    request<void>('/auth/admin', { method: 'POST', body: JSON.stringify({ password }) }),
  verifyInfluencer: (id: number, password: string) =>
    request<void>(`/auth/influencers/${id}`, { method: 'POST', body: JSON.stringify({ password }) }),
  verifyDonor: (id: number, password: string) =>
    request<void>(`/auth/donors/${id}`, { method: 'POST', body: JSON.stringify({ password }) }),
}

// Influencers
export const influencersApi = {
  list: () => request<Influencer[]>('/influencers'),
  get: (id: number) => request<Influencer>(`/influencers/${id}`),
  create: (data: CreateInfluencer) =>
    request<Influencer>('/influencers', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: UpdateInfluencer) =>
    request<Influencer>(`/influencers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request<void>(`/influencers/${id}`, { method: 'DELETE' }),
}

// Campaigns
export const campaignsApi = {
  list: (params?: CampaignListParams) => {
    const searchParams = new URLSearchParams()
    if (params?.influencerId) searchParams.set('influencerId', String(params.influencerId))
    if (params?.status) searchParams.set('status', params.status)
    const query = searchParams.toString()
    return request<Campaign[]>(`/campaigns${query ? `?${query}` : ''}`)
  },
  get: (id: number) => request<Campaign>(`/campaigns/${id}`),
  create: (data: CreateCampaign) =>
    request<Campaign>('/campaigns', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: UpdateCampaign) =>
    request<Campaign>(`/campaigns/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request<void>(`/campaigns/${id}`, { method: 'DELETE' }),
}

// Donors
export const donorsApi = {
  list: () => request<Donor[]>('/donors'),
  get: (id: number) => request<Donor>(`/donors/${id}`),
  create: (data: CreateDonor) =>
    request<Donor>('/donors', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: UpdateDonor) =>
    request<Donor>(`/donors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request<void>(`/donors/${id}`, { method: 'DELETE' }),
}

// Donations
export const donationsApi = {
  list: (params?: DonationListParams) => {
    const searchParams = new URLSearchParams()
    if (params?.campaignId) searchParams.set('campaignId', String(params.campaignId))
    if (params?.donorId) searchParams.set('donorId', String(params.donorId))
    const query = searchParams.toString()
    return request<Donation[]>(`/donations${query ? `?${query}` : ''}`)
  },
  get: (id: number) => request<Donation>(`/donations/${id}`),
  create: (data: CreateDonation) =>
    request<Donation>('/donations', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: number) => request<void>(`/donations/${id}`, { method: 'DELETE' }),
}

// Stats
export const statsApi = {
  get: () => request<Stats>('/stats'),
}

// Types

export interface Influencer {
  id: number
  name: string
  bio: string
  avatarUrl: string
  createdAt: string
  campaigns?: Campaign[]
}

export interface CreateInfluencer {
  name: string
  bio: string
  avatarUrl?: string
  password: string
}

export interface UpdateInfluencer {
  name?: string
  bio?: string
  avatarUrl?: string
  password?: string
}

export type CampaignStatus = 'active' | 'completed' | 'cancelled'

export interface Campaign {
  id: number
  influencerId: number
  title: string
  description: string
  goalAmount: number
  currentAmount: number
  status: CampaignStatus
  createdAt: string
  influencer?: Influencer
  donations?: Donation[]
}

export interface CampaignListParams {
  influencerId?: number
  status?: CampaignStatus
}

export interface CreateCampaign {
  influencerId: number
  title: string
  description: string
  goalAmount: number
}

export interface UpdateCampaign {
  title?: string
  description?: string
  goalAmount?: number
  status?: CampaignStatus
}

export interface Donor {
  id: number
  name: string
  email: string
  createdAt: string
  donations?: Donation[]
}

export interface CreateDonor {
  name: string
  email: string
  password: string
}

export interface UpdateDonor {
  name?: string
  email?: string
  password?: string
}

export interface Donation {
  id: number
  donorId: number
  campaignId: number
  amount: number
  message: string
  createdAt: string
  donor?: Donor
  campaign?: Campaign
}

export interface DonationListParams {
  campaignId?: number
  donorId?: number
}

export interface CreateDonation {
  donorId: number
  campaignId: number
  amount: number
  message?: string
}

export interface StatsOverview {
  totalInfluencers: number
  totalCampaigns: number
  totalDonors: number
  totalDonations: number
  totalDonationAmount: number
  averageDonationAmount: number
}

export interface CampaignStats {
  active: number
  completed: number
  cancelled: number
}

export interface Stats {
  overview: StatsOverview
  campaigns: CampaignStats
  recentDonations: Donation[]
  topCampaigns: Campaign[]
}
