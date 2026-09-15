import type { Machine } from "../types";

export const machines: Machine[] = [
  {
    id: "orion",
    title: "Orion",
    platform: "Hack The Box",
    difficulty: "Medium",
    os: "Linux",
    image: `${import.meta.env.BASE_URL}images/machines/orion.webp`,
    date: "2026",
    tags: [
      "Linux",
      "Web",
      "Enumeration",
      "Privilege Escalation"
    ]
  },
  {
    id: "example",
    title: "Example",
    platform: "Hack The Box",
    difficulty: "Easy",
    os: "Linux",
    image: `${import.meta.env.BASE_URL}images/machines/example.webp`,
    date: "2026",
    tags: [
      "Linux",
      "Web"
    ]
  }
];