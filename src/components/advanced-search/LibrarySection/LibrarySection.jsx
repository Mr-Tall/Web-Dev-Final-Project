import FiltersSidebar from '../FiltersSidebar/FiltersSidebar'
import BooksGrid from '../BooksGrid/BooksGrid'
import styles from './LibrarySection.module.css'

const LibrarySection = ({ 
  books = [], 
  allBooksCount = 0,
  filters, 
  onFilterChange, 
  availableGenres = [],
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  itemsPerPage = 10
}) => {
  const showPagination = allBooksCount > itemsPerPage

  return (
    <div className={styles.libraryContent}>
      <FiltersSidebar 
        filters={filters} 
        onFilterChange={onFilterChange}
        availableGenres={availableGenres}
      />
      <div className={styles.booksContainer}>
        <BooksGrid 
          books={books} 
        />
        {showPagination && (
          <div className={styles.pagination}>
            <button 
              className={styles.paginationBtn}
              onClick={() => onPageChange(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }
              
              if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                return (
                  <button
                    key={pageNum}
                    className={`${styles.paginationBtn} ${currentPage === pageNum ? styles.active : ''}`}
                    onClick={() => onPageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                )
              } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                return <span key={pageNum} className={styles.paginationEllipsis}>...</span>
              }
              return null
            })}
            <button 
              className={styles.paginationBtn}
              onClick={() => onPageChange(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default LibrarySection

