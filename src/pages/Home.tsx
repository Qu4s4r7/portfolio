import config from "../config.json";

export default function Home() {
  return (
    <section className="home-page">
      <div className="grid-background" />

      <div className="home-content">
        <span className="home-number">
          001
        </span>

        <p className="home-label">
          PERSONAL PORTFOLIO
        </p>

        <h1>
          {config.profile.name}
          <br />
          <span>{config.profile.lastname}</span>
        </h1>

        <p className="home-description">
          {config.profile.description}
        </p>

        <div className="home-meta">
          <span>{config.profile.location}</span>

          <span className="home-meta-line" />

          <span>{config.profile.date}</span>
        </div>
      </div>
    </section>
  );
}
