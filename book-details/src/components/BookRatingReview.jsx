import StarRating from '../components/StarRating.jsx';

export default function BookRatingReview({book}) {
    const positive = PositiveReview(book.reviews);
    const negative = NegativeReview(book.reviews);

    const handleSaveClick = () => {
        alert("Added to Your Saved!");
    };
    return (
        <div>
            <StarRating rating={averageRating(book.ratings)} />
            <p>Average from {book.ratings.length} ratings</p>
            <a href="/rate">
                <button>RATE</button>
            </a>
            <a href="/create-review">
                <button>REVIEW</button>
            </a>
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