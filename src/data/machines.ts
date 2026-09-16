import type { Machine } from "../types";

export const machines: Machine[] = [
  {
    id: "orion",
    title: "Orion",
    platform: "Hack The Box",
    difficulty: "Easy",
    os: "Linux",
    image: "https://cdn.services-k8s.prod.aws.htb.systems/content/machines/avatar/a217731f-ce7c-4015-ba0f-d68c7f6f7215-1782215994.png",
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