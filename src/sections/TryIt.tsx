import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Reveal } from "../lib/reveal";
import { supabase, ROUTING, type EventRow, type Stage } from "../lib/db";

const ISSUES = [
  { id: "Pothole", label: "Pothole", emoji: "🕳️" },
  { id: "Garbage dump", label: "Garbage dump", emoji: "🗑️" },
  { id: "Dead streetlight", label: "Dead streetlight", emoji: "💡" },
];

type UiState =
  | { stage: "pick" }
  | { stage: "photo"; ticket: string; issue: string; photoTaken: boolean }
  | { stage: "routed"; ticket: string; issue: string }
  | { stage: "sla"; ticket: string; issue: string; breached: boolean }
  | { stage: "geoverify"; ticket: string; issue: string }
  | { stage: "confirm"; ticket: string; issue: string; reopenedOnce: boolean }
  | { stage: "closed"; ticket: string; issue: string };

type BadgeState = { text: string; tone: "yellow" | "blue" | "red" | "green" };

const BADGE: Record<string, BadgeState> = {
  filed: { text: "🟡 In Progress", tone: "yellow" },
  routed: { text: "🟡 In Progress", tone: "yellow" },
  escalated: { text: "🔴 SLA Breached", tone: "red" },
  reopened: { text: "🔴 Reopened", tone: "red" },
  fix_submitted: { text: "🔵 Awaiting Verification", tone: "blue" },
  verified: { text: "🔵 Awaiting Verification", tone: "blue" },
  closed: { text: "🟢 Verified & Closed", tone: "green" },
};

const PotholeSVG = ({ after = false }: { after?: boolean }) => (
  <svg viewBox="0 0 220 110" className="block w-full" aria-hidden="true">
    <rect width="220" height="110" fill={after ? "#2f3640" : "#3a3f47"} />
    <rect x="0" y="52" width="30" height="6" rx="2" fill="#e8e4da" opacity="0.85" />
    <rect x="48" y="52" width="30" height="6" rx="2" fill="#e8e4da" opacity="0.85" />
    <rect x="96" y="52" width="30" height="6" rx="2" fill="#e8e4da" opacity="0.35" />
    <rect x="144" y="52" width="30" height="6" rx="2" fill="#e8e4da" opacity="0.85" />
    <rect x="192" y="52" width="28" height="6" rx="2" fill="#e8e4da" opacity="0.85" />
    {!after && (
      <>
        <path d="M78 46c10-7 34-8 46-2 9 5 10 16 2 22-11 8-37 8-48 1-8-5-8-15 0-21z" fill="#23272e" />
        <path d="M88 52c7-4 22-4 29-1 5 3 5 9 0 12-7 4-23 4-29 0-4-3-4-8 0-11z" fill="#15181d" />
      </>
    )}
    {after && (
      <>
        <rect x="70" y="40" width="80" height="26" rx="4" fill="#4a5460" />
        <rect x="76" y="46" width="68" height="14" rx="3" fill="#5a6572" />
        <path d="M78 44l12 8m14-10l12 8m14-10l12 8" stroke="#e8e4da" strokeWidth="2" opacity="0.5" />
      </>
    )}
  </svg>
);

const GarbageSVG = ({ after = false }: { after?: boolean }) => (
  <svg viewBox="0 0 220 110" className="block w-full" aria-hidden="true">
    <rect width="220" height="110" fill={after ? "#2f3640" : "#3a3f47"} />
    {!after ? (
      <g>
        <ellipse cx="110" cy="72" rx="52" ry="16" fill="#23272e" />
        <circle cx="86" cy="60" r="9" fill="#2c3138" />
        <circle cx="112" cy="54" r="11" fill="#343a43" />
        <circle cx="136" cy="62" r="8" fill="#2c3138" />
        <path d="M96 44l6 10m18-12l4 10" stroke="#4a5460" strokeWidth="2.5" />
      </g>
    ) : (
      <g>
        <rect x="86" y="52" width="48" height="26" rx="3" fill="#4a5460" />
        <rect x="92" y="58" width="36" height="14" rx="2" fill="#5a6572" />
        <path d="M104 58v-8h12v8" stroke="#e8e4da" strokeWidth="2" fill="none" />
      </g>
    )}
  </svg>
);

const LightSVG = ({ after = false }: { after?: boolean }) => (
  <svg viewBox="0 0 220 110" className="block w-full" aria-hidden="true">
    <rect width="220" height="110" fill={after ? "#2f3640" : "#3a3f47"} />
    <rect x="104" y="18" width="6" height="52" fill="#23272e" />
    <path d="M84 70h46" stroke="#23272e" strokeWidth="6" strokeLinecap="round" />
    {!after && <circle cx="107" cy="74" r="8" fill="#1a1d22" />}
    {after && (
      <>
        <circle cx="107" cy="74" r="8" fill="#f5d76e" />
        <circle cx="107" cy="74" r="14" fill="#f5d76e" opacity="0.25" />
        <circle cx="107" cy="74" r="20" fill="#f5d76e" opacity="0.1" />
      </>
    )}
  </svg>
);

const ISSUE_SVG: Record<string, (p: { after?: boolean }) => JSX.Element> = {
  Pothole: PotholeSVG,
  "Garbage dump": GarbageSVG,
  "Dead streetlight": LightSVG,
};

const STEP_LABELS: Record<Stage, string> = {
  pick: "REPORT — tap the issue you see",
  photo: "REPORT — take the photo, then submit",
  routed: "ROUTED — SLA clock is running",
  sla: "SLA CHECK — what happens when the dept misses",
  geoverify: "GEO-VERIFY — the fix can't be faked",
  confirm: "CITIZEN CONFIRM — your street, your call",
  closed: "LEDGER — hash-chained, publicly auditable",
};

export default function TryIt() {
  const reduce = useReducedMotion();
  const [ui, setUi] = useState<UiState>({ stage: "pick" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [slaLeft, setSlaLeft] = useState(72 * 3600);

  // SLA countdown ticks while in the routed state (deadline is real, from the DB).
  useEffect(() => {
    if (ui.stage !== "routed") return;
    const id = setInterval(() => setSlaLeft((s) => Math.max(s - 1, 0)), 1000);
    return () => clearInterval(id);
  }, [ui.stage]);

  const go = (s: UiState) => {
    setErr(null);
    setUi(s);
  };

  const ticket = "ticket" in ui ? ui.ticket : "";
  const issue = "issue" in ui ? ui.issue : "Pothole";
  const Photo = ISSUE_SVG[issue] ?? PotholeSVG;

  const fileReport = async (issueId: string) => {
    setBusy(true);
    const { data: rep, error } = await supabase
      .from("reports")
      .insert({
        issue_type: issueId,
        dept: ROUTING[issueId].dept,
        location: "MG Road, 2nd Cross",
        sla_hours: ROUTING[issueId].slaHours,
        status: "filed",
      })
      .select()
      .single();
    if (error || !rep) {
      setErr(error?.message ?? "Could not file report");
      setBusy(false);
      return;
    }
    await supabase.from("events").insert({
      report_id: rep.id,
      kind: "reported",
      detail: `Geo-tagged photo filed by citizen · 📍 ${rep.location}`,
    });
    setBusy(false);
    go({ stage: "photo", ticket: rep.ticket, issue: issueId, photoTaken: false });
  };

  const routeReport = async () => {
    if (ui.stage !== "photo") return;
    setBusy(true);
    const deadline = new Date(Date.now() + ROUTING[issue].slaHours * 3600e3).toISOString();
    const { data: rep } = await supabase
      .from("reports")
      .update({ status: "routed", routed_at: new Date().toISOString(), sla_deadline: deadline })
      .eq("ticket", ui.ticket)
      .select()
      .single();
    if (rep) {
      await supabase.from("events").insert({
        report_id: rep.id,
        kind: "routed",
        detail: `Auto-routed to ${rep.dept} · SLA ${rep.sla_hours}h deadline attached`,
      });
    }
    setSlaLeft(ROUTING[issue].slaHours * 3600);
    setBusy(false);
    go({ stage: "routed", ticket: ui.ticket, issue });
  };

  const fastForward = async () => {
    if (ui.stage !== "routed") return;
    setBusy(true);
    const { data: rep } = await supabase
      .from("reports")
      .update({ status: "escalated", escalation_count: 1 })
      .eq("ticket", ui.ticket)
      .select()
      .single();
    if (rep) {
      await supabase.from("events").insert({
        report_id: rep.id,
        kind: "escalated",
        detail: `SLA breached — escalated to Zonal Head, re-flagged to ${rep.dept}`,
      });
    }
    setBusy(false);
    go({ stage: "sla", ticket: ui.ticket, issue, breached: true });
  };

  const submitFix = async () => {
    if (ui.stage !== "sla") return;
    setBusy(true);
    const { data: rep } = await supabase
      .from("reports")
      .update({ status: "fix_submitted", fix_submitted_at: new Date().toISOString() })
      .eq("ticket", ui.ticket)
      .select()
      .single();
    if (rep) {
      await supabase.from("events").insert({
        report_id: rep.id,
        kind: "fix_submitted",
        detail: "Fix photo uploaded — geo-hash match confirmed at same spot",
      });
    }
    setBusy(false);
    go({ stage: "geoverify", ticket: ui.ticket, issue });
  };

  const confirmFix = async () => {
    if (ui.stage !== "confirm") return;
    setBusy(true);
    const { data: rep } = await supabase
      .from("reports")
      .update({ status: "closed", citizen_confirmed: true, closed_at: new Date().toISOString() })
      .eq("ticket", ui.ticket)
      .select()
      .single();
    if (rep) {
      await supabase.from("events").insert({ report_id: rep.id, kind: "verified", detail: "Citizen signed off in public — fix confirmed" });
      await supabase.from("events").insert({ report_id: rep.id, kind: "closed", detail: "Ticket closed — published to public ledger" });
      const { data: evs } = await supabase.from("events").select("*").eq("report_id", rep.id).order("created_at", { ascending: true });
      setEvents(evs ?? []);
    }
    setBusy(false);
    go({ stage: "closed", ticket: ui.ticket, issue });
  };

  const rejectFix = async () => {
    if (ui.stage !== "confirm") return;
    setBusy(true);
    const { data: rep } = await supabase
      .from("reports")
      .update({ status: "reopened", citizen_confirmed: false, escalation_count: 2 })
      .eq("ticket", ui.ticket)
      .select()
      .single();
    if (rep) {
      await supabase.from("events").insert({ report_id: rep.id, kind: "reopened", detail: "Citizen rejected the fix — ticket reopened, department re-flagged" });
    }
    setBusy(false);
    go({ stage: "confirm", ticket: ui.ticket, issue, reopenedOnce: true });
  };

  const hhmmss = (s: number) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return `${h}h ${String(m).padStart(2, "0")}m ${String(sec).padStart(2, "0")}s`;
  };

  const badge: BadgeState =
    ui.stage === "sla" && ui.breached
      ? BADGE.escalated
      : ui.stage === "geoverify"
        ? BADGE.fix_submitted
        : ui.stage === "closed"
          ? BADGE.closed
          : BADGE.filed;

  return (
    <section id="try-it" className="scroll-mt-16 border-y border-ink/5 bg-white">
      <div className="mx-auto max-w-5xl px-5 py-16 sm:py-20">
        <Reveal>
          <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-accent-dark">Try the app — 30 seconds</p>
          <h2 className="mt-3 max-w-3xl text-[26px] font-bold tracking-tight sm:text-[34px]">
            Use it like a citizen. Every tap writes to the database.
          </h2>
        </Reveal>

        <div className="mt-10 grid items-start gap-10 lg:grid-cols-[300px_1fr] lg:gap-14">
          {/* ============ THE PHONE ============ */}
          <Reveal className="order-1">
            <div className="mx-auto w-[290px]">
              <div className="rounded-[2.6rem] border-[10px] border-ink bg-ink shadow-[0_28px_70px_-28px_rgba(16,26,40,0.5)]">
                <div className="overflow-hidden rounded-[1.9rem] bg-white">
                  {/* status bar */}
                  <div className="flex items-center justify-between bg-paper px-4 pb-1 pt-2">
                    <span className="text-[9px] font-bold text-ink/70">9:41</span>
                    <div className="h-3.5 w-14 rounded-full bg-ink" aria-hidden="true" />
                    <span className="text-[9px] font-bold text-ink/70">100%</span>
                  </div>
                  {/* app header */}
                  <div className="flex items-center justify-between border-b border-ink/5 bg-white px-4 py-2.5">
                    <span className="text-[11px] font-extrabold tracking-tight">FixLoop</span>
                    {ticket ? (
                      <span className="font-mono text-[9px] font-bold text-accent-dark">{ticket}</span>
                    ) : (
                      <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[8.5px] font-bold text-accent-dark">WARD 12</span>
                    )}
                  </div>

                  <div className="min-h-[380px] px-3.5 py-3.5">
                    <AnimatePresence mode="wait">
                      {/* ---- PICK ---- */}
                      {ui.stage === "pick" && (
                        <motion.div key="pick" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2.5">
                          <p className="px-1 text-[11px] font-bold uppercase tracking-wider text-ink/40">Report an issue</p>
                          {ISSUES.map((i) => (
                            <button
                              key={i.id}
                              disabled={busy}
                              onClick={() => fileReport(i.id)}
                              className="flex w-full items-center gap-3 rounded-xl border border-ink/10 bg-paper p-3 text-left transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md disabled:opacity-50"
                            >
                              <span className="text-[22px]">{i.emoji}</span>
                              <span>
                                <span className="block text-[13px] font-bold text-ink">{i.label}</span>
                                <span className="block text-[10.5px] text-ink/45">{busy ? "creating ticket…" : "New report"}</span>
                              </span>
                              <span className="ml-auto text-ink/25">›</span>
                            </button>
                          ))}
                        </motion.div>
                      )}

                      {/* ---- PHOTO ---- */}
                      {ui.stage === "photo" && (
                        <motion.div key="photo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2.5">
                          <div className="relative overflow-hidden rounded-xl bg-[#3a3f47]">
                            {ui.photoTaken ? (
                              <Photo />
                            ) : (
                              <div className="flex h-[110px] items-center justify-center bg-ink/90 text-[26px]">📷</div>
                            )}
                            {ui.photoTaken && (
                              <span className="absolute bottom-2 right-2 rounded-md bg-ink/70 px-1.5 py-0.5 text-[8px] font-medium text-white backdrop-blur">
                                📍 MG Road, 2nd Cross · 9:02 AM
                              </span>
                            )}
                          </div>
                          {!ui.photoTaken ? (
                            <button
                              onClick={() => go({ ...ui, stage: "photo", photoTaken: true })}
                              className="w-full rounded-xl bg-ink py-2.5 text-[12.5px] font-bold text-paper transition-colors hover:bg-ink/85"
                            >
                              📷 Take photo
                            </button>
                          ) : (
                            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-2.5">
                              <p className="rounded-lg bg-accent-soft px-3 py-2 text-[10.5px] font-semibold text-accent-dark">
                                📍 Location detected: MG Road, 2nd Cross · geo-tag attached
                              </p>
                              <button
                                disabled={busy}
                                onClick={routeReport}
                                className="w-full rounded-xl bg-accent py-2.5 text-[12.5px] font-bold text-white transition-colors hover:bg-accent-dark disabled:opacity-50"
                              >
                                {busy ? "Routing…" : "Submit report"}
                              </button>
                            </motion.div>
                          )}
                        </motion.div>
                      )}

                      {/* ---- ROUTED + SLA COUNTDOWN ---- */}
                      {ui.stage === "routed" && (
                        <motion.div key="routed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2.5">
                          <div className="rounded-xl border border-ink/10 bg-paper p-3">
                            <p className="text-[12.5px] font-bold">🧭 Routed to: {ROUTING[issue].dept}</p>
                            <p className="mt-0.5 text-[10px] text-ink/45">Ward supervisor notified · deadline written to DB</p>
                          </div>
                          <div className="rounded-xl border border-amber-300/70 bg-amber-50/70 p-3">
                            <div className="flex items-center justify-between">
                              <span className="rounded-full bg-amber-200/80 px-2 py-0.5 text-[9px] font-extrabold uppercase text-amber-800">In Progress</span>
                              <span className="font-mono text-[9px] text-amber-700/70">SLA {ROUTING[issue].slaHours}h</span>
                            </div>
                            <p className="mt-2 font-mono text-[17px] font-extrabold tabular-nums text-amber-900">
                              {hhmmss(slaLeft)}
                            </p>
                            <div className="mt-2 h-1 overflow-hidden rounded-full bg-amber-200/70">
                              <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: `${(slaLeft / (ROUTING[issue].slaHours * 3600)) * 100}%` }} />
                            </div>
                          </div>
                          <button
                            disabled={busy}
                            onClick={fastForward}
                            className="w-full rounded-xl bg-ink py-2.5 text-[12.5px] font-bold text-paper transition-colors hover:bg-ink/85 disabled:opacity-50"
                          >
                            {busy ? "…" : "⏩ Fast-forward 3 days"}
                          </button>
                        </motion.div>
                      )}

                      {/* ---- SLA BREACH ---- */}
                      {ui.stage === "sla" && ui.breached && (
                        <motion.div key="sla" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2.5">
                          <div className="rounded-xl border border-alert/30 bg-alert/5 p-3">
                            <span className="rounded-full bg-alert/15 px-2 py-0.5 text-[9px] font-extrabold uppercase text-alert">SLA Breached</span>
                            <p className="mt-1.5 text-[11.5px] font-bold text-alert">Escalated to Zonal Head</p>
                            <p className="mt-0.5 text-[10.5px] leading-snug text-ink/60">
                              The ticket escalated itself up the chain — written to the ledger, no phone calls.
                            </p>
                          </div>
                          <button
                            disabled={busy}
                            onClick={submitFix}
                            className="w-full rounded-xl bg-accent py-2.5 text-[12.5px] font-bold text-white transition-colors hover:bg-accent-dark disabled:opacity-50"
                          >
                            {busy ? "…" : "🛠️ Dept submits fix photo"}
                          </button>
                        </motion.div>
                      )}

                      {/* ---- GEO-VERIFY ---- */}
                      {ui.stage === "geoverify" && (
                        <motion.div key="geo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2.5">
                          <div className="relative overflow-hidden rounded-xl">
                            <Photo after />
                            <span className="absolute left-2 top-2 rounded-md bg-ink/70 px-1.5 py-0.5 text-[8px] font-bold text-white backdrop-blur">AFTER</span>
                          </div>
                          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="rounded-lg bg-accent-soft px-3 py-2 text-[10.5px] font-bold text-accent-dark">
                            ✅ Location match verified — geo-hash equal to the report
                          </motion.p>
                          <button
                            onClick={() => go({ stage: "confirm", ticket, issue, reopenedOnce: false })}
                            className="w-full rounded-xl bg-accent py-2.5 text-[12.5px] font-bold text-white transition-colors hover:bg-accent-dark"
                          >
                            Review the fix
                          </button>
                        </motion.div>
                      )}

                      {/* ---- CONFIRM FORK ---- */}
                      {ui.stage === "confirm" && (
                        <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2.5">
                          {ui.reopenedOnce ? (
                            <div className="rounded-xl border border-alert/30 bg-alert/5 p-3">
                              <span className="rounded-full bg-alert/15 px-2 py-0.5 text-[9px] font-extrabold uppercase text-alert">Reopened</span>
                              <p className="mt-1 text-[11px] leading-snug text-ink/65">
                                You rejected it. The ticket went back to {ROUTING[issue].dept}, re-flagged — and that rejection is permanent on the ledger.
                              </p>
                            </div>
                          ) : (
                            <p className="px-1 text-[12px] font-bold text-ink">Your street. Your call.</p>
                          )}
                          <div className="relative overflow-hidden rounded-xl">
                            <Photo after />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              disabled={busy}
                              onClick={confirmFix}
                              className="rounded-xl bg-accent py-2.5 text-[11.5px] font-bold text-white transition-colors hover:bg-accent-dark disabled:opacity-50"
                            >
                              {busy ? "…" : "✓ Confirm Fixed"}
                            </button>
                            <button
                              disabled={busy}
                              onClick={rejectFix}
                              className="rounded-xl border border-ink/15 bg-white py-2.5 text-[11.5px] font-bold text-ink transition-colors hover:border-alert/50 hover:text-alert disabled:opacity-50"
                            >
                              {busy ? "…" : "✕ Reject — Not Fixed"}
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {/* ---- LEDGER CLOSE ---- */}
                      {ui.stage === "closed" && (
                        <motion.div key="closed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                          <div className="rounded-xl border border-accent/30 bg-accent-soft/60 p-3">
                            <span className="rounded-full bg-accent px-2 py-0.5 text-[9px] font-extrabold uppercase text-white">Verified & Closed</span>
                            <p className="mt-1.5 text-[10.5px] leading-snug text-ink/65">
                              Published to the public ledger — anyone can audit this chain.
                            </p>
                          </div>
                          <div className="space-y-1">
                            {events.map((ev) => (
                              <motion.div key={ev.id} initial={reduce ? false : { opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-between gap-2 rounded-lg border border-ink/5 bg-paper px-2.5 py-1.5">
                                <div className="min-w-0">
                                  <p className="text-[10px] font-bold text-ink/80">{ev.kind}</p>
                                  <p className="truncate text-[8.5px] text-ink/40">{ev.created_at.slice(11, 19)} UTC · {ev.detail?.slice(0, 28)}</p>
                                </div>
                                <span className="shrink-0 font-mono text-[8.5px] text-accent-dark/70">{ev.hash.slice(0, 8)}</span>
                              </motion.div>
                            ))}
                          </div>
                          <button
                            onClick={() => go({ stage: "pick" })}
                            className="w-full rounded-xl border border-ink/15 bg-white py-2.5 text-[12px] font-bold text-ink transition-colors hover:border-ink/35"
                          >
                            ↻ Restart demo
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {err && (
                      <p className="mt-2 rounded-lg bg-alert/10 px-2.5 py-1.5 text-[10px] font-semibold text-alert">⚠ {err}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* ============ SIDE PANEL ============ */}
          <Reveal delay={0.1} className="order-2">
            <div className="lg:sticky lg:top-24">
              <div className="rounded-2xl border border-ink/10 bg-paper p-5">
                <div className="flex items-center justify-between">
                  <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-ink/45">Live status</p>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${
                    badge.tone === "yellow" ? "bg-amber-200/80 text-amber-800"
                    : badge.tone === "red" ? "bg-alert/15 text-alert"
                    : badge.tone === "green" ? "bg-accent text-white"
                    : "bg-ink/5 text-ink/60"
                  }`}>
                    {badge.text}
                  </span>
                </div>
                <p className="mt-3 text-[14.5px] font-bold leading-snug text-ink">{STEP_LABELS[ui.stage]}</p>
                <p className="mt-2 text-[12.5px] leading-relaxed text-ink/60">
                  {ui.stage === "pick" && "Tap an issue in the phone. A real ticket is created in Postgres before you see the next screen."}
                  {ui.stage === "photo" && "The photo and geo-tag are part of the report — no forms, no login. Submit routes it automatically."}
                  {ui.stage === "routed" && "The SLA countdown is real: the deadline is a timestamp in the database. Fast-forward to see what happens when it's missed."}
                  {ui.stage === "sla" && ui.breached && "This is the enforcement teeth. The escalation is a row in the ledger — permanent, public, attributable."}
                  {ui.stage === "geoverify" && "Closure requires a fresh geo-tagged photo at the same spot. A department can't phone this in."}
                  {ui.stage === "confirm" && ui.reopenedOnce && "Notice the ticket survived your rejection — that's the loop in FixLoop."}
                  {ui.stage === "confirm" && !ui.reopenedOnce && "Two real paths here. Try rejecting once — you can always confirm after the re-fix."}
                  {ui.stage === "closed" && "Every event above was hashed into the chain as it happened. The full trail lives in the database, not this screen."}
                </p>
              </div>
              <p className="mt-3 px-1 text-[11.5px] leading-relaxed text-ink/45">
                {busy ? "Writing to Postgres…" : "This is the actual product loop — same schema, same writes, same ledger as a live ward deployment."}
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
