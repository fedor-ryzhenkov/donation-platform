import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import AdminDashboard from './pages/admin/AdminDashboard'
import InfluencerDashboard from './pages/influencer/InfluencerDashboard'
import DonorDashboard from './pages/donor/DonorDashboard'

function LandingPage() {
  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 font-display">
          Influencer Donation Platform
        </h1>
        <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
          Support your favorite creators and make a difference
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/admin"
            className="px-8 py-4 bg-white text-surface-800 rounded-xl font-semibold hover:bg-surface-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Admin Dashboard
          </Link>
          <Link
            to="/influencer"
            className="px-8 py-4 glass text-surface-800 rounded-xl font-semibold hover:bg-white/90 transition-all border border-white/50"
          >
            Influencer Portal
          </Link>
          <Link
            to="/donor"
            className="px-8 py-4 glass text-surface-800 rounded-xl font-semibold hover:bg-white/90 transition-all border border-white/50"
          >
            Donate Now
          </Link>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/influencer" element={<InfluencerDashboard />} />
        <Route path="/donor" element={<DonorDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
