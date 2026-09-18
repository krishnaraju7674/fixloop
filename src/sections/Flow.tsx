import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Reveal } from "../lib/reveal";
import PhoneMock from "./PhoneMock";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const steps = [
  {
    n: "01",
    icon: "📷",
    title: "Photo in",
    body: "Snap the issue. GPS + timestamp attach automatically. No forms, no login.",
  },
  {
    n: "02",
    icon: "🧭",
    title: "Auto-routed",
    body: "One department owns it, with a deadline attached.",
  },
  {
    n: "03",
    icon: "✅",
    title: "Fix verified",
    body: "Closure needs a fresh geo-tagged photo at the same spot. Talk can't fake it.",
  },
  {
    n: "04",
    icon: "🌐",
    title: "Signed off, in public",
    body: "The reporter confirms. Closed loops publish to an open ledger.",
  },
];

const ledger = [
  { id: "#F-2481", type: "Pothole", dept: "Roads · Ward 12", closed: "2d 4h", status: "Closed" },
  { id: "#F-2476", type: "Garbage", dept: "Sanitation · Ward 12", closed: "1d 6h", status: "Closed" },
  { id: "#F-2462", type: "Streetlight", dept: "Electrical · Ward 12", closed: "3d 1h", status: "Closed" },
  { id: "#F-2455", type: "Waterlogging", dept: "Stormwater · Ward 12", closed: "4d 2h", status: "Open" },
];

type Filter = "all" | "closed" | "open";

function LedgerRow({ row, dim }: { row: (typeof ledger)[number]; dim: boolean }) {
  const open = row.status === "Open";
  return (
    <motion.div
      layout
      animate={{ opacity: dim && open ? 0.5 : 1 }}
      transition={{ duration: 0.4, ease: EASE }}
      className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 ${
        open ? "border-amber-300 bg-amber-50/60" : "border-ink/5 bg-white"
      }`}
    >
      <div className="min-w-0">
        <p className="truncate text-[13px] font-semibold text-ink">
          <span className="font-mono text-[11px] text-ink/40">{row.id}</span> {row.type}
        </p>
        <p className="text-[11px] text-ink/50">{row.dept}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2.5">
        <span className="hidden text-[11px] font-medium text-ink/45 sm:inline">{row.closed}</span>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
            open ? "bg-amber-200/70 text-amber-800" : "bg-accent-soft text-accent-dark"
          }`}
        >
          {row.status}
        </span>
      </div>
    </motion.div>
  );
}

export default function Flow() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [filter, setFilter] = useState<Filter>("all");

  // Sequential spotlight: walks the eye through the loop, then rests.
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setActive((a) => (a + 1) % steps.length), 2200);
    return () => clearInterval(id);
  }, [reduce]);

  const rows = ledger.filter((r) => filter === "all" || r.status.toLowerCase() === filter);

  return (
    <section id="how-it-works" className="scroll-mt-16">
      <div className="mx-auto max-w-5xl px-5 py-16 sm:py-24">
        <Reveal>
          <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-accent-dark">
            The solution
          </p>
          <h2 className="mt-3 max-w-3xl text-[26px] font-bold tracking-tight sm:text-[34px]">
            One loop. Four steps. Evidence at every turn.
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink/60">
            Portals collect complaints. FixLoop is built around the part they skip —{" "}
            <strong className="font-semibold text-ink">verifiable closure</strong>.
          </p>
        </Reveal>

        <div className="mt-12 grid items-start gap-10 lg:grid-cols-[280px_1fr_280px] lg:gap-8">
          {/* Phone: the product, tangibly */}
          <Reveal delay={0.05} className="order-2 lg:order-1">
            <PhoneMock />
            <p className="mt-4 text-center text-[11.5px] leading-relaxed text-ink/45">
              The citizen's entire experience — one screen, one tap to sign off.
            </p>
          </Reveal>

          {/* Steps */}
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
                          isActive
                            ? "border-accent bg-accent-soft"
                            : "border-ink/15 bg-paper opacity-60"
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

          {/* Ledger card */}
          <Reveal delay={0.15} className="order-3 lg:order-3 lg:sticky lg:top-20">
            <div className="rounded-2xl border border-ink/10 bg-white p-5 shadow-[0_16px_40px_-20px_rgba(16,26,40,0.25)]">
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-bold tracking-tight">Resolution ledger</p>
                <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent-dark">
                  Live view
                </span>
              </div>
              <p className="mt-1 text-[11.5px] text-ink/45">Ward 12 · sample data</p>

              <div className="mt-3 flex gap-1.5">
                {(["all", "closed", "open"] as Filter[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`rounded-full px-3 py-1 text-[11px] font-bold capitalize transition-colors ${
                      filter === f
                        ? "bg-ink text-paper"
                        : "bg-paper text-ink/55 hover:bg-ink/5"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <motion.div layout className="mt-3 space-y-2">
                {rows.map((row) => (
                  <LedgerRow key={row.id} row={row} dim={reduce ? false : filter === "all"} />
                ))}
              </motion.div>

              <div className="mt-4 flex items-center justify-between rounded-xl bg-paper px-3 py-2.5">
                <p className="text-[12px] font-semibold text-ink/70">Median time-to-close</p>
                <p className="text-[15px] font-extrabold text-accent-dark">2d 6h</p>
              </div>
            </div>
            <p className="mt-3 px-1 text-[11.5px] leading-relaxed text-ink/45">
              Every closed row = two geo-tagged photos + one citizen confirmation.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
