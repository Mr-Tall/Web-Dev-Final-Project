import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import fetchBooksCatalog from '../services/booksApi'
import { createCacheManager } from '../utils/storageUtils'

const RecommendationBooksContext = createContext(null)

const CACHE_KEY = 'bc_recommendation_books_cache'
const CACHE_TIMESTAMP_KEY = 'bc_recommendation_books_cache_timestamp'
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds

const cache = createCacheManager(CACHE_KEY, CACHE_TIMESTAMP_KEY, CACHE_DURATION)

export function RecommendationBooksProvider({ children }) {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    
    const cachedBooks = cache.get()
    if (cachedBooks && cachedBooks.length > 0) {
      setBooks(cachedBooks)
      setLoading(false)
    }
    
    async function loadBooks() {
      try {
        // Fetch 100 books for recommendations (sufficient for good recommendations)
        // Skip description enhancement to speed up loading
        const fetched = await fetchBooksCatalog(100, { skipDescriptionEnhancement: true })
        if (active && fetched && fetched.length > 0) {
          console.log('Number of recommendation books fetched:', fetched.length)
          setBooks(fetched)
          cache.set(fetched)
        }
      } catch (err) {
        if (active) {
          console.error('Failed to load recommendation books:', err)
          setError(err.message || 'Unable to load recommendation catalog')
          if (!cachedBooks) {
            setBooks([])
          }
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    
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
    <RecommendationBooksContext.Provider value={value}>
      {children}
    </RecommendationBooksContext.Provider>
  )
}

export function useRecommendationBooks() {
  const context = useContext(RecommendationBooksContext)
  if (!context) {
    throw new Error('useRecommendationBooks must be used within a RecommendationBooksProvider')
  }
  return context
}