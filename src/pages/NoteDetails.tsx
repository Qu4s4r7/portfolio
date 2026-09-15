import { useParams, Link } from "react-router-dom";
import MarkdownRenderer from "../components/MarkdownRenderer";

const files = import.meta.glob(
  "../content/notes/*.md",
  {
    query: "?raw",
    import: "default",
    eager: true,
  }
) as Record<string, string>;

export default function NoteDetails() {
  const { id } = useParams();

  const content =
    files[`../content/notes/${id}.md`];

  if (!content) {
    return (
      <section className="content-page">
        <Link to="/notes" className="back-link">
          ← Back to notes
        </Link>

        <h1>Note not found</h1>
      </section>
    );
  }

  return (
    <section className="markdown-page">
      <Link to="/notes" className="back-link">
        ← Back to notes
      </Link>

      <MarkdownRenderer content={content} />
    </section>
  );
}