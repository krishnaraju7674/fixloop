import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Reveal } from "../lib/reveal";
import { supabase, type ReportRow } from "../lib/db";
import PhoneMock from "./PhoneMock";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const steps = [
  { n: "01", icon: "📷", title: "Photo in", body: "Snap the issue. GPS + timestamp attach automatically. No forms, no login." },
  { n: "02", icon: "🧭", title: "Auto-routed", body: "One department owns it, with a deadline attached." },
  { n: "03", icon: "⏱️", title: "SLA enforced", body: "Miss the window and the ticket escalates itself — no phone calls." },
  { n: "04", icon: "✅", title: "Fix verified, in public", body: "Closure needs a fresh geo-tagged photo + the citizen's sign-off. Then it publishes." },
];

const STATUS_META: Record<string, { label: string; open: boolean }> = {
  filed: { label: "Filed", open: true },
  routed: { label: "In progress", open: true },
  escalated: { label: "Escalated", open: true },
  fix_submitted: { label: "Fix submitted", open: true },
  verified: { label: "Awaiting sign-off", open: true },
  reopened: { label: "Reopened", open: true },
  closed: { label: "Closed", open: false },
};

type Filter = "all" | "closed" | "open";

function humanTime(ms: number): string {
  const h = Math.round(ms / 3600e3);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d ${h % 24}h`;
}

function LedgerRow({ row }: { row: ReportRow }) {
  const meta = STATUS_META[row.status] ?? { label: row.status, open: true };
  const dur =
    meta.open
      ? `${row.escalation_count > 0 ? "⚠ " : ""}SLA ${row.sla_hours}h`
      : humanTime(new Date(row.closed_at ?? row.reported_at).getTime() - new Date(row.reported_at).getTime());
  return (
    <motion.div
      layout
      transition={{ duration: 0.35, ease: EASE }}
      className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 ${
        meta.open ? (row.status === "escalated" ? "border-alert/30 bg-alert/5" : "border-amber-300 bg-amber-50/60") : "border-ink/5 bg-white"
      }`}
    >
      <div className="min-w-0">
        <p className="truncate text-[13px] font-semibold text-ink">
          <span className="font-mono text-[11px] text-ink/40">{row.ticket}</span> {row.issue_type}
        </p>
        <p className="text-[11px] text-ink/50">
          {row.dept} · {row.location}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2.5">
        <span className="hidden text-[11px] font-medium text-ink/45 sm:inline">{dur}</span>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
            meta.open
              ? row.status === "escalated"
                ? "bg-alert/15 text-alert"
                : "bg-amber-200/70 text-amber-800"
              : "bg-accent-soft text-accent-dark"
          }`}
        >
          {meta.label}
        </span>
      </div>
    </motion.div>
  );
}

export default function Flow() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [filter, setFilter] = useState<Filter>("all");
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  // Spotlight walks the eye through the loop, then rests.
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setActive((a) => (a + 1) % steps.length), 2200);
    return () => clearInterval(id);
  }, [reduce]);

  // Live ledger: fetch real tickets; poll every 20s so new demo filings appear.
  useEffect(() => {
    let alive = true;
    const load = async () => {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .order("reported_at", { ascending: false })
        .limit(12);
      if (!alive) return;
      if (error) setDbError(error.message);
      else {
        setRows(data ?? []);
        setDbError(null);
      }
      setLoading(false);
    };
    load();
    const id = setInterval(load, 20000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const visible = useMemo(
    () =>
      rows.filter((r) => {
        const open = (STATUS_META[r.status] ?? { open: true }).open;
        return filter === "all" || (filter === "open" ? open : !open);
      }),
    [rows, filter]
  );

  const median = useMemo(() => {
    const closed = rows.filter((r) => r.status === "closed" && r.closed_at);
    if (closed.length === 0) return null;
    const hours = closed
      .map((r) => (new Date(r.closed_at!).getTime() - new Date(r.reported_at).getTime()) / 3600e3)
      .sort((a, b) => a - b);
    const mid = Math.floor(hours.length / 2);
    return hours.length % 2 ? hours[mid] : (hours[mid - 1] + hours[mid]) / 2;
  }, [rows]);

  return (
    <section id="how-it-works" className="scroll-mt-16">
      <div className="mx-auto max-w-5xl px-5 py-16 sm:py-24">
        <Reveal>
          <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-accent-dark">The solution</p>
          <h2 className="mt-3 max-w-3xl text-[26px] font-bold tracking-tight sm:text-[34px]">
            One loop. Four steps. Evidence at every turn.
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink/60">
            Portals collect complaints. FixLoop is built around the part they skip —{" "}
            <strong className="font-semibold text-ink">verifiable closure</strong>.
          </p>
        </Reveal>

        <div className="mt-12 grid items-start gap-10 lg:grid-cols-[280px_1fr_280px] lg:gap-8">
          <Reveal delay={0.05} className="order-2 lg:order-1">
            <PhoneMock />
            <p className="mt-4 text-center text-[11.5px] leading-relaxed text-ink/45">
              The citizen's entire experience — one screen, one tap to sign off.
            </p>
          </Reveal>

          <div className="order-1 lg:order-2">
            <ol className="relative space-y-3">
              <div aria-hidden="true" className="absolute bottom-8 left-[27px] top-8 w-px bg-ink/10" />
              {steps.map((s, i) => {
                const isActive = reduce ? true : i === active;
                return (
                  <Reveal key={s.n} delay={i * 0.07}>
                    <motion.li
                      animate={{
                        backgroundColor: isActive ? "rgba(14,124,102,0.06)" : "rgba(14,124,102,0)",
                        borderColor: isActive ? "rgba(14,124,102,0.35)" : "rgba(16,26,40,0.08)",
                      }}
                      transition={{ duration: 0.45, ease: EASE }}
                      className="relative flex gap-4 rounded-2xl border bg-white p-4 sm:p-5"
                    >
                      <div
                        className={`z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-[15px] transition-colors duration-300 ${
                          isActive ? "border-accent bg-accent-soft" : "border-ink/15 bg-paper opacity-60"
                        }`}
                      >
                        {s.icon}
                      </div>
                      <div>
                        <p className="text-[15px] font-bold tracking-tight">
                          {s.title}
                          <span className="ml-2 font-mono text-[10px] font-medium uppercase tracking-wider text-ink/30">
                            {s.n}
                          </span>
                        </p>
                        <p className="mt-1 text-[13.5px] leading-relaxed text-ink/65">{s.body}</p>
                      </div>
                    </motion.li>
                  </Reveal>
                );
              })}
            </ol>
          </div>

          {/* LIVE LEDGER — real rows from Postgres */}
          <Reveal delay={0.15} className="order-3 lg:order-3 lg:sticky lg:top-20">
            <div className="rounded-2xl border border-ink/10 bg-white p-5 shadow-[0_16px_40px_-20px_rgba(16,26,40,0.25)]">
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-bold tracking-tight">Resolution ledger</p>
                <span className="flex items-center gap-1.5 rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent-dark">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="anim-loop absolute h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                    <span className="relative h-1.5 w-1.5 rounded-full bg-accent" />
                  </span>
                  Live DB
                </span>
              </div>
              <p className="mt-1 text-[11.5px] text-ink/45">Ward 12 · every row is a real ticket</p>

              <div className="mt-3 flex gap-1.5">
                {(["all", "open", "closed"] as Filter[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`rounded-full px-3 py-1 text-[11px] font-bold capitalize transition-colors ${
                      filter === f ? "bg-ink text-paper" : "bg-paper text-ink/55 hover:bg-ink/5"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <motion.div layout className="mt-3 space-y-2">
                {loading && <p className="py-6 text-center text-[12px] text-ink/40">Loading live tickets…</p>}
                {!loading && visible.length === 0 && (
                  <p className="py-6 text-center text-[12px] text-ink/40">No tickets in this view yet.</p>
                )}
                {!loading && visible.map((row) => <LedgerRow key={row.id} row={row} />)}
              </motion.div>

              <div className="mt-4 flex items-center justify-between rounded-xl bg-paper px-3 py-2.5">
                <p className="text-[12px] font-semibold text-ink/70">Median time-to-close</p>
                <p className="text-[15px] font-extrabold text-accent-dark">
                  {median == null ? "—" : humanTime(median * 3600e3)}
                </p>
              </div>
            </div>
            <p className="mt-3 px-1 text-[11.5px] leading-relaxed text-ink/45">
              Every closed row = two geo-tagged photos + one citizen confirmation, hash-chained in
              the database. File a ticket above — it appears here within seconds.
            </p>
          </Reveal>
        </div>
      </div>
      {dbError && (
        <p className="mx-auto max-w-5xl px-5 pb-8 text-[11.5px] text-alert/80">Ledger temporarily unavailable: {dbError}</p>
      )}
    </section>
  );
}
