/**
 * Open Library API Service
 * Fetches books from Open Library and maps them to our book format
 */

/**
 * Generate a mock rating between 3.5 and 5.0
 * This ensures all books have ratings since Open Library doesn't provide them
 */
const generateMockRating = () => {
  // Generate rating between 3.5 and 5.0 with one decimal place
  return Math.round((Math.random() * 1.5 + 3.5) * 10) / 10;
};

/**
 * Get the first available ISBN from the array
 */
const getFirstIsbn = (isbnArray) => {
  if (!isbnArray || !Array.isArray(isbnArray) || isbnArray.length === 0) {
    return null;
  }
  // Prefer ISBN-13 (13 digits) over ISBN-10 (10 digits)
  const isbn13 = isbnArray.find(isbn => isbn && isbn.length === 13);
  return isbn13 || isbnArray[0];
};

/**
 * Format ISBN with dashes for display
 */
const formatIsbn = (isbn) => {
  if (!isbn) return null;
  // Remove any existing dashes
  const cleanIsbn = isbn.replace(/-/g, '');
  // Format ISBN-13: XXX-XX-XXXXX-XXX-X
  if (cleanIsbn.length === 13) {
    return `${cleanIsbn.slice(0, 3)}-${cleanIsbn.slice(3, 5)}-${cleanIsbn.slice(5, 10)}-${cleanIsbn.slice(10, 12)}-${cleanIsbn.slice(12)}`;
  }
  // Format ISBN-10: X-XXXXX-XXX-X
  if (cleanIsbn.length === 10) {
    return `${cleanIsbn.slice(0, 1)}-${cleanIsbn.slice(1, 6)}-${cleanIsbn.slice(6, 9)}-${cleanIsbn.slice(9)}`;
  }
  return isbn;
};

/**
 * Get cover image URL from Open Library
 */
const getCoverImage = (coverId, isbn) => {
  if (coverId) {
    return `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;
  }
  if (isbn) {
    const cleanIsbn = isbn.replace(/-/g, '');
    return `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg`;
  }
  return null;
};

/**
 * Get the first author name from the array
 */
const getAuthorName = (authorArray) => {
  if (!authorArray || !Array.isArray(authorArray) || authorArray.length === 0) {
    return 'Unknown Author';
  }
  return authorArray[0];
};

/**
 * Get the first subject/genre from the array
 */
const getGenre = (subjectArray) => {
  if (!subjectArray || !Array.isArray(subjectArray) || subjectArray.length === 0) {
    return 'Fiction';
  }
  // Prefer more specific genres, skip generic ones
  const specificGenres = subjectArray.filter(subject => 
    subject && typeof subject === 'string' && subject.length < 30
  );
  return specificGenres[0] || subjectArray[0] || 'Fiction';
};

/**
 * Format publish date to YYYY-MM-DD format
 * Open Library provides first_publish_year, so we'll use January 1st of that year
 */
const formatReleaseDate = (year) => {
  if (!year) return new Date().toISOString().split('T')[0];
  return `${year}-01-01`;
};

/**
 * Map Open Library book data to our book format
 */
const mapOpenLibraryBook = (olBook) => {
  const isbn = getFirstIsbn(olBook.isbn);
  const formattedIsbn = formatIsbn(isbn);
  const coverId = olBook.cover_i;
  
  return {
    title: olBook.title || 'Untitled',
    author: getAuthorName(olBook.author_name),
    releaseDate: formatReleaseDate(olBook.first_publish_year),
    isbn: formattedIsbn || `OL${olBook.key?.replace('/works/', '') || Date.now()}`,
    rating: generateMockRating(),
    genre: getGenre(olBook.subject),
    image: getCoverImage(coverId, isbn),
    // Store original Open Library data for reference
    olKey: olBook.key,
    olEditionKey: olBook.edition_key?.[0],
  };
};

/**
 * Fetch books from Open Library
 * @param {number} limit - Number of books to fetch (default: 50)
 * @returns {Promise<Array>} Array of mapped book objects
 */
export const fetchBooksFromOpenLibrary = async (limit = 50) => {
  try {
    // Search for popular books - using a broad query to get diverse results
    const query = 'subject:fiction OR subject:nonfiction OR subject:science OR subject:history';
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${limit}&fields=title,author_name,first_publish_year,isbn,cover_i,subject,key,edition_key`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.docs || !Array.isArray(data.docs)) {
      throw new Error('Invalid response format from Open Library');
    }
    
    // Filter out books without essential data and map to our format
    const books = data.docs
      .filter(book => book.title && (book.author_name?.length > 0 || book.isbn?.length > 0))
      .map(mapOpenLibraryBook)
      .slice(0, limit);
    
    return books;
  } catch (error) {
    console.error('Error fetching books from Open Library:', error);
    throw error;
  }
};

/**
 * Search books from Open Library
 * @param {string} query - Search query
 * @param {number} limit - Number of results (default: 20)
 * @returns {Promise<Array>} Array of mapped book objects
 */
export const searchBooksFromOpenLibrary = async (query, limit = 20) => {
  try {
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${limit}&fields=title,author_name,first_publish_year,isbn,cover_i,subject,key,edition_key`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.docs || !Array.isArray(data.docs)) {
      return [];
    }
    
    // Filter and map to our format
    const books = data.docs
      .filter(book => book.title && (book.author_name?.length > 0 || book.isbn?.length > 0))
      .map(mapOpenLibraryBook);
    
    return books;
  } catch (error) {
    console.error('Error searching books from Open Library:', error);
    return [];
  }
};

