import { Link } from "react-router-dom";
import { machines } from "../data/machines";

export default function Machines() {
  return (
    <section className="content-page">
      <div className="page-header">
        <p className="page-kicker">LAB / WRITEUPS</p>
        <span className="page-number">03</span>
      </div>
      <div className="page-title">
        <span className="material-symbols-outlined">deployed_code</span>
        <h1>Machines</h1>
      </div>
      

      <div className="items-grid">
        {machines.map((machine) => (
          <Link
            key={machine.id}
            to={`/machines/${machine.id}`}
            className="item-card"
          >
            <div className="item-card-top">
              <span>{machine.platform}</span>
              <span>{machine.date}</span>
            </div>

            <img className="item-image" src={machine.image} />

            <h2>{machine.title}</h2>

            <p>
              {machine.os} · {machine.difficulty}
            </p>

            <div className="item-tags">
              {machine.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}