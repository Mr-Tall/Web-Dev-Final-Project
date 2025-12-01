import { useEffect, useState, useRef } from 'react';
import { useUserLibrary } from '../context/UserLibraryContext';
import { useRecommendationBooks } from '../context/RecommendationBooksContext';
import { generateTieredRecommendations } from '../engine/recommendationEngine';
import { removeStorageItem } from '../utils/storageUtils';

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
    // Include ISBN, saved, favorite, rating (with precision), and reviewed status to detect any changes
    // Use toFixed(1) for rating to ensure consistent hashing
    return books
      .map(b => {
        const rating = b.rated && b.rating !== undefined && b.rating !== null 
          ? `r${Number(b.rating).toFixed(1)}` 
          : '';
        const reviewed = b.reviewed ? 'v' : '';
        return `${b.isbn}:${b.saved ? 's' : ''}${b.favorite ? 'f' : ''}${rating}${reviewed}`;
      })
      .sort()
      .join(',');
  };

  // Clear any existing cache on mount
  useEffect(() => {
    removeStorageItem(cacheKey);
  }, [cacheKey]);

  // Regenerate recommendations whenever library or allBooks change - NO CACHING
  useEffect(() => {
    if (!allBooks || allBooks.length === 0) {
      setRecommendations([]);
      return;
    }

    // Always get fresh user books data
    const userBooks = getAllBooks();
    const currentHash = createLibraryHash(userBooks);

    // If user has no relevant books, clear recommendations
    if (!userBooks || userBooks.length === 0 || currentHash === 'empty') {
      setRecommendations([]);
      lastLibraryHash.current = currentHash;
      return;
    }

    // Only regenerate if hash changed (library actually changed)
    if (currentHash === lastLibraryHash.current) {
      return;
    }

    // Generate new recommendations immediately with fresh data - NO CACHING
    try {
      // Get fresh user books data to ensure we're using latest state
      const freshUserBooks = getAllBooks();
      
      // Debug: Log what books are being used
      console.log('Generating recommendations with books:', freshUserBooks.map(b => ({
        isbn: b.isbn,
        title: b.title,
        author: b.author,
        saved: b.saved,
        favorite: b.favorite,
        rated: b.rated,
        rating: b.rating,
        reviewed: b.reviewed,
        hasReview: !!(b.review && b.review.trim().length > 0)
      })));
      
      const newBatch = generateTieredRecommendations(freshUserBooks, allBooks, batchSize);

      // Update state immediately
      setRecommendations(newBatch);

      // Update hash to current state
      lastLibraryHash.current = currentHash;
    } catch (err) {
      console.error('Error generating recommendations:', err);
      setRecommendations([]);
    }
  }, [library, allBooks, batchSize, getAllBooks]);

  return recommendations
}