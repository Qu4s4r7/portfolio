import type { Machine } from "../types";

export const machines: Machine[] = [
  {
    id: "fireflow",
    title: "Fireflow",
    platform: "Hack The Box",
    difficulty: "Medium",
    os: "Linux",
    image: "https://cdn.services-k8s.prod.aws.htb.systems/content/machines/avatar/a217757a-39c0-4cac-9eb8-33f7ee9c9f9b-1782216388.png",
    date: "12/10/2026",
    tags: [
      "Kubernetes",
      "Node Exporter",
      "RCE",
      "HostPath",
      "CVE-2026-33017"
    ]
  },
  /*{
    id: "touch",
    title: "Touch",
    platform: "Hack The Box",
    difficulty: "Easy",
    os: "Windows",
    image: "https://cdn.services-k8s.prod.aws.htb.systems/content/machines/avatar/a2cc2bba-5e0b-41f2-842e-2f3d3cee8d22-1789977906.png",
    date: "10/10/2026",
    tags: [
      "Nexion DeviceHub",
      "RDP",
      "WinRM",
      "Metasploit",
      "MySQL",
      "MySQL UDF",
      "Telnet",
      "CVE-2026-24061"
    ]
  },*/
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
      "MySQL",
      "Metasploit",
      "Telnet",
      "CVE-2025-32432",
      "CVE-2025-24061"
    ]
  },
];
