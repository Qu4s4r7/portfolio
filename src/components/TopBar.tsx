import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

export default function TopBar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { label: "About", path: "/about" },
    { label: "Machines", path: "/machines" },
    { label: "Projects", path: "/projects" },
    { label: "Notes", path: "/notes" },
    { label: "Social", path: "/social" },
  ];

  const isActive = (path: string) =>
    location.pathname === path ||
    location.pathname.startsWith(`${path}/`);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <>
      <header className="topbar">
        <Link to="/" className="topbar-logo" onClick={closeMenu}>
          CM
        </Link>

        <nav className="topbar-nav">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={isActive(link.path) ? "active" : ""}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="topbar-status">
          <span className="status-dot" />
          ONLINE
        </div>

        <button
          className={`menu-button ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Abrir menú"
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      <div
        className={`mobile-menu ${menuOpen ? "open" : ""}`}
        aria-hidden={!menuOpen}
      >
        <nav className="mobile-menu-nav">
          {links.map((link, index) => (
            <Link
              key={link.path}
              to={link.path}
              className={isActive(link.path) ? "active" : ""}
              onClick={closeMenu}
            >
              <span className="mobile-menu-number">
                0{index + 1}
              </span>

              <span>{link.label}</span>

              <span className="mobile-menu-arrow">→</span>
            </Link>
          ))}
        </nav>

        <div className="mobile-menu-footer">
          <span>
            <span className="status-dot" />
            ONLINE
          </span>

          <span>CM / PORTFOLIO</span>
        </div>
      </div>

      {menuOpen && (
        <button
          className="menu-overlay"
          onClick={closeMenu}
          aria-label="Cerrar menú"
        />
      )}
    </>
  );
}