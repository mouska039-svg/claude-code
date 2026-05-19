export type { Database } from "./supabase";

// ----------------------------------------------------------------
// Plan & specialty enums
// ----------------------------------------------------------------
export type PlanType = "free" | "cabinet" | "cabinet_plus";

export type SpecialtyType = "naturopathe" | "sophrologue" | "hypnotherapeute" | "multi";

// ----------------------------------------------------------------
// Protocol / session statuses
// ----------------------------------------------------------------
export type ProtocolStatus = "draft" | "active" | "completed";

export type SessionType = "presentiel" | "visio";

// ----------------------------------------------------------------
// Invoice status
// ----------------------------------------------------------------
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

// ----------------------------------------------------------------
// Company program types
// ----------------------------------------------------------------
export type CompanyProgramFormat = "workshop" | "individual_session" | "subscription";

export type CompanyProgramStatus =
  | "draft"
  | "proposal"
  | "signed"
  | "in_progress"
  | "completed";

// ----------------------------------------------------------------
// Quota types
// ----------------------------------------------------------------
export type QuotaType = "protocols" | "audios" | "company_programs" | "clients";

export type QuotaResult = {
  allowed: boolean;
  remaining: number;
  limit: number | null;
  plan: PlanType;
};
