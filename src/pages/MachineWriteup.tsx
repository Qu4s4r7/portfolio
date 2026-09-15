import { useParams, Link } from "react-router-dom";
import MarkdownRenderer from "../components/MarkdownRenderer";

const files = import.meta.glob(
  "../content/machines/*.md",
  {
    query: "?raw",
    import: "default",
    eager: true,
  }
) as Record<string, string>;

export default function MachineWriteup() {
  const { id } = useParams();

  const content =
    files[`../content/machines/${id}.md`];

  if (!content) {
    return (
      <section className="content-page">
        <Link to="/machines" className="back-link">
          ← Back to machines
        </Link>

        <h1>Machine not found</h1>
      </section>
    );
  }

  return (
    <section className="markdown-page">
      <Link to="/machines" className="back-link">
        ← Back to machines
      </Link>

      <MarkdownRenderer content={content} />
    </section>
  );
}