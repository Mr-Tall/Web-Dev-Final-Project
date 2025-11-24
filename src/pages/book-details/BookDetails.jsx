import { useState } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { useMemo } from 'react'
import booksData from '../../data/books/books.json'
import commentsData from '../../data/books/comments.json'
import APP_CONFIG from '../../config/constants'
import { generateLibraryAvailability, formatDate, calculateReadTime, generateBookDescription } from '../../utils/bookUtils'
import './BookDetails.css'

export default function BookDetails() {
  const { id, isbn } = useParams()
  const location = useLocation()

  // Find the book by ID (using ISBN or index)
  const { book, bookNotFound } = useMemo(() => {
    // Check if we have ISBN in params
    const bookIdentifier = isbn || id || location.pathname.split('/').pop()
    
    if (bookIdentifier) {
      // Try to find by ISBN first (handle with or without dashes)
      const foundByIsbn = booksData.find(b => {
        const bookIsbn = b.isbn.replace(/-/g, '')
        const searchIsbn = bookIdentifier.replace(/-/g, '')
        return b.isbn === bookIdentifier || bookIsbn === searchIsbn
      })
      if (foundByIsbn) return { book: foundByIsbn, bookNotFound: false }
      
      // Otherwise try by index
      const index = parseInt(bookIdentifier)
      if (!isNaN(index) && index >= 0 && index < booksData.length) {
        return { book: booksData[index], bookNotFound: false }
      }
    }
    // Book not found
    return { book: null, bookNotFound: true }
  }, [id, isbn, location.pathname])

  // If book not found, this shouldn't happen as App.jsx handles routing
  // But just in case, return null
  if (bookNotFound || !book) {
    return null
  }

  // Calculate read time and format date
  const readTimeMinutes = calculateReadTime()
  const formattedDate = formatDate(book.releaseDate)
  const description = generateBookDescription(book)

  // Generate library availability (mock data based on book)
  // TODO: Replace with API call to get real availability
  const libraryAvailability = useMemo(() => {
    return generateLibraryAvailability(book.isbn)
  }, [book.isbn])

  // Get comments for this book from JSON (fallback to default if not found)
  // TODO: Replace with API call to get real comments
  const [comments] = useState(() => {
    const normalizedIsbn = book.isbn.replace(/-/g, '')
    const bookComments = Object.keys(commentsData).find(key => 
      key.replace(/-/g, '') === normalizedIsbn || key === 'default'
    )
    return commentsData[bookComments] || commentsData.default || []
  })

  return (
    <div className="book-details-page">
      <div className="book-details-container">
        {/* Main Content Grid */}
        <div className="book-details-grid">
          {/* Left: Book Cover */}
          <div className="book-cover-section">
            <div className="book-cover-wrapper">
              {book.image ? (
                <img src={book.image} alt={book.title} className="book-cover-image" />
              ) : (
                <div className="book-cover-placeholder">
                  <span>{book.title.charAt(0)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Middle: Book Information */}
          <div className="book-info-section">
            <div className="book-title-row">
              <h1 className="book-title">{book.title}</h1>
              <button className="bookmark-btn" aria-label="Bookmark">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
              </button>
            </div>
            <p className="book-author">by {book.author}</p>
            
            <div className="book-description">
              <p>{description}</p>
            </div>

            <div className="book-specifications">
              <h3 className="specs-title">Specifications</h3>
              <div className="specs-list">
                <div className="spec-item">
                  <span className="spec-label">Released On:</span>
                  <span className="spec-value">{formattedDate}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Language:</span>
                  <span className="spec-value">{APP_CONFIG.DEFAULT_LANGUAGE}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Pages:</span>
                  <span className="spec-value">{APP_CONFIG.DEFAULT_ESTIMATED_PAGES}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Read Time*:</span>
                  <span className="spec-value">{readTimeMinutes} minutes</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">ISBN:</span>
                  <span className="spec-value">{book.isbn}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Category:</span>
                  <span className="spec-value">{book.genre}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Publisher:</span>
                  <span className="spec-value">{APP_CONFIG.DEFAULT_PUBLISHER}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Availability Options */}
          <div className="purchase-section">
            <div className="purchase-box">
              <div className="availability-header">
                <h3 className="availability-title">Availability</h3>
                <div className={`availability-badge ${libraryAvailability.some(lib => lib.available) ? 'in-stock' : 'out-of-stock'}`}>
                  {libraryAvailability.some(lib => lib.available) ? 'Available' : 'Not Available'}
                </div>
              </div>

              <div className="library-list">
                {libraryAvailability.map((lib) => (
                  <div key={lib.library} className="library-item">
                    <div className="library-name-row">
                      <span className="library-name">{lib.library}</span>
                      <span className={`library-status ${lib.available ? 'available' : 'unavailable'}`}>
                        {lib.available ? `${lib.quantity} available` : 'Not available'}
                      </span>
                    </div>
                    {lib.available && (
                      <button className="btn-checkout">Checkout</button>
                    )}
                    {!lib.available && (
                      <button className="btn-request">Request</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="comments-section">
          <div className="comments-header">
            <h2 className="comments-title">COMMENTS ({comments.length})</h2>
            <button className="sign-in-comment-btn">SIGN IN TO COMMENT</button>
          </div>

          <div className="comments-list">
            {comments.map(comment => (
              <div key={comment.id} className="comment-item">
                <div className="comment-user-info">
                  <div className="comment-avatar">{comment.avatar}</div>
                  <div className="comment-user-details">
                    <div className="comment-username">{comment.username}</div>
                    <div className="comment-date">{comment.date}</div>
                  </div>
                </div>
                <div className="comment-text">{comment.text}</div>
                <div className="comment-actions">
                  <button className="comment-like-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    {comment.likes}
                  </button>
                  <button className="comment-reply-btn">Reply</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
