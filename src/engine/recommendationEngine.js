import shuffleArray from '../utils/shuffle';

/**
 * Calculate similarity between a candidate book and user's saved/favorited/rated books
 * Focuses primarily on genre matching, with author as secondary factor
 * Returns both score and recommendation reasons
 */
export function calculateSimilarity(userBooks, candidateBook) {
  if (!userBooks || userBooks.length === 0) return { score: 0, reasons: [] };

  let score = 0;
  const reasons = [];
  const genreMatches = new Set();
  const authorMatches = new Set();

  userBooks.forEach(userBook => {
    // Consider saved, favorited, rated books (any rating > 0), or reviewed books
    // Include all rated books - lower ratings will have lower weight multipliers
    const hasRating = userBook.rated && userBook.rating && userBook.rating > 0;
    // Consider reviewed books (if they have no rating or any rating)
    const hasReview = userBook.reviewed && userBook.review && userBook.review.trim().length > 0;
    const relevant = userBook.saved || userBook.favorite || hasRating || hasReview;
    if (!relevant) return;

    // Calculate base weight multiplier based on user engagement
    // Reviews indicate stronger engagement, so weight them higher
    let weightMultiplier = 1.0;
    if (hasReview) {
      // Books with reviews get 2x weight (stronger signal)
      weightMultiplier = 2.0;
    } else if (hasRating && userBook.rating) {
      // Use actual rating value to weight (normalized to 0.3-2.5 range)
      // Rating 1 = 0.3x, Rating 2 = 0.8x, Rating 3 = 1.3x, Rating 4 = 1.8x, Rating 5 = 2.5x
      weightMultiplier = Math.max(0.3, (userBook.rating - 2.0) * 0.5 + 1.0);
    } else if (userBook.favorite) {
      // Favorites get 1.5x weight
      weightMultiplier = 1.5;
    } else if (userBook.saved) {
      // Saved books get base weight
      weightMultiplier = 1.0;
    }

    // Same genre - give higher weight (2 points base) since this is the primary focus
    // Use case-insensitive comparison since genres might be stored in different cases
    const userGenre = userBook.genre ? userBook.genre.toLowerCase().trim() : null;
    const candidateGenre = candidateBook.genre ? candidateBook.genre.toLowerCase().trim() : null;
    if (userGenre && candidateGenre && userGenre === candidateGenre) {
      const genreScore = 2 * weightMultiplier;
      score += genreScore;
      if (!genreMatches.has(candidateGenre)) {
        genreMatches.add(candidateGenre);
        const reviewNote = hasReview ? ' (reviewed)' : '';
        reasons.push({
          type: 'genre',
          value: candidateBook.genre, // Use original case for display
          message: `Similar to your ${candidateBook.genre} books${reviewNote}`
        });
      }
    }

    // Same author - secondary factor (1 point base)
    // Use case-insensitive comparison for author names
    const userAuthor = userBook.author ? userBook.author.toLowerCase().trim() : null;
    const candidateAuthor = candidateBook.author ? candidateBook.author.toLowerCase().trim() : null;
    if (userAuthor && candidateAuthor && userAuthor === candidateAuthor) {
      const authorScore = 1 * weightMultiplier;
      score += authorScore;
      if (!authorMatches.has(candidateAuthor)) {
        authorMatches.add(candidateAuthor);
        const reviewNote = hasReview ? ' (reviewed)' : '';
        reasons.push({
          type: 'author',
          value: candidateBook.author, // Use original case for display
          message: `Same author as "${userBook.title}"${reviewNote}`
        });
      }
    }

    // Shared genres (if using genres array) - also give higher weight
    if (candidateBook.genres && userBook.genres) {
      const shared = candidateBook.genres.filter(g => userBook.genres.includes(g));
      const genresScore = shared.length * 2 * weightMultiplier; // Weighted by user engagement
      score += genresScore;
      shared.forEach(genre => {
        if (!genreMatches.has(genre)) {
          genreMatches.add(genre);
          const reviewNote = hasReview ? ' (reviewed)' : '';
          reasons.push({
            type: 'genre',
            value: genre,
            message: `Similar to your ${genre} books${reviewNote}`
          });
        }
      });
    }
  });

  return { score, reasons };
}

/**
 * Generate a batch of recommendations using tiered shuffling
 */
export function generateTieredRecommendations(userBooks, allBooks, batchSize = 300) {
  if (!allBooks || allBooks.length === 0) {
    console.log('[RecommendationEngine] No books available for recommendations')
    return [];
  }
  
  // If user has no relevant books (saved, favorited, or rated), return no recommendations
  if (!userBooks || userBooks.length === 0) {
    console.log('[RecommendationEngine] No user books provided')
    return [];
  }

  console.log('[RecommendationEngine] Processing', userBooks.length, 'user books against', allBooks.length, 'candidate books')

  // Exclude already interacted books
  const interactedISBNs = new Set(userBooks.map(b => b.isbn));
  const candidates = allBooks.filter(b => !interactedISBNs.has(b.isbn));
  
  console.log('[RecommendationEngine]', candidates.length, 'candidate books after excluding', userBooks.length, 'interacted books')

  // Compute similarity with reasons
  const scored = candidates.map(book => {
    const { score, reasons } = calculateSimilarity(userBooks, book);
    return {
    ...book,
      score,
      recommendationReasons: reasons
    };
  });

  // Filter out books with score 0 (no matches) - these shouldn't be recommended
  const relevantBooks = scored.filter(book => book.score > 0);
  
  console.log('[RecommendationEngine]', relevantBooks.length, 'books with similarity score > 0')
  
  // If no books have any similarity, return empty array
  if (relevantBooks.length === 0) {
    console.log('[RecommendationEngine] No books found with matching genres/authors. User book genres:', 
      [...new Set(userBooks.map(b => b.genre).filter(Boolean))])
    return [];
  }

  // Sort by score descending
  relevantBooks.sort((a, b) => b.score - a.score);

  // Split into 3 tiers
  const total = relevantBooks.length;
  const chunk = Math.floor(total / 3);
  const tier1 = shuffleArray(relevantBooks.slice(0, chunk));
  const tier2 = shuffleArray(relevantBooks.slice(chunk, chunk * 2));
  const tier3 = shuffleArray(relevantBooks.slice(chunk * 2));

  // Select batchSize / 3 from each tier
  const itemsPerTier = Math.floor(batchSize / 3);
  const t1Selection = tier1.slice(0, itemsPerTier);
  const t2Selection = tier2.slice(0, itemsPerTier);
  const t3Selection = tier3.slice(0, batchSize - t1Selection.length - t2Selection.length);

  return [...t1Selection, ...t2Selection, ...t3Selection];
}
