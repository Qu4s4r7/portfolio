import { useParams, Link } from "react-router-dom";
import MarkdownRenderer from "../components/MarkdownRenderer";
import { getMarkdownContent } from "../data/contentLoader";
import type { Machine, Project, Note } from "../types";

interface DetailsProps {
  data?: (Machine | Project | Note)[];
  name: string;
}
export default function Details({ data, name }: DetailsProps) {
  const { id } = useParams();
  const content = getMarkdownContent(name, id);
  const element = data ? data.find((item: any) => item.id === id) : null;
  const isNotFound = name === "notes" ? !content : !content || !element;

  if (isNotFound) {
    return (
      <section className="content-page">
        <Link to={`/${name}`} className="back-link">
          ← Back to {name}
        </Link>
        <h1>{name} not found</h1>
      </section>
    );
  }

  const imageSrc = element && "image" in element && element.image
    ? element.image.startsWith("/")
      ? `${import.meta.env.BASE_URL}${element.image.slice(1)}`
      : element.image
    : "";

  return (
    <section className="markdown-page">
      <Link to={`/${name}`} className="back-link">
        ← Back to {name}
      </Link>

      {imageSrc && element && (
        <div className="header">
          <img src={imageSrc} alt={element.title || "Cover"} className="header-cover" />
        </div>
      )}

      <MarkdownRenderer content={content} />

      {name === "machines" && element && "platform" in element && (
        <p>Write-up realizado con fines educativos en el entorno de laboratorio de {element.platform}</p>
      )}
    </section>
  );
}
