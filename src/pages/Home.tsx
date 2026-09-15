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
          Cristian
          <br />
          <span>Machado.</span>
        </h1>

        <p className="home-description">
          Systems Engineering student,
          developer and technology enthusiast.
        </p>

        <div className="home-meta">
          <span>COLOMBIA</span>

          <span className="home-meta-line" />

          <span>2026</span>
        </div>
      </div>
    </section>
  );
}