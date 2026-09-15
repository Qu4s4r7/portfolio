import { useNavigate } from "react-router-dom";

import type { Machine } from "../types";

interface MachineCardProps {
  machine: Machine;
}

export default function MachineCard({
  machine
}: MachineCardProps) {
  const navigate =
    useNavigate();

  return (
    <article
      className="machine-card"
      onClick={() =>
        navigate(
          `/machines/${machine.id}`
        )
      }
    >
      <div className="machine-card-image">
        <img
          src={machine.image}
          alt={machine.title}
        />

        <span className="card-index">
          #{machine.id}
        </span>

        <span className="card-open">
          OPEN →
        </span>
      </div>

      <div className="machine-card-body">
        <div className="card-title-row">
          <h2>
            {machine.title}
          </h2>

          <span
            className={`difficulty ${machine.difficulty.toLowerCase()}`}
          >
            {machine.difficulty}
          </span>
        </div>

        <p className="card-platform">
          {machine.platform}
        </p>

        <div className="tag-list">
          {machine.tags.map(
            (tag) => (
              <span
                className="tag"
                key={tag}
              >
                {tag}
              </span>
            )
          )}
        </div>
      </div>
    </article>
  );
}