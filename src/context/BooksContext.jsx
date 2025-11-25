import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import fetchBooksCatalog from '../services/booksApi'
import localBooks from '../data/books/books.json'

const BooksContext = createContext(null)

export function BooksProvider({ children }) {
  const [books, setBooks] = useState(localBooks)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    async function loadBooks() {
      try {
        const fetched = await fetchBooksCatalog()
        if (active && fetched.length) {
          setBooks(fetched)
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Unable to load catalog')
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

