import './RelatedBooks.css'; // make sure this path is correct

export default function RelatedBooks({ book }) {
  return (
    <div className="related-section"> {/* container matches your page CSS */}
      <h4 className="related-books-heading">Enjoyed {book.title}? Try these!</h4>
      <div className="related-books-grid">
        {book.relatedBooks.map((item, index) => (
          <div className="related-book-card" key={index}>
            <img src={item.image} alt={item.title} />
            <a href="#">{item.title}</a>
          </div>
        ))}
      </div>
    </div>
  );
}
