import { useNavigate } from "react-router-dom";

import type { Project } from "../types";

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({
  project
}: ProjectCardProps) {
  const navigate =
    useNavigate();

  return (
    <article
      className="project-card"
      onClick={() =>
        navigate(
          `/projects/${project.id}`
        )
      }
    >
      <div className="project-card-image">
        <img
          src={project.image}
          alt={project.title}
        />

        <span className="card-open">
          OPEN →
        </span>
      </div>

      <div className="project-card-body">
        <h2>
          {project.title}
        </h2>

        <p>
          {project.description}
        </p>

        <div className="tag-list">
          {project.technologies.map(
            (technology) => (
              <span
                className="tag"
                key={technology}
              >
                {technology}
              </span>
            )
          )}
        </div>
      </div>
    </article>
  );
}