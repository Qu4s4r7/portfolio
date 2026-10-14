import config from "../config.json"

export default function About() {
  return (
    <section className="content-page">
      <div className="page-header">
        <p className="page-kicker">INFORMATION</p>
        <span className="page-number">01</span>
      </div>
      <div className="page-title">
        <span className="material-symbols-outlined">person</span>
        <h1>About me</h1>
      </div>

      <div className="about-content">
        <p className="lead">
          {config.hero.greeting}
        </p>

        <p>
          {config.hero.description}
        </p>

        <p>
          {config.hero.footerNote}
        </p>
      </div>
    </section>
  );
}
