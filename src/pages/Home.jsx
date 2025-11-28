import React, { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBooks } from '../BooksContext'
import SearchBar from '../components/SearchBar'
import AIAssistant from '../components/AIAssistant'
import BookSection from '../components/BookSection'
import './Home.css'

function Home() {
  const navigate = useNavigate()
  const { books, loading, error, searchBooks } = useBooks()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const searchTimeoutRef = useRef(null)

  // recently added books
  const newReleases = useMemo(() => {
    return [...books]
      .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate))
  }, [books])

  // trending books
  const trendingBooks = useMemo(() => {
    return [...books]
      .sort((a, b) => b.rating - a.rating)
  }, [books])

  // personal recs
  const recommendations = useMemo(() => {
    return [...books]
      .sort((a, b) => b.rating - a.rating)
  }, [books])

  // Debounced search effect
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (searchQuery.trim() === '') {
      setSearchResults([])
      setShowResults(false)
      return
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchBooks(searchQuery, 5)
        setSearchResults(results)
        setShowResults(true)
      } catch (err) {
        console.error('Search error:', err)
        setSearchResults([])
        setShowResults(false)
      }
    }, 300) // 300ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery, searchBooks])

  // handle search input change
  const handleSearch = (query) => {
    setSearchQuery(query)
  }

  if (loading) {
    return (
      <div className="home">
        <div className="home-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <p style={{ color: 'var(--white)', fontSize: '1.2rem' }}>Loading books...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="home">
        <div className="home-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ color: 'var(--gold)', fontSize: '1.2rem' }}>Error loading books</p>
          <p style={{ color: 'var(--white)', fontSize: '1rem' }}>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="home">
      <div className="home-content">
        {/* AI Floating Button */}
        <AIAssistant />

        {/* search section */}
        <section className="search-section">
          <div className="search-wrapper">
            <div className="search-bar-container">
              <SearchBar
                value={searchQuery}
                onChange={handleSearch}
                results={searchResults}
                showResults={showResults}
                onResultClick={(book) => {
                  setShowResults(false)
                  setSearchQuery('')
                }}
              />
            </div>
            <button
              className="advanced-search-btn"
              onClick={() => navigate('/advanced-search')}
            >
              Advanced Search
            </button>
          </div>
        </section>

        {/* personalized recommendations */}
        <BookSection
          title="Recommended for You"
          books={recommendations}
        />
        
        {/* uncomment to switch to slideshow */}
        {/* <section className="book-section">
          <h2 className="section-title">Recommended for You</h2>
          <BookSlideshow books={recommendations} />
        </section> */}

        {/* trending books */}
        <BookSection
          title="Trending Books"
          books={trendingBooks}
        />
        
        {/* uncomment to switch to slideshow */}
        {/* <section className="book-section">
          <h2 className="section-title">Trending Books</h2>
          <BookSlideshow books={trendingBooks} />
        </section> */}

        {/* recently added */}
        <BookSection
          title="Recently Added"
          books={newReleases}
        />
        
        {/* uncomment to switch to slideshow */}
        {/* <section className="book-section">
          <h2 className="section-title">Recently Added</h2>
          <BookSlideshow books={newReleases} />
        </section> */}
      </div>
    </div>
  )
}

export default Home

