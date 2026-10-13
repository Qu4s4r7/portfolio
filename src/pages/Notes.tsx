import { Link } from "react-router-dom";
import { notes } from "../data/notes";

export default function Notes() {
  return (
    <section className="content-page">
      <div className="page-header">
        <p className="page-kicker">KNOWLEDGE</p>
        <span className="page-number">04</span>
      </div>
      <div className="page-title">
        <span className="material-symbols-outlined">library_books</span>
        <h1>Notes</h1>
      </div>

      <div className="notes-list">
        {notes.map((note) => (
          <Link
            key={note.id}
            to={`/notes/${note.id}`}
            className="note-item"
          >
            <div>
              <span className="note-id">
                NOTE / {note.id}
              </span>

              <h2>{note.title}</h2>

              <p>{note.description}</p>
            </div>

            <span className="note-arrow">
              →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}