import React from 'react'
import { FaHeart, FaBookmark } from 'react-icons/fa'
import { useLibrary } from '../../../LibraryContext'
import styles from './BookCard.module.css'

const BookCard = ({ book, onAddToCart, variant = 'grid' }) => {
  const { toggleFavorite, toggleSaved, isFavorite, isSaved } = useLibrary()

  const handleAddToCart = (e) => {
    e.stopPropagation()
    if (onAddToCart) {
      onAddToCart(book)
    }
  }

  const handleFavorite = (e) => {
    e.stopPropagation()
    toggleFavorite(book)
  }

  const handleSaved = (e) => {
    e.stopPropagation()
    toggleSaved(book)
  }

  const favorited = isFavorite(book)
  const saved = isSaved(book)

  return (
    <article className={variant === 'grid' ? styles.bookCardGrid : styles.bookCard}>
      <div className={styles.bookCover}>
        {book.image ? (
          <img 
            src={book.image} 
            alt={`${book.title} cover`}
            className={styles.bookCoverImage}
            onError={(e) => {
              // Fallback if image fails to load
              e.target.style.display = 'none';
              e.target.parentElement.style.background = 'rgba(255, 255, 255, 0.2)';
            }}
          />
        ) : (
          <div className={styles.bookCoverPlaceholder}>
            <span>{book.title?.charAt(0) || '?'}</span>
          </div>
        )}
        <div className={styles.bookActions}>
          <button
            className={`${styles.bookActionBtn} ${styles.heartBtn} ${favorited ? styles.active : ''}`}
            onClick={handleFavorite}
            aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <FaHeart />
          </button>
          <button
            className={`${styles.bookActionBtn} ${styles.bookmarkBtn} ${saved ? styles.active : ''}`}
            onClick={handleSaved}
            aria-label={saved ? 'Remove from saved' : 'Save book'}
          >
            <FaBookmark />
          </button>
        </div>
      </div>
      <div className={styles.bookInfo}>
        <h3 className={styles.bookTitle}>{book.title || 'Book Title'}</h3>
        <p className={styles.bookAuthor}>{book.author || 'Author Name'}</p>
        <div className={styles.bookAvailabilityRow}>
          <span className={styles.bookAvailability}>Availability: {book.availability || 1}</span>
          {onAddToCart && (
            <button 
              className={styles.addToCartIcon}
              onClick={handleAddToCart}
              aria-label="Add to cart"
            >
              +
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

export default BookCard

