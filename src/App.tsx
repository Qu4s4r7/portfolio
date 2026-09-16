import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect } from "react";

import TopBar from "./components/TopBar";

import Home from "./pages/Home";
import About from "./pages/About";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import Machines from "./pages/Machines";
import MachineWriteup from "./pages/MachineWriteup";
import Notes from "./pages/Notes";
import NoteDetails from "./pages/NoteDetails";
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
            <Route path="/projects/:id" element={<ProjectDetails />} />

            <Route path="/machines" element={<Machines />} />
            <Route path="/machines/:id" element={<MachineWriteup />} />

            <Route path="/notes" element={<Notes />} />
            <Route path="/notes/:id" element={<NoteDetails />} />

            <Route path="/social" element={<Social />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}