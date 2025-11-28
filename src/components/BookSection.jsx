import React from 'react'
import { FaHeart, FaBookmark } from 'react-icons/fa'
import { useLibrary } from '../LibraryContext'
import './BookSection.css'

function BookSection({ title, books }) {
  const { toggleFavorite, toggleSaved, isFavorite, isSaved } = useLibrary()

  if (books.length === 0) return null

  return (
    <section className="book-section">
      <h2 className="section-title">{title}</h2>
      <div className="books-grid">
        {books.slice(0, 8).map((book, index) => {
          const favorited = isFavorite(book)
          const saved = isSaved(book)

          return (
            <div key={index} className="book-card-large">
              {book.image && (
                <div className="book-card-cover">
                  <img 
                    src={book.image} 
                    alt={`${book.title} cover`}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div className="book-card-header">
                <h3 className="book-card-title">{book.title}</h3>
                <div className="book-rating">
                  <span className="rating-number">{book.rating.toFixed(1)} / 5</span>
                </div>
              </div>
              <div className="book-card-body">
                <p className="book-card-author">by {book.author}</p>
                <p className="book-card-date">
                  Released: {new Date(book.releaseDate).toLocaleDateString()}
                </p>
                <p className="book-card-isbn">ISBN: {book.isbn}</p>
                <span className="book-card-genre">{book.genre}</span>
              </div>
              <div className="book-card-actions">
                <button
                  className={`book-action-btn heart-btn ${favorited ? 'active' : ''}`}
                  onClick={() => toggleFavorite(book)}
                  aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <FaHeart />
                </button>
                <button
                  className={`book-action-btn bookmark-btn ${saved ? 'active' : ''}`}
                  onClick={() => toggleSaved(book)}
                  aria-label={saved ? 'Remove from saved' : 'Save book'}
                >
                  <FaBookmark />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default BookSection

