import { Link, useLocation } from "react-router-dom";

const items = [
  {
    label: "Home",
    path: "/",
    icon: "⌂",
  },
  {
    label: "About",
    path: "/about",
    icon: "◎",
  },
  {
    label: "Machines",
    path: "/machines",
    icon: "⌘",
  },
  {
    label: "Projects",
    path: "/projects",
    icon: "▣",
  },
  {
    label: "Notes",
    path: "/notes",
    icon: "▤",
  },
  {
    label: "Social",
    path: "/social",
    icon: "◌",
  },
];

export default function Dock() {
  const location = useLocation();

  return (
    <div className="dock">
      {items.map((item) => {
        const active =
          item.path === "/"
            ? location.pathname === "/"
            : location.pathname.startsWith(item.path);

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`dock-item ${
              active ? "active" : ""
            }`}
            title={item.label}
          >
            <span className="dock-icon">
              {item.icon}
            </span>

            <span className="dock-label">
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}