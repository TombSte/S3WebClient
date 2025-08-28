export type EnvColor =
  | "default"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning";

export interface Environment {
  id?: number;
  key: string; // stable key used in records and filters
  name: string; // display name
  color: EnvColor; // Fallback MUI Chip color
  colorHex?: string; // Optional custom hex color for chip styling
  hidden: number; // 1 = hidden, 0 = visible
  order: number; // ordering for lists
  builtIn: number; // 1 = default seeded env, 0 = user added
}
