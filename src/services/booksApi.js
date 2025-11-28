// Books API Service - Returns books from local JSON file
import localBooks from '../data/books/books.json'

/**
 * Fetches books catalog from local JSON file
 * @returns {Promise<Array>} Array of book objects
 */
export async function fetchBooksCatalog() {
  // Simulate async loading
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // Return books with all required fields
  return localBooks.map(book => ({
    ...book,
    id: book.id || book.isbn,
    pages: book.pages || null,
    publisher: book.publisher || null,
    language: book.language || 'English',
    description: book.description || null,
    readTimeMinutes: book.pages ? Math.round(book.pages * 1.25) : null
  }))
}

export default fetchBooksCatalog

