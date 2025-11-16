import React, { useState, useCallback } from 'react'
import Header from './components/Header/Header'
import TrendingSection from './components/TrendingSection/TrendingSection'
import LibrarySection from './components/LibrarySection/LibrarySection'
import styles from './App.module.css'

function App() {
  const [cartCount, setCartCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    category: [],
    languages: [],
    age: [],
    availability: []
  })

  // Mock books data - in a real app, this would come from an API
  const [books] = useState([
    { id: 1, title: 'Book Title 1', author: 'Author Name 1', availability: 1 },
    { id: 2, title: 'Book Title 2', author: 'Author Name 2', availability: 2 },
  ])

  const handleSearch = useCallback((term) => {
    setSearchTerm(term)
    console.log('Searching for:', term)
    // This would typically filter the book results
  }, [])

  const handleAddToCart = useCallback((book) => {
    setCartCount(prev => prev + 1)
    console.log('Added to cart:', book)
    // This would typically add the book to a cart state/API
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
    console.log('Filter changed:', filterGroup, value, checked)
    // This would typically filter the book results
  }, [])

  return (
    <div className={styles.app}>
      <Header cartCount={cartCount} onSearch={handleSearch} />
      <main className={styles.mainContent}>
        <TrendingSection books={books} onAddToCart={handleAddToCart} />
        <LibrarySection 
          books={books}
          filters={filters}
          onFilterChange={handleFilterChange}
          onAddToCart={handleAddToCart}
        />
      </main>
    </div>
  )
}

export default App

