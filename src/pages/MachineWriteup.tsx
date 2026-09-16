import { useParams, Link } from "react-router-dom";

import MarkdownRenderer from "../components/MarkdownRenderer";
import { machines } from "../data/machines";

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

  const machine =
    machines.find((machine) => machine.id === id);

  if (!content || !machine) {
    return (
      <section className="content-page">
        <Link to="/machines" className="back-link">
          ← Back to machines
        </Link>

        <h1>Machine not found</h1>
      </section>
    );
  }

  const imageSrc = machine.image.startsWith("/")
    ? `${import.meta.env.BASE_URL}${machine.image.slice(1)}`
    : machine.image;

  return (
    <section className="markdown-page">
      <Link to="/machines" className="back-link">
        ← Back to machines
      </Link>

      <div className="header">
        <img
          src={imageSrc}
          alt={machine.title}
          className="header-cover"
        />
      </div>

      <MarkdownRenderer content={content} />
    </section>
  );
}