import config from "../config.json";

export default function Social() {
  return (
    <section className="content-page">
      <div className="page-header">
        <p className="page-kicker">CONNECT</p>
        <span className="page-number">05</span>
      </div>
      <div className="page-title">
        <span className="material-symbols-outlined">group</span>
        <h1>Social</h1>
      </div>

      <div className="social-list">
        {config.socials.map((social, index) => (
          <a
            key={index}
            href={social.url}
            target="_blank"
            rel="noreferrer"
          >
            <span>{social.name}</span>
            <span>↗</span>
          </a>
        ))}
      </div>
    </section>
  );
}
