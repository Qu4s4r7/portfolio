import type { Project } from "../types";

export const projects: Project[] = [
  {
    id: "burger",
    title: "Sky Light",
    description:
      "Tienda tecnológica desarrollada con React y TypeScript.",
    image:
      `${import.meta.env.BASE_URL}images/projects/sky-light.webp`,
    technologies: [
      "React",
      "TypeScript",
      "CSS",
      "MySQL"
    ],
    github:
      "https://github.com/",
    demo: "#"
  },
  {
    id: "portfolio-os",
    title: "Portfolio",
    description:
      "Mi espacio personal para proyectos, máquinas y documentación.",
    image:
      `${import.meta.env.BASE_URL}images/projects/portfolio.webp`,
    technologies: [
      "React",
      "TypeScript",
      "Vite",
      "Markdown"
    ],
    github:
      "https://github.com/",
    demo: "#"
  }
];