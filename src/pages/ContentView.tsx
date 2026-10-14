import { Link } from "react-router-dom";

interface ContentViewProps {
  kicker: string;
  number: string;
  title: string;
  icon: string;
  name: string; // "machines", "projects", o "notes"
  items: any[];
}

export default function ContentView({ kicker, number, title, icon, name, items }: ContentViewProps) {
  const isNotes = name === "notes";

  return (
    <section className="content-page">
      <div className="page-header">
        <p className="page-kicker">{kicker}</p>
        <span className="page-number">{number}</span>
      </div>
      <div className="page-title">
        <span className="material-symbols-outlined">{icon}</span>
        <h1>{title}</h1>
      </div>

      {/* Renderizado condicional según si es grid de tarjetas o lista de notas */}
      {isNotes ? (
        <div className="notes-list">
          {items.map((note) => (
            <Link key={note.id} to={`/${name}/${note.id}`} className="note-item">
              <div>
                <span className="note-id">NOTE / {note.id}</span>
                <h2>{note.title}</h2>
                <p>{note.description}</p>
              </div>
              <span className="note-arrow">→</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="items-grid">
          {items.map((item) => {
            const imageSrc = item.image.startsWith("/")
              ? `${import.meta.env.BASE_URL}${item.image.slice(1)}`
              : item.image;

            return (
              <Link key={item.id} to={`/${name}/${item.id}`} className="item-card">
                <div className="item-card-top">
                  <span>{item.platform || item.category || ""}</span>
                  <span>{item.date || ""}</span>
                </div>

                <img className="item-image" src={imageSrc} alt={item.title} />

                <h2>{item.title}</h2>

                <p>
                  {item.os ? `${item.os} · ` : ""}
                  {item.difficulty || item.description || ""}
                </p>

                {item.tags && (
                  <div className="item-tags">
                    {item.tags.map((tag: string) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
