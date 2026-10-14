export interface Config {
  profile: {
    name: string;
    lastname: string;
    handle: string;
    description: string;
    location: string;
    avatar: string;
    date: string;
  };
  hero: {
    greeting: string;
    description: string;
    footerNote: string;
  };
  socials: Array<{
    name: string;
    url: string;
    display: string;
  }>;
  theme: {
    bg: string;
    surface: string;
    text: string;
    accent: string;
    accentSoft: string;
  };
}

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
export interface Note {
  id: string;
  title: string;
  description: string;
}
