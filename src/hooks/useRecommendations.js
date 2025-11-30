import { useEffect, useState, useRef } from 'react';
import { useUserLibrary } from '../context/UserLibraryContext';
import { useRecommendationBooks } from '../context/RecommendationBooksContext';
import { generateTieredRecommendations } from '../engine/recommendationEngine';
import { getStorageJSON, setStorageItem, removeStorageItem } from '../utils/storageUtils';

const CACHE_PREFIX = 'bc_user_recommendations';

export default function useRecommendations(batchSize = 300) {
  const { getAllBooks, library } = useUserLibrary();
  const { books: allBooks } = useRecommendationBooks();

  const userKey = library?.uid || library?.email || 'guest';
  const cacheKey = `${CACHE_PREFIX}_${userKey}`;

  const [recommendations, setRecommendations] = useState([]);
  const lastLibraryHash = useRef(null);

  // Create a stable hash of the user's library that includes all relevant data
  const createLibraryHash = (books) => {
    if (!books || books.length === 0) return 'empty';
    // Include ISBN, saved, favorite, and rating status to detect any changes
    return books
      .map(b => `${b.isbn}:${b.saved ? 's' : ''}${b.favorite ? 'f' : ''}${b.rated ? `r${b.rating || 0}` : ''}`)
      .sort()
      .join(',');
  };

  // Load from cache on initial mount only, but verify user has books first
  useEffect(() => {
    const userBooks = getAllBooks();
    // Only load from cache if user actually has relevant books
    if (!userBooks || userBooks.length === 0) {
      // Clear any stale cache
      removeStorageItem(cacheKey);
      return;
    }

    const cached = getStorageJSON(cacheKey);
    if (cached && cached.length > 0) {
      setRecommendations(cached);
    }
  }, [cacheKey, getAllBooks]);

  // Helper function to clear cache and recommendations
  const clearCache = () => {
    setRecommendations([]);
    removeStorageItem(cacheKey);
  };

  // Regenerate recommendations whenever library or allBooks change
  useEffect(() => {
    if (!allBooks || allBooks.length === 0) {
      clearCache();
      return;
    }

    const userBooks = getAllBooks();
    const currentHash = createLibraryHash(userBooks);

    // If user has no relevant books, clear recommendations and cache
    if (!userBooks || userBooks.length === 0 || currentHash === 'empty') {
      clearCache();
      lastLibraryHash.current = currentHash;
      return;
    }

    // Always regenerate if hash changed
    if (currentHash === lastLibraryHash.current) return;

    // Generate new recommendations immediately
    try {
      const newBatch = generateTieredRecommendations(userBooks, allBooks, batchSize);

      // Update state immediately
      setRecommendations(newBatch);

      // Save to cache (or remove if empty)
      if (newBatch.length > 0) {
        setStorageItem(cacheKey, newBatch);
      } else {
        removeStorageItem(cacheKey);
      }

      // Update hash
      lastLibraryHash.current = currentHash;
    } catch (err) {
      console.error('Error generating recommendations:', err);
      clearCache();
    }
  }, [library, allBooks, batchSize, cacheKey, getAllBooks]);

  return recommendations
}