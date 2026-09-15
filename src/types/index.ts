export type Difficulty =
  | "Easy"
  | "Medium"
  | "Hard";

export interface Machine {
  id: string;
  title: string;
  platform: string;
  difficulty: Difficulty;
  os: string;
  image: string;
  date: string;
  tags: string[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  technologies: string[];
  github: string;
  demo?: string;
}

export interface DockItem {
  id: string;
  label: string;
  icon: string;
  path: string;
}