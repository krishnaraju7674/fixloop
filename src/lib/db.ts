import { createClient } from "@supabase/supabase-js";

/**
 * Single browser client for the FixLoop demo database.
 * The anon key is a publishable key — safe for the client, protected by RLS.
 */
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

/** One department owns each issue type. This is the routing table. */
export const ROUTING: Record<string, { dept: string; slaHours: number }> = {
  Pothole: { dept: "Roads Dept", slaHours: 72 },
  "Garbage dump": { dept: "Sanitation", slaHours: 48 },
  "Dead streetlight": { dept: "Electrical", slaHours: 96 },
};

export type ReportRow = {
  id: string;
  ticket: string;
  issue_type: string;
  dept: string;
  ward: string;
  location: string;
  sla_hours: number;
  status: string;
  geo_hash: string;
  reported_at: string;
  routed_at: string | null;
  sla_deadline: string | null;
  fix_submitted_at: string | null;
  closed_at: string | null;
  citizen_confirmed: boolean | null;
  escalation_count: number;
};

export type EventRow = {
  id: string;
  report_id: string;
  kind: string;
  detail: string | null;
  hash: string;
  created_at: string;
};

export type Stage = "pick" | "photo" | "routed" | "sla" | "geoverify" | "confirm" | "closed";
