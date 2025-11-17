export default function BookDescription({book}) {
    return (
        <div>
            <p>{book.description}</p>
            <ul>
                {book.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                ))}
            </ul>
        </div>
    );
}