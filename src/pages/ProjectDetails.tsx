import { useParams, Link } from "react-router-dom";

import MarkdownRenderer from "../components/MarkdownRenderer";
import { projects } from "../data/projects";

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

  const project =
    projects.find((project) => project.id === id);

  if (!content || !project) {
    return (
      <section className="content-page">
        <Link to="/projects" className="back-link">
          ← Back to projects
        </Link>

        <h1>Project not found</h1>
      </section>
    );
  }

  const imageSrc = project.image.startsWith("/")
    ? `${import.meta.env.BASE_URL}${project.image.slice(1)}`
    : project.image;

  return (
    <section className="markdown-page">
      <Link to="/projects" className="back-link">
        ← Back to projects
      </Link>

      <div className="header">
        <img
          src={imageSrc}
          alt={project.title}
          className="header-cover"
        />
      </div>

      <MarkdownRenderer content={content} />
    </section>
  );
}