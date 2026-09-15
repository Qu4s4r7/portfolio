import { BrowserRouter, Routes, Route } from "react-router-dom";

import TopBar from "./components/TopBar";

import Home from "./pages/Home";
import About from "./pages/About";
import Machines from "./pages/Machines";
import MachineWriteup from "./pages/MachineWriteup";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import Notes from "./pages/Notes";
import NoteDetails from "./pages/NoteDetails";
import Social from "./pages/Social";

export default function App() {
  return (
    <BrowserRouter basename="/portfolio">
      <div className="app">
        <TopBar />

        <main className="page-container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/machines" element={<Machines />} />
            <Route path="/machines/:id" element={<MachineWriteup />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetails />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/notes/:id" element={<NoteDetails />} />
            <Route path="/social" element={<Social />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}