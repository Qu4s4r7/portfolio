import type { Project } from "../types";

export const projects: Project[] = [
  {
    id: "sky-gallery",
    title: "Sky Gallery",
    description:
      "App de fotos desarrollada con React y TypeScript.",
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
];