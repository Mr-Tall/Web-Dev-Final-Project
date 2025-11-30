import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import userReviewsData from '../../data/reviews/userReviews.json'
import { isbnMatches, toRelativeTime } from '../../utils/bookUtils'
import { buildStarState, getAllReviewsForBook, cleanReviewText, saveReviewToStorage, loadHeartedReviews, saveHeartedReviews, loadHeartedReplies, saveHeartedReplies } from '../../utils/reviewUtils'
import { ReviewThread, ReviewActions } from '../../components/common/ReviewThread'
import { useBooks } from '../../context/BooksContext'
import { useAuth } from '../../context/AuthContext'
import './BookDetails.css'

export default function AllReviews() {
  const { isbn } = useParams()
  const navigate = useNavigate()
  const { books, loading } = useBooks()
  const { isAuthenticated, user } = useAuth()

  // Find the book by ISBN
  const book = useMemo(() => {
    if (loading || !books || books.length === 0 || !isbn) return null
    return books.find(b => isbnMatches(b.isbn, isbn)) || null
  }, [isbn, books, loading])

  // Get all reviews for this book (using same logic as BookDetails)
  const allReviewsData = useMemo(() => {
    if (!book) return []
    return getAllReviewsForBook(book.isbn, userReviewsData)
  }, [book])

  const [allReviews, setAllReviews] = useState([])
  const [activeThread, setActiveThread] = useState(null)
  const [replyDrafts, setReplyDrafts] = useState({})
  const [replyEditDrafts, setReplyEditDrafts] = useState({})
  const [editingReplyId, setEditingReplyId] = useState(null)
  const [heartedReviews, setHeartedReviews] = useState(() => loadHeartedReviews())
  const [heartedReplies, setHeartedReplies] = useState(() => loadHeartedReplies())

  useEffect(() => {
    if (allReviewsData.length > 0) {
      setAllReviews(allReviewsData)
    }
  }, [allReviewsData])

  const handleToggleThread = (reviewId) => {
    setActiveThread(prev => (prev === reviewId ? null : reviewId))
  }

  const handleReplyDraftChange = (reviewId, text) => {
    setReplyDrafts(prev => ({ ...prev, [reviewId]: text }))
  }

  const handleReplySubmit = (event, reviewId) => {
    event.preventDefault()
    const text = replyDrafts[reviewId]?.trim()
    if (!text) return

    const userId = isAuthenticated && user ? (user.uid || user.email) : null
    const authorName = isAuthenticated ? (user?.name || user?.email?.split('@')[0] || 'You') : 'Reader'

    const reply = {
      id: `${reviewId}-reply-${Date.now()}`,
      userId: userId,
      author: authorName,
      body: text,
      timestamp: toRelativeTime(new Date().toISOString()),
      likes: 0
    }

    setAllReviews(prev => {
      const updated = prev.map(review =>
        review.id === reviewId
          ? { ...review, replies: [...(review.replies || []), reply] }
          : review
      )
      
      const reviewWithReply = updated.find(r => r.id === reviewId)
      if (reviewWithReply && book?.isbn) {
        saveReviewToStorage(reviewWithReply, book.isbn)
      }
      
      return updated
    })
    setReplyDrafts(prev => ({ ...prev, [reviewId]: '' }))
  }

  const handleEditReply = (reviewId, replyId) => {
    const review = allReviews.find(r => r.id === reviewId)
    const reply = review?.replies?.find(r => r.id === replyId)
    if (!reply) return

    setEditingReplyId(replyId)
    setReplyEditDrafts(prev => ({ ...prev, [replyId]: reply.body }))
  }

  const handleCancelEditReply = () => {
    setEditingReplyId(null)
    setReplyEditDrafts(prev => {
      const newDrafts = { ...prev }
      if (editingReplyId) {
        delete newDrafts[editingReplyId]
      }
      return newDrafts
    })
  }

  const handleUpdateReply = (reviewId, replyId) => {
    const text = replyEditDrafts[replyId]?.trim()
    if (!text) return

    setAllReviews(prev => {
      const updated = prev.map(review =>
        review.id === reviewId
          ? {
              ...review,
              replies: review.replies.map(reply =>
                reply.id === replyId
                  ? {
                      ...reply,
                      body: text,
                      timestamp: toRelativeTime(new Date().toISOString())
                    }
                  : reply
              )
            }
          : review
      )
      
      const reviewWithUpdatedReply = updated.find(r => r.id === reviewId)
      if (reviewWithUpdatedReply && book?.isbn) {
        saveReviewToStorage(reviewWithUpdatedReply, book.isbn)
      }
      
      return updated
    })
    
    setEditingReplyId(null)
    setReplyEditDrafts(prev => {
      const newDrafts = { ...prev }
      delete newDrafts[replyId]
      return newDrafts
    })
  }

  const handleDeleteReply = (reviewId, replyId) => {
    if (!window.confirm('Are you sure you want to delete this reply?')) return

    setAllReviews(prev => {
      const updated = prev.map(review =>
        review.id === reviewId
          ? {
              ...review,
              replies: review.replies.filter(reply => reply.id !== replyId)
            }
          : review
      )
      
      const reviewWithDeletedReply = updated.find(r => r.id === reviewId)
      if (reviewWithDeletedReply && book?.isbn) {
        saveReviewToStorage(reviewWithDeletedReply, book.isbn)
      }
      
      return updated
    })
  }

  const handleHeartReview = (reviewId) => {
    const alreadyHearted = heartedReviews[reviewId]
    const updatedHearted = { ...heartedReviews, [reviewId]: !alreadyHearted }
    
    setAllReviews(prev => {
      const updated = prev.map(review =>
        review.id === reviewId
          ? {
              ...review,
              likes: Math.max(0, (review.likes || 0) + (alreadyHearted ? -1 : 1))
            }
          : review
      )
      
      // Persist the updated review with new like count
      const reviewWithUpdatedLikes = updated.find(r => r.id === reviewId)
      if (reviewWithUpdatedLikes && book?.isbn) {
        saveReviewToStorage(reviewWithUpdatedLikes, book.isbn)
      }
      
      return updated
    })
    
    setHeartedReviews(updatedHearted)
    saveHeartedReviews(updatedHearted)
  }

  const handleHeartReply = (reviewId, replyId) => {
    const alreadyHearted = heartedReplies[replyId]
    const updatedHearted = { ...heartedReplies, [replyId]: !alreadyHearted }
    
    setAllReviews(prev => {
      const updated = prev.map(review =>
        review.id === reviewId
          ? {
              ...review,
              replies: review.replies.map(reply =>
                reply.id === replyId
                  ? {
                      ...reply,
                      likes: Math.max(0, (reply.likes || 0) + (alreadyHearted ? -1 : 1))
                    }
                  : reply
              )
            }
          : review
      )
      
      // Persist the updated review with reply's new like count
      const reviewWithUpdatedReply = updated.find(r => r.id === reviewId)
      if (reviewWithUpdatedReply && book?.isbn) {
        saveReviewToStorage(reviewWithUpdatedReply, book.isbn)
      }
      
      return updated
    })
    
    setHeartedReplies(updatedHearted)
    saveHeartedReplies(updatedHearted)
  }

  if (loading || !books || books.length === 0) {
    return (
      <div className="book-details-page">
        <div className="book-details-container">
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--white)' }}>
            <p>Loading reviews...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="book-details-page">
        <div className="book-details-container">
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--white)' }}>
            <p>Book not found.</p>
            <button onClick={() => navigate('/')} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
              Go Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="book-details-page">
      <div className="book-details-container">
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <button 
            onClick={() => navigate(`/book/isbn/${book.isbn}`)}
            style={{
              background: 'none',
              border: '1px solid var(--gold)',
              color: 'var(--gold)',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              marginBottom: '1rem',
              fontSize: '0.9rem'
            }}
          >
            ← Back to Book Details
          </button>
          <h1 style={{ color: 'var(--white)', fontSize: '2rem', margin: '0 0 0.5rem 0' }}>
            All Reviews for {book.title}
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}>
            by {book.author}
          </p>
        </div>

        {/* All Reviews List */}
        <section className="reviews-board">
          <div className="reviews-panels">
            <div className="reviews-panel recent-panel" style={{ width: '100%' }}>
              <div className="panel-header">
                <p className="panel-eyebrow">All user reviews ({allReviews.length})</p>
              </div>

              <div className="review-list recent">
                {allReviews.length > 0 ? (
                  allReviews.map((review) => (
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
                        <p className="review-body">{cleanReviewText(review.review)}</p>
                        <ReviewActions
                          review={review}
                          activeThread={activeThread}
                          heartedReviews={heartedReviews}
                          onToggleThread={handleToggleThread}
                          onHeartReview={handleHeartReview}
                        />
                        <ReviewThread
                          review={review}
                          activeThread={activeThread}
                          replyDrafts={replyDrafts}
                          replyEditDrafts={replyEditDrafts}
                          editingReplyId={editingReplyId}
                          heartedReplies={heartedReplies}
                          onToggleThread={handleToggleThread}
                          onReplyDraftChange={handleReplyDraftChange}
                          onReplyEditDraftChange={(replyId, text) => setReplyEditDrafts(prev => ({ ...prev, [replyId]: text }))}
                          onReplySubmit={handleReplySubmit}
                          onEditReply={handleEditReply}
                          onUpdateReply={handleUpdateReply}
                          onCancelEditReply={handleCancelEditReply}
                          onDeleteReply={handleDeleteReply}
                          onHeartReply={handleHeartReply}
                          isAuthenticated={isAuthenticated}
                          user={user}
                        />
                      </div>
                    </article>
                  ))
                ) : (
                  <p style={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center', padding: '2rem' }}>
                    No reviews yet. Be the first to review this book!
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

