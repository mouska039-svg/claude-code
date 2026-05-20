export type ImportSource = "itiaki" | "jupiterre" | "maddie" | "csv";

export interface ParsedClient {
  full_name: string;
  email: string | null;
  phone: string | null;
  birth_date: string | null;
  primary_concern: string | null;
}

export interface ImportResult {
  inserted: number;
  skipped: number;
  errors: string[];
}
