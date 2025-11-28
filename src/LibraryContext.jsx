import React, { createContext, useContext, useState, useEffect } from 'react';

const LibraryContext = createContext(null);

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};

export const LibraryProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [savedBooks, setSavedBooks] = useState([]);

  // Load from localStorage on mount
  useEffect(() => {
    const storedFavorites = localStorage.getItem('library_favorites');
    const storedSavedBooks = localStorage.getItem('library_savedBooks');
    
    if (storedFavorites) {
      try {
        setFavorites(JSON.parse(storedFavorites));
      } catch (e) {
        console.error('Error parsing favorites from localStorage:', e);
      }
    }
    
    if (storedSavedBooks) {
      try {
        setSavedBooks(JSON.parse(storedSavedBooks));
      } catch (e) {
        console.error('Error parsing savedBooks from localStorage:', e);
      }
    }
  }, []);

  // Save to localStorage whenever favorites or savedBooks change
  useEffect(() => {
    localStorage.setItem('library_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('library_savedBooks', JSON.stringify(savedBooks));
  }, [savedBooks]);

  // Generate a unique ID for a book using ISBN and title combination
  const getBookId = (book) => {
    // Use combination of ISBN and title to ensure uniqueness
    // Normalize by trimming whitespace
    const isbn = (book.isbn || '').trim();
    const title = (book.title || '').trim();
    return `${isbn}|||${title}`;
  };

  const toggleFavorite = (book) => {
    setFavorites((prev) => {
      const bookId = getBookId(book);
      const isFavorite = prev.some((b) => getBookId(b) === bookId);
      
      if (isFavorite) {
        return prev.filter((b) => getBookId(b) !== bookId);
      } else {
        return [...prev, book];
      }
    });
  };

  const toggleSaved = (book) => {
    setSavedBooks((prev) => {
      const bookId = getBookId(book);
      const isSaved = prev.some((b) => getBookId(b) === bookId);
      
      if (isSaved) {
        return prev.filter((b) => getBookId(b) !== bookId);
      } else {
        return [...prev, book];
      }
    });
  };

  const isFavorite = (book) => {
    const bookId = getBookId(book);
    return favorites.some((b) => getBookId(b) === bookId);
  };

  const isSaved = (book) => {
    const bookId = getBookId(book);
    return savedBooks.some((b) => getBookId(b) === bookId);
  };

  const value = {
    favorites,
    savedBooks,
    toggleFavorite,
    toggleSaved,
    isFavorite,
    isSaved,
    getBookId,
  };

  return (
    <LibraryContext.Provider value={value}>
      {children}
    </LibraryContext.Provider>
  );
};

