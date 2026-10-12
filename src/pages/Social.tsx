export default function Social() {
  return (
    <section className="content-page">
      <div className="page-header">
        <span className="page-number">05</span>

        <div>
          <p className="page-kicker">
            CONNECT
          </p>

          <h1>
            <span className="material-symbols-outlined">group</span>
            Social
          </h1>
        </div>
      </div>

      <div className="social-list">
        <a
          href="https://github.com/Qu4s4r7"
          target="_blank"
          rel="noreferrer"
        >
          <span>GitHub</span>
          <span>↗</span>
        </a>

        <a
          href="https://app.hackthebox.com/profile/1012903"
          target="_blank"
          rel="noreferrer"
        >
          <span>Hack The Box</span>
          <span>↗</span>
        </a>
      </div>
    </section>
  );
}