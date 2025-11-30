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
    // Only consider saved, favorited, or rated books with rating > 3
    const hasGoodRating = userBook.rated && userBook.rating > 3;
    const relevant = userBook.saved || userBook.favorite || hasGoodRating;
    if (!relevant) return;

    // Same genre - give higher weight (2 points) since this is the primary focus
    if (candidateBook.genre && userBook.genre && candidateBook.genre === userBook.genre) {
      score += 2;
      if (!genreMatches.has(candidateBook.genre)) {
        genreMatches.add(candidateBook.genre);
        reasons.push({
          type: 'genre',
          value: candidateBook.genre,
          message: `Similar to your ${candidateBook.genre} books`
        });
      }
    }

    // Same author - secondary factor (1 point)
    if (candidateBook.author && userBook.author && candidateBook.author === userBook.author) {
      score += 1;
      if (!authorMatches.has(candidateBook.author)) {
        authorMatches.add(candidateBook.author);
        reasons.push({
          type: 'author',
          value: candidateBook.author,
          message: `Same author as "${userBook.title}"`
        });
      }
    }

    // Shared genres (if using genres array) - also give higher weight
    if (candidateBook.genres && userBook.genres) {
      const shared = candidateBook.genres.filter(g => userBook.genres.includes(g));
      score += shared.length * 2; // Higher weight for genre matches
      shared.forEach(genre => {
        if (!genreMatches.has(genre)) {
          genreMatches.add(genre);
          reasons.push({
            type: 'genre',
            value: genre,
            message: `Similar to your ${genre} books`
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
  if (!allBooks || allBooks.length === 0) return [];
  
  // If user has no relevant books (saved, favorited, or rated), return no recommendations
  if (!userBooks || userBooks.length === 0) return [];

  // Exclude already interacted books
  const interactedISBNs = new Set(userBooks.map(b => b.isbn));
  const candidates = allBooks.filter(b => !interactedISBNs.has(b.isbn));

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
  
  // If no books have any similarity, return empty array
  if (relevantBooks.length === 0) return [];

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
