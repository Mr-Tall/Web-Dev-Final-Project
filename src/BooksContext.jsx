import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchBooksFromOpenLibrary, searchBooksFromOpenLibrary } from './services/openLibraryApi';

const BooksContext = createContext(null);

export const useBooks = () => {
  const context = useContext(BooksContext);
  if (!context) {
    throw new Error('useBooks must be used within a BooksProvider');
  }
  return context;
};

export const BooksProvider = ({ children }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch books on mount
  useEffect(() => {
    const loadBooks = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedBooks = await fetchBooksFromOpenLibrary(50);
        setBooks(fetchedBooks);
      } catch (err) {
        console.error('Failed to load books:', err);
        setError(err.message || 'Failed to load books from Open Library');
        // Set empty array on error so app doesn't crash
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };

    loadBooks();
  }, []);

  // Search function for SearchBar component
  const searchBooks = async (query, limit = 20) => {
    if (!query || query.trim() === '') {
      return [];
    }
    
    try {
      const results = await searchBooksFromOpenLibrary(query, limit);
      return results;
    } catch (err) {
      console.error('Search failed:', err);
      // Fallback to local search if API fails
      return books.filter(book => {
        const lowerQuery = query.toLowerCase();
        return (
          book.title.toLowerCase().includes(lowerQuery) ||
          book.author.toLowerCase().includes(lowerQuery) ||
          (book.isbn && book.isbn.includes(query))
        );
      }).slice(0, limit);
    }
  };

  const value = {
    books,
    loading,
    error,
    searchBooks,
  };

  return (
    <BooksContext.Provider value={value}>
      {children}
    </BooksContext.Provider>
  );
};

