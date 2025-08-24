export function getAvailableName(original: string, existing: Set<string>): string {
  if (!existing.has(original)) return original;
  const dot = original.lastIndexOf(".");
  const base = dot === -1 ? original : original.slice(0, dot);
  const ext = dot === -1 ? "" : original.slice(dot);
  let i = 1;
  let name = `${base} (${i})${ext}`;
  while (existing.has(name)) {
    i++;
    name = `${base} (${i})${ext}`;
  }
  return name;
}
