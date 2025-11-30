import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import fetchBooksCatalog from '../services/booksApi'
import { createCacheManager } from '../utils/storageUtils'

const BooksContext = createContext(null)

const CACHE_KEY = 'bc_library_books_cache'
const CACHE_TIMESTAMP_KEY = 'bc_library_books_cache_timestamp'
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds

const cache = createCacheManager(CACHE_KEY, CACHE_TIMESTAMP_KEY, CACHE_DURATION)

export function BooksProvider({ children }) {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    
    // Try to load from cache first for instant display
    const cachedBooks = cache.get()
    if (cachedBooks && cachedBooks.length > 0) {
      setBooks(cachedBooks)
      setLoading(false)
    }
    
    async function loadBooks() {
      try {
        const fetched = await fetchBooksCatalog()
        if (active && fetched && fetched.length > 0) {
          setBooks(fetched)
          cache.set(fetched)
        }
      } catch (err) {
        if (active) {
          console.error('Failed to load books:', err)
          setError(err.message || 'Unable to load catalog')
          // If we have cached books, keep using them even if fetch fails
          if (!cachedBooks) {
            setBooks([])
          }
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    
    // Always fetch fresh data in background, but show cached immediately
    loadBooks()
    
    return () => {
      active = false
    }
  }, [])

  const value = useMemo(() => ({
    books,
    loading,
    error
  }), [books, loading, error])

  return (
    <BooksContext.Provider value={value}>
      {children}
    </BooksContext.Provider>
  )
}

export function useBooks() {
  const context = useContext(BooksContext)
  if (!context) {
    throw new Error('useBooks must be used within a BooksProvider')
  }
  return context
}

