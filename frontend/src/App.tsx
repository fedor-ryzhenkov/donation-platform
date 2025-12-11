import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import AdminDashboard from './pages/admin/AdminDashboard'
import InfluencerDashboard from './pages/influencer/InfluencerDashboard'
import DonorDashboard from './pages/donor/DonorDashboard'
import Login from './pages/Login'
import Signup from './pages/Signup'

import './styles/LandingPage.css';

function LandingPage() {
  return (
    <div className="landing-page">
      <nav className="navbar">
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/influencer" className="nav-link">Explore Campaigns</Link>
          <Link to="/admin" className="nav-link">Admin Dashboard</Link>
        </div>

        <div className="auth-buttons">
          <Link to="/login">
            <button className="btn-signin">Log in</button>
          </Link>
          <Link to="/signup">
            <button className="btn-signup">Sign up</button>
          </Link>
        </div>
      </nav>

      <div className="hero-section">
        <div className="decorative-dot dot-yellow" style={{top: '2.5rem', left: '2.5rem'}}></div>
        <div className="decorative-dot dot-yellow" style={{top: '5rem', right: '50%'}}></div>
        <div className="decorative-dot dot-yellow" style={{bottom: '10rem', left: '1.25rem'}}></div>
        <div className="decorative-dot dot-purple" style={{bottom: '5rem', right: '33.33%'}}></div>
        <div className="decorative-dot dot-yellow" style={{top: '33.33%', right: '2.5rem'}}></div>
        <div className="decorative-dot dot-yellow" style={{bottom: '2.5rem', right: '5rem'}}></div>
        
        <img src="/src/images/Vector.svg" alt="" className="star-decoration" style={{bottom: '12%', right: '15%', width: '24px'}} />
        <img src="/src/images/Vector.svg" alt="" className="star-decoration" style={{top: '60%', left: '8%', width: '20px'}} />
        <img src="/src/images/Vector.svg" alt="" className="star-decoration" style={{bottom: '10%', right: '30%', width: '28px'}} />
        
        <div className="hero-content">
          <h2 className="hero-title">
            <span className="highlight">Support </span> Your Favourite Creators Effortlessly
          </h2>

          <p className="hero-description">
            Track campaigns, donate securely, and support influencers directly — all in one place.
          </p>

          <div className="cta-buttons">
            <Link to="/influencer">
              <button className="btn-influencer">Influencer Portal</button>
            </Link>
            <Link to="/donor">
              <button className="btn-donate">Donate Now</button>
            </Link>
          </div>
        </div>

        <div className="hero-image-container">
          <img
            src="/src/images/influencer.png"
            alt="Creator"
            className="hero-image"
          />
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/influencer" element={<InfluencerDashboard />} />
        <Route path="/donor" element={<DonorDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App