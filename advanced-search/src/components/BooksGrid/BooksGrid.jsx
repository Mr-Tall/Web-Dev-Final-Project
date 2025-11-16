import React from 'react'
import BookCard from '../BookCard/BookCard'
import styles from './BooksGrid.module.css'

const BooksGrid = ({ books = [], onAddToCart }) => {
  return (
    <div className={styles.booksGrid}>
      {books.length > 0 ? (
        books.map((book, index) => (
          <BookCard 
            key={book.id || index} 
            book={book} 
            onAddToCart={onAddToCart}
            variant="grid"
          />
        ))
      ) : (
        <BookCard 
          book={{ title: 'Book Title', author: 'Author Name', availability: 1 }} 
          onAddToCart={onAddToCart}
          variant="grid"
        />
      )}
    </div>
  )
}

export default BooksGrid

