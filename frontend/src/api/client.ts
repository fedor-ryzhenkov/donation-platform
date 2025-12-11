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

  return response.json()
}

// Influencers
export const influencersApi = {
  list: () => request<Influencer[]>('/influencers'),
  get: (id: number) => request<Influencer>(`/influencers/${id}`),
  create: (data: CreateInfluencer) =>
    request<Influencer>('/influencers', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<CreateInfluencer>) =>
    request<Influencer>(`/influencers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request<void>(`/influencers/${id}`, { method: 'DELETE' }),
}

// Campaigns
export const campaignsApi = {
  list: () => request<Campaign[]>('/campaigns'),
  get: (id: number) => request<Campaign>(`/campaigns/${id}`),
  create: (data: CreateCampaign) =>
    request<Campaign>('/campaigns', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<CreateCampaign>) =>
    request<Campaign>(`/campaigns/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request<void>(`/campaigns/${id}`, { method: 'DELETE' }),
}

// Donors
export const donorsApi = {
  list: () => request<Donor[]>('/donors'),
  get: (id: number) => request<Donor>(`/donors/${id}`),
  create: (data: CreateDonor) =>
    request<Donor>('/donors', { method: 'POST', body: JSON.stringify(data) }),
}

// Donations
export const donationsApi = {
  list: () => request<Donation[]>('/donations'),
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
}

export interface CreateInfluencer {
  name: string
  bio: string
  avatarUrl?: string
}

export interface Campaign {
  id: number
  influencerId: number
  title: string
  description: string
  goalAmount: number
  currentAmount: number
  status: 'active' | 'completed' | 'cancelled'
  createdAt: string
  influencer?: Influencer
}

export interface CreateCampaign {
  influencerId: number
  title: string
  description: string
  goalAmount: number
}

export interface Donor {
  id: number
  name: string
  email: string
  createdAt: string
}

export interface CreateDonor {
  name: string
  email: string
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

export interface CreateDonation {
  donorId: number
  campaignId: number
  amount: number
  message?: string
}

export interface Stats {
  totalDonations: number
  totalAmount: number
  activeCampaigns: number
  totalInfluencers: number
  totalDonors: number
}
