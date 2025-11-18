import { book } from '../data/book.js';
import NavBar from "../components/NavBar.jsx";
import BookHeader from '../components/BookHeader.jsx';
import BookCover from '../components/BookCover.jsx';
import BookDescription from '../components/BookDescription.jsx';
import BookRatingReview from '../components/BookRatingReview.jsx';
import BookAvailability from '../components/BookAvailability.jsx';
import RelatedBooks from '../components/RelatedBooks.jsx';
import './BookDetails.css';

export default function BookDetails() {
    return (
      <div className="book-details">
        <div className="heading">
          <NavBar />
          <BookHeader book={book} />
        </div>
  
        <div className="left-column">
          <BookCover book={book} />
          <BookAvailability book={book} />
        </div>
  
        <div className="right-column">
          <BookDescription book={book} />
          <BookRatingReview book={book} />
        </div>
  
        <div className="related-section">
          <RelatedBooks book={book} />
        </div>
      </div>
    );
  }
  