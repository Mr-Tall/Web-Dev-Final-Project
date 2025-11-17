export default function MediaAvailabilityGrid({ book }) {
    return (
      <table>
        <thead>
          <tr>
            <th>Action</th>
            <th>Availability</th>
            <th>Library</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {book.availability.map((item, index) => (
            <tr key={index}>
              <td>
                <button>{item.available > 0 ? "CHECKOUT" : "REQUEST"}</button>
              </td>
              <td>{item.available} / {item.quantity}</td>
              <td>{item.library}</td>
              <td>{item.type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  