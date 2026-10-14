import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import config from "./config.json";
import TopBar from "./components/TopBar";
import { machines } from "./data/machines";
import { projects } from "./data/projects";
import { notes } from "./data/notes";

import Home from "./pages/Home";
import About from "./pages/About";
import Details from "./pages/Details";
import Social from "./pages/Social";
import ContentView from "./pages/ContentView";

function RedirectHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect");

    if (redirect) {
      navigate(redirect, { replace: true });
    }
  }, [navigate]);

  return null;
}

export default function App() {
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--bg", config.theme.bg);
    root.style.setProperty("--surface", config.theme.surface);
    root.style.setProperty("--text", config.theme.text);
    root.style.setProperty("--accent", config.theme.accent);
    root.style.setProperty("--accent-soft", config.theme.accentSoft);
  }, []);

  const [showScrollTop, setShowScrollTop] = useState(false);
  useEffect(() => {
    const checkScrollPosition = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener("scroll", checkScrollPosition);
    return () => {
      window.removeEventListener("scroll", checkScrollPosition);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <BrowserRouter basename="/portfolio">
      <RedirectHandler />

      <div className="app">
        <TopBar />

        <main className="page-container">
          <Routes>
            <Route path="/" element={<Home />} />

            <Route path="/about" element={<About />} />

            <Route path="/projects" element={<ContentView kicker="SELECTED WORK" number="02" title="Projects" icon="folder" name="projects" items={projects} />} />
            <Route path="/projects/:id" element={<Details data={projects} name="projects"/>} />

            <Route path="/machines" element={<ContentView kicker="LAB / WRITEUPS" number="03" title="Machines" icon="deployed_code" name="machines" items={machines} />} />
            <Route path="/machines/:id" element={<Details data={machines} name="machines"/>} />

            <Route path="/notes" element={<ContentView kicker="KNOWLEDGE" number="04" title="Notes" icon="library_books" name="notes" items={notes} />} />
            <Route path="/notes/:id" element={<Details data={notes} name="notes"/>} />

            <Route path="/social" element={<Social />} />
          </Routes>
        </main>
        <button onClick={scrollToTop} className={`btn-scroll ${showScrollTop ? "visible" : ""}`}> ↑ </button>
      </div>
      <footer>
        © {config.profile.date} {config.profile.handle}. Todos los derechos reservados
      </footer>
    </BrowserRouter>
  );
}
