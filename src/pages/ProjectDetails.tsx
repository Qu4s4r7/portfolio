import { useParams, Link } from "react-router-dom";
import MarkdownRenderer from "../components/MarkdownRenderer";

const files = import.meta.glob(
  "../content/projects/*.md",
  {
    query: "?raw",
    import: "default",
    eager: true,
  }
) as Record<string, string>;

export default function ProjectDetails() {
  const { id } = useParams();

  const content =
    files[`../content/projects/${id}.md`];

  if (!content) {
    return (
      <section className="content-page">
        <Link to="/projects" className="back-link">
          ← Back to projects
        </Link>

        <h1>Project not found</h1>
      </section>
    );
  }

  return (
    <section className="markdown-page">
      <Link to="/projects" className="back-link">
        ← Back to projects
      </Link>

      <MarkdownRenderer content={content} />
    </section>
  );
}