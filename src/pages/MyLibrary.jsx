import React, { useState, useMemo } from 'react'
import { useLibrary } from '../LibraryContext'

export default function MyLibrary() {
  const { favorites, savedBooks, getBookId } = useLibrary()
  const [activeFilter, setActiveFilter] = useState('all')

  // Combine favorites and saved books, removing duplicates
  const allBooks = useMemo(() => {
    const bookMap = new Map()
    
    // Add saved books first
    savedBooks.forEach((book) => {
      const bookId = getBookId(book)
      bookMap.set(bookId, {
        ...book,
        saved: true,
        favorite: false,
        rated: false,
        reviewed: false,
      })
    })
    
    // Add favorites, merging with saved books if they exist
    favorites.forEach((book) => {
      const bookId = getBookId(book)
      const existing = bookMap.get(bookId)
      if (existing) {
        existing.favorite = true
      } else {
        bookMap.set(bookId, {
          ...book,
          saved: false,
          favorite: true,
          rated: false,
          reviewed: false,
        })
      }
    })
    
    return Array.from(bookMap.values())
  }, [favorites, savedBooks, getBookId])

  const filteredBooks = allBooks.filter((book) => {
    if (activeFilter === 'saved') return book.saved
    if (activeFilter === 'favorite') return book.favorite
    if (activeFilter === 'rated') return book.rated
    if (activeFilter === 'reviewed') return book.reviewed
    return true
  })

  // Calculate stats
  const stats = useMemo(() => {
    const favoriteCount = favorites.length
    const savedCount = savedBooks.length
    
    // Calculate average rating from saved books that have ratings
    const booksWithRatings = savedBooks.filter((book) => book.rating != null)
    const avgRating = booksWithRatings.length > 0
      ? (booksWithRatings.reduce((sum, book) => sum + (book.rating || 0), 0) / booksWithRatings.length).toFixed(1)
      : '0.0'
    
    // Find most common genre
    const genreCounts = {}
    savedBooks.forEach((book) => {
      if (book.genre) {
        genreCounts[book.genre] = (genreCounts[book.genre] || 0) + 1
      }
    })
    const favoriteGenre = Object.keys(genreCounts).length > 0
      ? Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0][0]
      : 'None'
    
    return {
      favorites: favoriteCount,
      saved: savedCount,
      avgRating,
      favoriteGenre,
    }
  }, [favorites, savedBooks])

  return (
    <div className="page-shell account-page">
      <section className="page-header-block">
        <h1>My Library</h1>
        <p className="page-subtitle">
          View your saved books, favorites, ratings, and reading patterns in one
          place.
        </p>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="stats-grid">
          <article className="stat-card">
            <p className="stat-label">Favorites</p>
            <p className="stat-value">{stats.favorites}</p>
          </article>
          <article className="stat-card">
            <p className="stat-label">Saved Books</p>
            <p className="stat-value">{stats.saved}</p>
          </article>
          <article className="stat-card">
            <p className="stat-label">Average Rating</p>
            <p className="stat-value">{stats.avgRating}</p>
          </article>
          <article className="stat-card">
            <p className="stat-label">Favorite Genre</p>
            <p className="stat-value">{stats.favoriteGenre}</p>
          </article>
        </div>
      </section>

      {/* Filters */}
      <section className="filters-section">
        <div className="filter-buttons">
          <button
            className={
              'chip' + (activeFilter === 'all' ? ' chip-active' : '')
            }
            onClick={() => setActiveFilter('all')}
          >
            All
          </button>
          <button
            className={
              'chip' + (activeFilter === 'saved' ? ' chip-active' : '')
            }
            onClick={() => setActiveFilter('saved')}
          >
            Saved
          </button>
          <button
            className={
              'chip' + (activeFilter === 'favorite' ? ' chip-active' : '')
            }
            onClick={() => setActiveFilter('favorite')}
          >
            Favorites
          </button>
          <button
            className={
              'chip' + (activeFilter === 'rated' ? ' chip-active' : '')
            }
            onClick={() => setActiveFilter('rated')}
          >
            Rated
          </button>
          <button
            className={
              'chip' + (activeFilter === 'reviewed' ? ' chip-active' : '')
            }
            onClick={() => setActiveFilter('reviewed')}
          >
            Reviewed
          </button>
        </div>
      </section>

      {/* Book Cards */}
      <section className="cards-section" aria-label="My saved books">
        <div className="cards-grid">
          {filteredBooks.map((book, index) => {
            const bookId = book.isbn || book.title
            // Determine tag based on book state
            let tag = 'Saved'
            if (book.favorite && book.saved) tag = 'Favorite'
            else if (book.favorite) tag = 'Favorite'
            else if (book.saved) tag = 'Saved'
            
            // Format rating
            const ratingLabel = book.rating != null 
              ? `${book.rating.toFixed(1)} / 5`
              : '—'
            
            return (
              <article
                key={bookId || index}
                className="card book-card"
                data-saved={book.saved}
                data-favorite={book.favorite}
                data-rated={book.rated}
                data-reviewed={book.reviewed}
              >
                <div className="card-tag">{tag}</div>
                <h2 className="card-title">{book.title}</h2>
                <p className="card-meta">
                  <span>{book.author}</span> •{' '}
                  <span>Rating: {ratingLabel}</span>
                </p>
                {book.description && (
                  <p className="card-body">{book.description}</p>
                )}
                {book.genre && (
                  <p className="card-body" style={{ fontStyle: 'italic', color: 'rgba(255, 255, 255, 0.7)' }}>
                    Genre: {book.genre}
                  </p>
                )}
                <div className="card-badges">
                  {book.saved && <span className="badge">Saved</span>}
                  {book.favorite && <span className="badge">Favorite</span>}
                  {book.rated && <span className="badge">Rated</span>}
                  {book.reviewed && <span className="badge">Reviewed</span>}
                </div>
              </article>
            )
          })}

          {filteredBooks.length === 0 && (
            <p className="empty-message">
              No books match this filter yet. Try switching to a different
              filter.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
