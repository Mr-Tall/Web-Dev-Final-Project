import { useState } from "react";

export default function ReviewForm({ onSubmit }) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ rating, comment });
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Write a Review</h2>

            <label>Rating:</label>
            <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                {[1,2,3,4,5].map(n => <option key={n}>{n}</option>)}
            </select>

            <label>Comment:</label>
            <textarea 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows="4"
                style={{ width: "100%" }}
            />

            <button type="submit">Submit Review</button>
        </form>
    );
}
