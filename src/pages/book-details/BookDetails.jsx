import { useState, useMemo } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import userReviewsData from '../../data/reviews/userReviews.json'
import APP_CONFIG from '../../config/constants'
import { generateLibraryAvailability, formatDate, calculateReadTime, generateBookDescription } from '../../utils/bookUtils'
import { useAuth } from '../../context/AuthContext'
import { useBooks } from '../../context/BooksContext'
import './BookDetails.css'

const generateTimestamp = (seed) => {
  const now = Date.now()
  const offset = (seed % 14) * 24 * 60 * 60 * 1000 // up to two weeks
  return new Date(now - offset).toISOString()
}

const toRelativeTime = (dateString) => {
  const now = Date.now()
  const past = new Date(dateString).getTime()
  const diffMinutes = Math.max(1, Math.round((now - past) / 60000))
  if (diffMinutes < 60) return `${diffMinutes}m`
  const diffHours = Math.round(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h`
  const diffDays = Math.round(diffHours / 24)
  if (diffDays < 30) return `${diffDays}d`
  const diffMonths = Math.round(diffDays / 30)
  if (diffMonths < 12) return `${diffMonths}mo`
  const diffYears = Math.round(diffMonths / 12)
  return `${diffYears}y`
}

const buildStarState = (rating) => {
  const stars = []
  for (let i = 1; i <= 5; i += 1) {
    if (rating >= i) {
      stars.push('full')
    } else if (rating >= i - 0.5) {
      stars.push('half')
    } else {
      stars.push('empty')
    }
  }
  return stars
}

export default function BookDetails() {
  const { id, isbn } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const { books } = useBooks()

  // Find the book by ID (using ISBN or index)
  const { book, bookNotFound } = useMemo(() => {
    // Check if we have ISBN in params
    const bookIdentifier = isbn || id || location.pathname.split('/').pop()
    
    if (bookIdentifier) {
      // Try to find by ISBN first (handle with or without dashes)
      const foundByIsbn = books.find(b => {
        const bookIsbn = b.isbn.replace(/-/g, '')
        const searchIsbn = bookIdentifier.replace(/-/g, '')
        return b.isbn === bookIdentifier || bookIsbn === searchIsbn
      })
      if (foundByIsbn) return { book: foundByIsbn, bookNotFound: false }
      
      // Otherwise try by index
      const index = parseInt(bookIdentifier)
      if (!isNaN(index) && index >= 0 && index < books.length) {
        return { book: books[index], bookNotFound: false }
      }
    }
    // Book not found
    return { book: null, bookNotFound: true }
  }, [id, isbn, location.pathname, books])

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

  const reviewSeedData = useMemo(() => {
    const normalizedIsbn = book.isbn.replace(/-/g, '')
    const matches = userReviewsData.filter(entry => entry.bookIsbn.replace(/-/g, '') === normalizedIsbn)
    const fallback = matches.length ? matches : userReviewsData.slice(0, 3)
    return fallback.map((review, index) => {
      const rating = parseFloat((review.rating || 4).toFixed(1))
      const timestamp = generateTimestamp(index + Math.round(rating * 10))
      return {
        ...review,
        id: `${review.bookIsbn}-${index}`,
        rating,
        createdAt: timestamp,
        relativeTime: toRelativeTime(timestamp)
      }
    })
  }, [book.isbn])

  const [userReviews, setUserReviews] = useState(reviewSeedData)
  const [reviewForm, setReviewForm] = useState({
    rating: '4.0',
    body: ''
  })

  const popularReviews = useMemo(() => {
    return [...userReviews].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 3)
  }, [userReviews])

  const recentReviews = useMemo(() => {
    return [...userReviews].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3)
  }, [userReviews])

  const handleReviewChange = (event) => {
    const { name, value } = event.target
    setReviewForm(prev => ({ ...prev, [name]: value }))
  }

  const handleReviewSubmit = (event) => {
    event.preventDefault()
    if (!isAuthenticated || !reviewForm.body.trim()) return

    const createdAt = new Date().toISOString()
    const ratingValue = parseFloat(reviewForm.rating)
    const entry = {
      id: `user-${Date.now()}`,
      reviewer: user.name,
      rating: ratingValue,
      review: reviewForm.body.trim(),
      likes: 0,
      createdAt,
      relativeTime: '1m'
    }
    setUserReviews(prev => [entry, ...prev])
    setReviewForm({ rating: '4.0', body: '' })
  }

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

        {/* Reviews Board */}
        <section className="reviews-board">
          <div className="reviews-panels">
            <div className="reviews-panel popular-panel">
              <div className="panel-header">
                <p className="panel-eyebrow">Popular user reviews</p>
                <button className="panel-link">View all</button>
              </div>
              <div className="review-list">
                {popularReviews.map((review) => (
                  <article key={review.id} className="review-entry">
                    <div className="review-badge">
                      <span className="review-rating-chip">{review.rating.toFixed(1)}/5</span>
                      <div className="review-stars" aria-label={`Rated ${review.rating} out of 5`}>
                        {buildStarState(review.rating).map((state, index) => (
                          <span key={index} className={`star ${state}`}>★</span>
                        ))}
                      </div>
                    </div>
                    <div className="review-content">
                      <div className="review-row">
                        <p className="review-author">{review.reviewer}</p>
                        <span className="review-meta">{review.relativeTime}</span>
                      </div>
                      <p className="review-body">{review.review}</p>
                      <div className="review-actions">
                        <button className="review-action">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4"/>
                          </svg>
                          {review.comments || 0}
                        </button>
                        <button className="review-action">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                          </svg>
                          {review.likes || 0}
                        </button>
                        <button className="review-action dot">•</button>
                        <span className="review-meta muted">Best Track: {book.title.split(' ')[0]}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="reviews-panel recent-panel">
              <div className="panel-header">
                <p className="panel-eyebrow">Recent user reviews</p>
                <button className="panel-link">View all</button>
              </div>

              {isAuthenticated && (
                <form id="reviewComposer" className="review-composer" onSubmit={handleReviewSubmit}>
                    <div className="composer-row">
                      <label>
                        Rating
                        <input
                          type="number"
                          name="rating"
                          min="0"
                          max="5"
                          step="0.1"
                          value={reviewForm.rating}
                          onChange={handleReviewChange}
                        />
                      </label>
                      <div className="composer-meta">0 – 5</div>
                    </div>
                  <textarea
                    name="body"
                    placeholder="Share your read. What resonated? What didn’t?"
                    rows={3}
                    value={reviewForm.body}
                    onChange={handleReviewChange}
                  />
                  <button
                    type="submit"
                    className="reviews-banner-btn primary"
                    disabled={!reviewForm.body.trim()}
                  >
                    Post review
                  </button>
                </form>
              )}

              <div className="review-list recent">
                {recentReviews.map((review) => (
                  <article key={review.id} className="review-entry compact">
                    <div className="review-badge">
                      <span className="review-rating-chip subtle">{review.rating.toFixed(1)}/5</span>
                      <div className="review-stars small" aria-label={`Rated ${review.rating} out of 5`}>
                        {buildStarState(review.rating).map((state, index) => (
                          <span key={index} className={`star ${state}`}>★</span>
                        ))}
                      </div>
                    </div>
                    <div className="review-content">
                      <div className="review-row">
                        <p className="review-author">{review.reviewer}</p>
                        <span className="review-meta">{review.relativeTime}</span>
                      </div>
                      <p className="review-body">{review.review}</p>
                      <div className="review-actions">
                        <button className="review-action">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4"/>
                          </svg>
                          {review.comments || 0}
                        </button>
                        <button className="review-action">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                          </svg>
                          {review.likes || 0}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
