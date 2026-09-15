import { Link } from "react-router-dom";

const notes = [
  {
    id: "redes",
    title: "Redes",
    description:
      "Apuntes y conceptos relacionados con redes y sistemas.",
  },
];

export default function Notes() {
  return (
    <section className="content-page">
      <div className="page-header">
        <span className="page-number">04</span>

        <div>
          <p className="page-kicker">
            KNOWLEDGE
          </p>

          <h1>Notes</h1>
        </div>
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