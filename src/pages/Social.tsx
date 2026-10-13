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