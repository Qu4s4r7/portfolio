const filesMap: Record<string, Record<string, string>> = {
  machines: import.meta.glob("../content/machines/*.md", {
    query: "?raw",
    import: "default",
    eager: true,
  }) as Record<string, string>,

  projects: import.meta.glob("../content/projects/*.md", {
    query: "?raw",
    import: "default",
    eager: true,
  }) as Record<string, string>,

  notes: import.meta.glob("../content/notes/*.md", {
    query: "?raw",
    import: "default",
    eager: true,
  }) as Record<string, string>,
};

export function getMarkdownContent(section: string, id?: string): string {
  if (!id) return "";
  const files = filesMap[section] || {};
  return files[`../content/${section}/${id}.md`] || "";
}
