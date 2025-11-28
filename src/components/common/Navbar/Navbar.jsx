import { useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleNavClick = useCallback((path) => {
    navigate(path)
  }, [navigate])

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => navigate('/')}>
        <h1 className="navbar-logo">Library Catalog AI</h1>
      </div>
      <div className="navbar-links">
        <button
          className={`nav-link icon-link ${
            location.pathname === '/advanced-search' ? 'active' : ''
          }`}
          onClick={() => handleNavClick('/advanced-search')}
          aria-label="Advanced Search"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
        </button>
        <button
          className={`nav-link icon-link ${
            location.pathname === '/book-reviews' ? 'active' : ''
          }`}
          onClick={() => handleNavClick('/book-reviews')}
          aria-label="Book Reviews"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </button>
        <button
          className={`nav-link icon-link ${
            location.pathname === '/resources' ? 'active' : ''
          }`}
          onClick={() => handleNavClick('/resources')}
          aria-label="Resources"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
        </button>
      </div>
    </nav>
  )
}

export default Navbar

