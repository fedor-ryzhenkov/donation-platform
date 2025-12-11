import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import AdminDashboard from './pages/admin/AdminDashboard'
import InfluencerDashboard from './pages/influencer/InfluencerDashboard'
import DonorDashboard from './pages/donor/DonorDashboard'

function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-4">Influencer Donation Platform</h1>
        <p className="text-xl text-white/80 mb-12">Support your favorite creators and make a difference</p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/admin"
            className="px-8 py-4 bg-white text-gray-800 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg"
          >
            Admin Dashboard
          </Link>
          <Link
            to="/influencer"
            className="px-8 py-4 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition-colors backdrop-blur border border-white/30"
          >
            Influencer Portal
          </Link>
          <Link
            to="/donor"
            className="px-8 py-4 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition-colors backdrop-blur border border-white/30"
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
