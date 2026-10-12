import type { Machine } from "../types";

export const machines: Machine[] = [
  {
    id: "orion",
    title: "Orion",
    platform: "Hack The Box",
    difficulty: "Easy",
    os: "Linux",
    image: "https://cdn.services-k8s.prod.aws.htb.systems/content/machines/avatar/a217731f-ce7c-4015-ba0f-d68c7f6f7215-1782215994.png",
    date: "10/08/2026",
    tags: [
      "CraftCMS",
      "Ngix",
      "MySQL",
      "Metasploit",
      "SSH",
      "Telnet",
      "CVE-2025-32432",
      "CVE-2025-32432"
    ]
  },
  {
    id: "fireflow",
    title: "Fireflow",
    platform: "Hack The Box",
    difficulty: "Medium",
    os: "Linux",
    image: "https://cdn.services-k8s.prod.aws.htb.systems/content/machines/avatar/a217757a-39c0-4cac-9eb8-33f7ee9c9f9b-1782216388.png",
    date: "10/08/2026",
    tags: [
      "Kubernetes",
      "Node Exporter",
      "RCE",
      "Python",
      "HostPath",
      "Privilege Escalation",
      "CVE-2026-33017"
    ]
  },
];