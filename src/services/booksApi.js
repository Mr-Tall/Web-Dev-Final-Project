const SUBJECTS = ['fiction', 'bestsellers', 'mystery-and-detective-stories', 'science_fiction', 'fantasy']

const SUBJECT_ENDPOINT = (subject) =>
  `https://openlibrary.org/subjects/${subject}.json?limit=40`

const COVER_URL = (coverId) =>
  coverId ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg` : null

const normalizeIsbn = (work, fallbackIndex) => {
  const possible =
    work.cover_edition_key ||
    work.edition_key?.[0] ||
    (work.isbn && work.isbn[0])
  if (possible) return possible
  const key = work.key?.replace('/works/', '') || fallbackIndex
  return `OL-${key}`
}

const buildDescription = (work) => {
  if (work.subject) {
    const top = work.subject.slice(0, 3).join(', ')
    return `Themes: ${top}`
  }
  if (work.subject_people) {
    return `Featuring ${work.subject_people.slice(0, 3).join(', ')}`
  }
  return 'Curated via Open Library'
}

const parseWork = (work, index, subject) => {
  const ratingBase = work.rating?.average || 3.5 + ((index % 10) * 0.1)
  const currentYear = new Date().getFullYear()
  const releaseYear = currentYear

  return {
    id: work.key || `work-${index}`,
    title: work.title,
    author: work.authors?.[0]?.name || 'Unknown Author',
    releaseDate: `${releaseYear}-01-01T00:00:00Z`,
    isbn: normalizeIsbn(work, index),
    rating: parseFloat(Math.min(5, Math.max(0, ratingBase)).toFixed(1)),
    image: COVER_URL(work.cover_id),
    genre: subject.replace(/[_-]/g, ' '),
    description: buildDescription(work)
  }
}

export async function fetchBooksCatalog() {
  try {
    const results = await Promise.all(
      SUBJECTS.map(async (subject) => {
        const response = await fetch(SUBJECT_ENDPOINT(subject))
        if (!response.ok) {
          throw new Error(`Failed to load ${subject}`)
        }
        const data = await response.json()
        return (data.works || []).map((work, index) =>
          parseWork(work, index, subject)
        )
      })
    )

    const merged = results.flat()
    const withUniqueIsbn = []
    const seen = new Set()
    merged.forEach((book) => {
      const isbn = book.isbn || `book-${withUniqueIsbn.length}`
      if (!seen.has(isbn)) {
        seen.add(isbn)
        withUniqueIsbn.push({ ...book, isbn })
      }
    })
    return withUniqueIsbn
  } catch (error) {
    console.error('Failed to fetch books from Open Library', error)
    throw error
  }
}

export default fetchBooksCatalog

