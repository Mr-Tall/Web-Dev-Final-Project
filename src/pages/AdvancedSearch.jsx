import React, { useState, useCallback, useMemo } from 'react'
import { useBooks } from '../BooksContext'
import TrendingSection from '../components/advanced-search/TrendingSection/TrendingSection'
import LibrarySection from '../components/advanced-search/LibrarySection/LibrarySection'
import SearchForm from '../components/advanced-search/SearchForm/SearchForm'
import styles from './AdvancedSearch.module.css'

function AdvancedSearch() {
  const { books, loading, error } = useBooks()
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    category: [],
    languages: [],
    age: [],
    availability: []
  })

  // Map books data to include availability and normalize genre
  const allBooks = useMemo(() => {
    return books.map((book, index) => ({
      id: index + 1,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      genre: book.genre?.toLowerCase() || 'fiction',
      availability: Math.floor(Math.random() * 5) + 1, // Mock availability
      rating: book.rating,
      releaseDate: book.releaseDate,
      image: book.image
    }))
  }, [books])

  const handleSearch = useCallback((term) => {
    setSearchTerm(term)
    // Reset filters when search is cleared
    if (!term || term.trim() === '') {
      setFilters({
        category: [],
        languages: [],
        age: [],
        availability: []
      })
    }
  }, [])

  const handleAddToCart = useCallback((book) => {
    // Add to cart functionality - placeholder for future implementation
  }, [])

  const handleFilterChange = useCallback((filterGroup, value, checked) => {
    setFilters(prev => {
      const currentFilters = prev[filterGroup] || []
      const newFilters = checked
        ? [...currentFilters, value]
        : currentFilters.filter(f => f !== value)
      
      return {
        ...prev,
        [filterGroup]: newFilters
      }
    })
  }, [])

  // Filter books based on search term and filters
  const filteredBooks = useMemo(() => {
    let filtered = allBooks

    // Apply search term filter
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase()
      filtered = filtered.filter(book => 
        book.title.toLowerCase().includes(lowerSearch) ||
        book.author.toLowerCase().includes(lowerSearch) ||
        book.isbn.includes(searchTerm)
      )
    }

    // Apply category filter
    if (filters.category.length > 0) {
      filtered = filtered.filter(book => {
        const bookGenre = book.genre || 'fiction'
        return filters.category.some(cat => {
          if (cat === 'fiction') return bookGenre === 'fiction'
          if (cat === 'non-fiction') return bookGenre === 'non-fiction'
          return bookGenre === cat
        })
      })
    }

    // Apply availability filter
    if (filters.availability.length > 0) {
      filtered = filtered.filter(book => {
        if (filters.availability.includes('in-stock')) {
          return book.availability > 0
        }
        if (filters.availability.includes('not-in-stock')) {
          return book.availability === 0
        }
        return true
      })
    }

    // Note: languages and age filters are available in the UI but not yet implemented
    // in the filtering logic as the books data doesn't include these fields yet

    return filtered
  }, [allBooks, searchTerm, filters])

  // Get trending books (top rated)
  const trendingBooks = useMemo(() => {
    return [...allBooks]
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 5)
  }, [allBooks])

  if (loading) {
    return (
      <div className={styles.advancedSearch}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <p style={{ color: 'var(--white)', fontSize: '1.2rem' }}>Loading books...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.advancedSearch}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ color: 'var(--gold)', fontSize: '1.2rem' }}>Error loading books</p>
          <p style={{ color: 'var(--white)', fontSize: '1rem' }}>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.advancedSearch}>
      <div className={styles.searchHeader}>
        <SearchForm onSearch={handleSearch} />
      </div>
      <main className={styles.mainContent}>
        {!searchTerm.trim() && (
          <TrendingSection books={trendingBooks} onAddToCart={handleAddToCart} />
        )}
        <LibrarySection 
          books={filteredBooks}
          filters={filters}
          onFilterChange={handleFilterChange}
          onAddToCart={handleAddToCart}
        />
      </main>
    </div>
  )
}

export default AdvancedSearch

