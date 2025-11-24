import React, { useState, useMemo } from 'react'
import myLibraryData from '../../data/books/myLibrary.json'
import libraryStatsData from '../../data/config/libraryStats.json'

export default function MyLibrary() {
  const [activeFilter, setActiveFilter] = useState('all')

  const filteredBooks = myLibraryData.filter((book) => {
    if (activeFilter === 'saved') return book.saved
    if (activeFilter === 'favorite') return book.favorite
    if (activeFilter === 'rated') return book.rated
    if (activeFilter === 'reviewed') return book.reviewed
    return true
  })

  // Calculate stats from data (can be replaced with API call)
  // TODO: Replace with API call to get real user stats
  const stats = useMemo(() => {
    const favorites = myLibraryData.filter(b => b.favorite).length
    const saved = myLibraryData.filter(b => b.saved).length
    const rated = myLibraryData.filter(b => b.rated)
    const avgRating = rated.length > 0 
      ? (rated.reduce((sum, b) => {
          const rating = parseFloat(b.ratingLabel.replace(/[^0-9.]/g, '')) || 0
          return sum + rating
        }, 0) / rated.length).toFixed(1)
      : libraryStatsData.averageRating
    
    return {
      favorites: favorites || libraryStatsData.favorites,
      savedBooks: saved || libraryStatsData.savedBooks,
      averageRating: avgRating,
      favoriteGenre: libraryStatsData.favoriteGenre
    }
  }, [])

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
            <p className="stat-value">{stats.savedBooks}</p>
          </article>
          <article className="stat-card">
            <p className="stat-label">Average Rating</p>
            <p className="stat-value">{stats.averageRating}</p>
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
          {filteredBooks.map((book) => (
            <article
              key={book.id}
              className="card book-card"
              data-saved={book.saved}
              data-favorite={book.favorite}
              data-rated={book.rated}
              data-reviewed={book.reviewed}
            >
              <div className="card-tag">{book.tag}</div>
              <h2 className="card-title">{book.title}</h2>
              <p className="card-meta">
                <span>{book.author}</span> •{' '}
                <span>Rating: {book.ratingLabel}</span>
              </p>
              <p className="card-body">{book.description}</p>
              <div className="card-badges">
                {book.saved && <span className="badge">Saved</span>}
                {book.favorite && <span className="badge">Favorite</span>}
                {book.rated && <span className="badge">Rated</span>}
                {book.reviewed && <span className="badge">Reviewed</span>}
              </div>
            </article>
          ))}

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
