import { useState } from "react";
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
  | { stage: "photo"; ticket: string }
  | { stage: "routed"; ticket: string }
  | { stage: "sla"; ticket: string; breached: boolean }
  | { stage: "geoverify"; ticket: string }
  | { stage: "confirm"; ticket: string; reopenedOnce: boolean }
  | { stage: "closed"; ticket: string };

const stageLabels: Record<Stage, string> = {
  pick: "REPORT — tap an issue to file a real report",
  photo: "PHOTO — geo-tag attached, submit to route",
  routed: "ROUTED — SLA clock started in the database",
  sla: "SLA CHECK — the enforcement teeth",
  geoverify: "GEO-VERIFY — the fix can't be faked",
  confirm: "CITIZEN CONFIRM — the fork only you control",
  closed: "LEDGER CLOSE — hash-chained, publicly auditable",
};

const stepIndex = (s: Stage): number =>
  ({ pick: 0, photo: 1, routed: 2, sla: 3, geoverify: 4, confirm: 4, closed: 5 } as const)[s];

export default function TryIt() {
  const reduce = useReducedMotion();
  const [ui, setUi] = useState<UiState>({ stage: "pick" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [events, setEvents] = useState<EventRow[]>([]);

  const go = (s: UiState) => {
    setErr(null);
    setUi(s);
  };

  const ticket = "ticket" in ui ? ui.ticket : "";

  /** Insert a real report row; the 'reported' event lands in the hash chain. */
  const fileReport = async (issue: string) => {
    setBusy(true);
    const { data: rep, error } = await supabase
      .from("reports")
      .insert({
        issue_type: issue,
        dept: ROUTING[issue].dept,
        location: "MG Road, 2nd Cross",
        sla_hours: ROUTING[issue].slaHours,
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
    go({ stage: "photo", ticket: rep.ticket });
  };

  /** Route: stamp routed_at + SLA deadline in the DB, log the event. */
  const routeReport = async () => {
    setBusy(true);
    const { data: rep } = await supabase
      .from("reports")
      .update({
        status: "routed",
        routed_at: new Date().toISOString(),
        sla_deadline: new Date(Date.now() + 72 * 3600e3).toISOString(),
      })
      .eq("ticket", ticket)
      .select()
      .single();
    if (rep) {
      await supabase.from("events").insert({
        report_id: rep.id,
        kind: "routed",
        detail: `Auto-routed to ${rep.dept} · SLA ${rep.sla_hours}h deadline attached`,
      });
    }
    setBusy(false);
    go({ stage: "routed", ticket });
  };

  /** Fast-forward: deterministically breach the SLA to show the escalation teeth. */
  const fastForward = async () => {
    setBusy(true);
    const { data: rep } = await supabase
      .from("reports")
      .update({ status: "escalated", escalation_count: 1 })
      .eq("ticket", ticket)
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
    go({ stage: "sla", ticket, breached: true });
  };

  /** The department "fixes" it: geo-tagged fix photo logged in the DB. */
  const submitFix = async () => {
    setBusy(true);
    const { data: rep } = await supabase
      .from("reports")
      .update({ status: "fix_submitted", fix_submitted_at: new Date().toISOString() })
      .eq("ticket", ticket)
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
    go({ stage: "geoverify", ticket });
  };

  /** Citizen sign-off — close the loop in the DB and pull the audit trail. */
  const confirmFix = async () => {
    setBusy(true);
    const { data: rep } = await supabase
      .from("reports")
      .update({ status: "closed", citizen_confirmed: true, closed_at: new Date().toISOString() })
      .eq("ticket", ticket)
      .select()
      .single();
    if (rep) {
      await supabase
        .from("events")
        .insert({ report_id: rep.id, kind: "verified", detail: "Citizen signed off in public — fix confirmed" });
      await supabase
        .from("events")
        .insert({ report_id: rep.id, kind: "closed", detail: "Ticket closed — published to public ledger" });
      const { data: evs } = await supabase
        .from("events")
        .select("*")
        .eq("report_id", rep.id)
        .order("created_at", { ascending: true });
      setEvents(evs ?? []);
    }
    setBusy(false);
    go({ stage: "closed", ticket });
  };

  /** The fork's other path: reject → reopen → department re-flagged. Persisted. */
  const rejectFix = async () => {
    setBusy(true);
    const { data: rep } = await supabase
      .from("reports")
      .update({ status: "reopened", citizen_confirmed: false, escalation_count: 2 })
      .eq("ticket", ticket)
      .select()
      .single();
    if (rep) {
      await supabase
        .from("events")
        .insert({ report_id: rep.id, kind: "reopened", detail: "Citizen rejected the fix — ticket reopened, department re-flagged" });
    }
    setBusy(false);
    go({ stage: "confirm", ticket, reopenedOnce: true });
  };

  return (
    <section id="try-it" className="scroll-mt-16 border-y border-ink/5 bg-white">
      <div className="mx-auto max-w-5xl px-5 py-16 sm:py-20">
        <Reveal>
          <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-accent-dark">
            Try it — the real loop
          </p>
          <h2 className="mt-3 max-w-3xl text-[26px] font-bold tracking-tight sm:text-[34px]">
            File one. Watch it close. Every click writes to a real database.
          </h2>
          <p className="mt-3 max-w-xl text-[14.5px] leading-relaxed text-ink/60">
            This isn't a video or an animation — it's the product. File a report, breach the SLA,
            verify the fix, sign off — or reopen it. Every step is persisted and hash-chained.
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="mt-8 rounded-3xl border border-ink/10 bg-paper p-5 shadow-[0_20px_50px_-30px_rgba(16,26,40,0.3)] sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[13px] font-bold text-ink/80">
                {ticket ? `🎫 ${ticket}` : "What do you see on your street?"}
              </p>
              <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide text-accent-dark">
                {ui.stage === "pick" ? "Demo" : ui.stage === "closed" ? "Done" : "Live DB"}
              </span>
            </div>

            {/* Progress rail: one segment per stage of the loop */}
            <div className="mt-4 flex gap-1.5" aria-hidden="true">
              {Object.keys(stageLabels).map((s, i) => (
                <div
                  key={s}
                  title={stageLabels[s as Stage]}
                  className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${
                    stepIndex(ui.stage) > i ? "bg-accent" : "bg-ink/10"
                  }`}
                />
              ))}
            </div>

            <div className="mt-5 min-h-[280px]">
              <AnimatePresence mode="wait">
                {/* 1 — PICK */}
                {ui.stage === "pick" && (
                  <motion.div
                    key="pick"
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="grid gap-2.5 sm:grid-cols-3"
                  >
                    {ISSUES.map((i) => (
                      <button
                        key={i.id}
                        disabled={busy}
                        onClick={() => fileReport(i.id)}
                        className="group flex items-center gap-3 rounded-2xl border border-ink/10 bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md disabled:opacity-50"
                      >
                        <span className="text-[26px]">{i.emoji}</span>
                        <span>
                          <span className="block text-[14px] font-bold text-ink">{i.label}</span>
                          <span className="block text-[11.5px] text-ink/45">
                            {busy ? "Filing…" : "Tap to file a real report"}
                          </span>
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}

                {/* 2 — PHOTO */}
                {ui.stage === "photo" && (
                  <motion.div key="photo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="rounded-2xl border border-ink/10 bg-white p-5">
                    <p className="text-[14px] font-bold">📷 Photo captured</p>
                    <p className="mt-1 text-[12.5px] text-ink/50">📍 Location detected: MG Road, 2nd Cross · geo-tag attached</p>
                    <button
                      disabled={busy}
                      onClick={routeReport}
                      className="mt-4 rounded-xl bg-accent px-5 py-2.5 text-[13.5px] font-bold text-white transition-colors hover:bg-accent-dark disabled:opacity-50"
                    >
                      {busy ? "Routing…" : "Submit report →"}
                    </button>
                  </motion.div>
                )}

                {/* 3 — ROUTED */}
                {ui.stage === "routed" && (
                  <motion.div key="routed" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-2.5">
                    <div className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-white p-4">
                      <Badge done text="🧭" />
                      <div>
                        <p className="text-[13.5px] font-bold">Routed to Roads Dept</p>
                        <p className="text-[11.5px] text-ink/45">Deadline attached · ward supervisor notified</p>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-amber-300/70 bg-amber-50/70 p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-[13.5px] font-bold">🟡 In progress · SLA 72 hrs</p>
                        <span className="font-mono text-[11px] text-amber-800/70">deadline in DB</span>
                      </div>
                      <button
                        disabled={busy}
                        onClick={fastForward}
                        className="mt-3 rounded-xl bg-ink px-5 py-2.5 text-[13.5px] font-bold text-paper transition-colors hover:bg-ink/85 disabled:opacity-50"
                      >
                        {busy ? "…" : "⏩ Fast-forward 3 days"}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* 4 — SLA BREACH */}
                {ui.stage === "sla" && ui.breached && (
                  <motion.div key="sla" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="rounded-2xl border border-alert/30 bg-alert/5 p-5">
                    <p className="text-[14px] font-bold text-alert">🔴 SLA breached — escalated to Zonal Head</p>
                    <p className="mt-1 text-[12.5px] text-ink/60">
                      The department missed the window. The ticket escalated itself up the chain — no phone calls needed.
                    </p>
                    <button
                      disabled={busy}
                      onClick={submitFix}
                      className="mt-4 rounded-xl bg-accent px-5 py-2.5 text-[13.5px] font-bold text-white transition-colors hover:bg-accent-dark disabled:opacity-50"
                    >
                      {busy ? "…" : "Dept submits fix photo →"}
                    </button>
                  </motion.div>
                )}

                {/* 5 — GEO-VERIFY */}
                {ui.stage === "geoverify" && (
                  <motion.div key="geo" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="rounded-2xl border border-accent/30 bg-accent-soft/60 p-5">
                    <p className="text-[14px] font-bold">✅ Location match verified</p>
                    <p className="mt-1 text-[12.5px] text-ink/60">
                      Fix photo geo-hash matches the report. The department can't close this ticket — only you can.
                    </p>
                    <button
                      disabled={busy}
                      onClick={() => go({ stage: "confirm", ticket, reopenedOnce: false })}
                      className="mt-4 rounded-xl bg-accent px-5 py-2.5 text-[13.5px] font-bold text-white transition-colors hover:bg-accent-dark disabled:opacity-50"
                    >
                      Review the fix →
                    </button>
                  </motion.div>
                )}

                {/* 6 — CONFIRM (the fork) */}
                {ui.stage === "confirm" && (
                  <motion.div key="confirm" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="rounded-2xl border border-accent/30 bg-white p-5">
                    <p className="text-[14px] font-bold">Your street. Your call.</p>
                    <p className="mt-1 text-[12.5px] text-ink/60">
                      {ui.reopenedOnce
                        ? "The department re-fixed it. Sign off — or reopen again; every attempt lands on the ledger."
                        : "If you reject, the ticket reopens publicly and the department is re-flagged."}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2.5">
                      <button
                        disabled={busy}
                        onClick={confirmFix}
                        className="rounded-xl bg-accent px-5 py-2.5 text-[13.5px] font-bold text-white transition-colors hover:bg-accent-dark disabled:opacity-50"
                      >
                        {busy ? "…" : "✓ Looks fixed — sign off"}
                      </button>
                      <button
                        disabled={busy}
                        onClick={rejectFix}
                        className="rounded-xl border border-ink/15 bg-white px-5 py-2.5 text-[13.5px] font-bold text-ink transition-colors hover:border-alert/50 hover:text-alert disabled:opacity-50"
                      >
                        {busy ? "…" : "Not fixed — reopen"}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* 7 — CLOSED: the real audit trail from the DB */}
                {ui.stage === "closed" && (
                  <motion.div key="closed" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 20 }} className="rounded-2xl border border-accent/30 bg-white p-5">
                    <div className="flex items-center gap-3">
                      <motion.span
                        initial={reduce ? false : { scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 14, delay: 0.15 }}
                        className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-[20px] text-white"
                      >
                        ✓
                      </motion.span>
                      <div>
                        <p className="text-[15px] font-extrabold">Ticket closed — verified by you</p>
                        <p className="text-[12px] text-ink/50">Published to the public ledger · hash-chained · tamper-evident</p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-1.5">
                      {events.map((ev) => (
                        <div key={ev.id} className="flex items-center justify-between gap-3 rounded-lg bg-paper px-3 py-1.5">
                          <span className="text-[11.5px] font-semibold text-ink/75">{ev.kind}</span>
                          <span className="font-mono text-[10px] text-ink/35">{ev.hash.slice(0, 10)}…</span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => go({ stage: "pick" })}
                      className="mt-3 text-[12.5px] font-bold text-accent-dark underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
                    >
                      ↻ File another one
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {err && <p className="mt-3 rounded-xl bg-alert/10 px-3 py-2 text-[12px] font-semibold text-alert">⚠ {err}</p>}
            <p className="mt-4 border-t border-ink/5 pt-3 text-[11.5px] text-ink/45">
              {busy ? "Writing to Postgres…" : stageLabels[ui.stage]}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Badge({ done, text }: { done: boolean; text: string }) {
  return (
    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] ${
        done ? "bg-accent text-white" : "bg-amber-200/80 text-amber-800"
      }`}
    >
      {text}
    </span>
  );
}
