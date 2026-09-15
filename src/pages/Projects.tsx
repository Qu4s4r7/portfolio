import { Link } from "react-router-dom";
import { projects } from "../data/projects";

export default function Projects() {
  return (
    <section className="content-page">
      <div className="page-header">
        <span className="page-number">02</span>

        <div>
          <p className="page-kicker">
            SELECTED WORK
          </p>

          <h1>Projects</h1>
        </div>
      </div>

      <div className="items-grid">
        {projects.map((project) => (
          <Link
            key={project.id}
            to={`/projects/${project.id}`}
            className="item-card"
          >
            <div className="item-card-top">
              <span>PROJECT</span>
              <span>{project.id}</span>
            </div>

            <h2>{project.title}</h2>

            <p>{project.description}</p>

            <div className="item-tags">
              {project.technologies.map((technology) => (
                <span key={technology}>
                  {technology}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}