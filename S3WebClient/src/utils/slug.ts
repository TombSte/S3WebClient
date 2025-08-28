export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function envKeyFromName(name: string): string {
  const s = name.trim().toLowerCase();
  if (["dev", "development"].includes(s)) return "dev";
  if (["test", "testing", "qa"].includes(s)) return "test";
  if (["pre production", "pre-production", "preprod", "staging"].includes(s)) return "preprod";
  if (["prod", "production", "live"].includes(s)) return "prod";
  return slugify(name);
}
