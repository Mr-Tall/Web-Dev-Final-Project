import { useNavigate } from 'react-router-dom'
import styles from './BookCard.module.css'

const BookCard = ({ book, onAddToCart, variant = 'grid' }) => {
  const navigate = useNavigate()

  const handleAddToCart = (e) => {
    e.stopPropagation()
    if (onAddToCart) {
      onAddToCart(book)
    }
  }

  const handleCardClick = () => {
    // Navigate to book details using ISBN
    navigate(`/book/isbn/${book.isbn}`)
  }

  return (
    <article 
      className={variant === 'grid' ? styles.bookCardGrid : styles.bookCard}
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
    >
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

