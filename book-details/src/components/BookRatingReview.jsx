import { useState } from "react"; 
import Modal from "../components/Modal.jsx";  
import ReviewForm from "../components/ReviewForm.jsx";
import StarRating from '../components/StarRating.jsx';

export default function BookRatingReview({book}) {
    // modal open/close state
    const [openReview, setOpenReview] = useState(false);

    const positive = PositiveReview(book.reviews);
    const negative = NegativeReview(book.reviews);

    const handleSaveClick = () => {
        alert("Added to Your Saved!");
    };

    const handleSubmitReview = (review) => {
      alert("Review submitted!", review);
      setOpenReview(false);
  };

    return (
        <div>
            <StarRating rating={averageRating(book.ratings)} />
            <p>Average from {book.ratings.length} ratings</p>

            <a href="/rate">
                <button>RATE</button>
            </a>
            
            <button onClick={() => setOpenReview(true)}>REVIEW</button>
            <Modal 
                open={openReview} 
                onClose={() => setOpenReview(false)}
            >
                <ReviewForm onSubmit={handleSubmitReview} />  
            </Modal>

            <button onClick={handleSaveClick}>SAVE</button>
            <p><StarRating rating={positive.rating} />{positive.author}</p>
            <p>{positive.comment} </p>
            <p><StarRating rating={negative.rating} />{negative.author}</p>
            <p>{negative.comment} </p>
            <p><a href="#">See all {book.reviews.length} reviews</a></p>
        </div>
    );
}

function averageRating(ratings) {
    return ratings.reduce((sum, n) => sum + n, 0) / ratings.length;
  }
  
  export function sortReviews(reviews) {
    return [...reviews].sort((a, b) => b.upvotes - a.upvotes);
  }
  
  export function PositiveReview(reviews) {
    return sortReviews(reviews).find(r => r.rating > 3) || null;
  }
  
  export function NegativeReview(reviews) {
    return sortReviews(reviews).find(r => r.rating < 3) || null;
  }  