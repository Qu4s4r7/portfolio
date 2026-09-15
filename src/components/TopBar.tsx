import { Link, useLocation } from "react-router-dom";

export default function TopBar() {
  const location = useLocation();

  const links = [
    { label: "About", path: "/about" },
    { label: "Machines", path: "/machines" },
    { label: "Projects", path: "/projects" },
    { label: "Notes", path: "/notes" },
    { label: "Social", path: "/social" },
  ];

  return (
    <header className="topbar">
      <Link to="/" className="topbar-logo">
        CM
      </Link>

      <nav className="topbar-nav">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={
              location.pathname.startsWith(link.path)
                ? "active"
                : ""
            }
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="topbar-status">
        <span className="status-dot" />
        ONLINE
      </div>
    </header>
  );
}