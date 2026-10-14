import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect } from "react";

import config from "./config.json";
import TopBar from "./components/TopBar";
import { machines } from "./data/machines";
import { projects } from "./data/projects";
import { notes } from "./data/notes";

import Home from "./pages/Home";
import About from "./pages/About";
import Details from "./pages/Details";
import Projects from "./pages/Projects";
import Machines from "./pages/Machines";
import Notes from "./pages/Notes";
import Social from "./pages/Social";



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
  return (
    <BrowserRouter basename="/portfolio">
      <RedirectHandler />

      <div className="app">
        <TopBar />

        <main className="page-container">
          <Routes>
            <Route path="/" element={<Home />} />

            <Route path="/about" element={<About />} />

            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<Details data={projects} name="projects"/>} />

            <Route path="/machines" element={<Machines />} />
            <Route path="/machines/:id" element={<Details data={machines} name="machines"/>} />

            <Route path="/notes" element={<Notes />} />
            <Route path="/notes/:id" element={<Details data={notes} name="notes"/>} />

            <Route path="/social" element={<Social />} />
          </Routes>
        </main>
      </div>
      <footer>
        © {config.profile.date} {config.profile.handle}. Todos los derechos reservados
      </footer>
    </BrowserRouter>
  );
}
