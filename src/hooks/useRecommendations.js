import { useMemo } from 'react';
import { useUserLibrary } from '../context/UserLibraryContext';
import { useBooks } from '../context/BooksContext';
import { generateTieredRecommendations } from '../engine/recommendationEngine';

const CACHE_PREFIX = 'bc_user_recommendations';

export default function useRecommendations(batchSize = 300) {
  const { getAllBooks, library } = useUserLibrary();
  const { books: allBooks } = useBooks();
  const userBooks = getAllBooks();

  // Cache key per user
  const userKey = library?.uid || library?.email || 'guest';
  const cacheKey = `${CACHE_PREFIX}_${userKey}`;

  const recommendations = useMemo(() => {
    if (!allBooks || allBooks.length === 0) return [];

    try {
      // Return cached batch if it exists
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.length > 0) return parsed;
      }

      // Otherwise generate new batch
      const newBatch = generateTieredRecommendations(userBooks, allBooks, batchSize);

      // Save to cache
      localStorage.setItem(cacheKey, JSON.stringify(newBatch));

      return newBatch;
    } catch (err) {
      console.error('Error generating recommendations:', err);
      return generateTieredRecommendations(userBooks, allBooks, batchSize);
    }
  }, [userBooks, allBooks, batchSize, cacheKey]);

  return recommendations;
}
