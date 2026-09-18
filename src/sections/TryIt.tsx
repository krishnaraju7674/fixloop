import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Reveal } from "../lib/reveal";

const ISSUES = [
  { id: "pothole", label: "Pothole", emoji: "🕳️", dept: "Roads Dept", sla: "72 hrs" },
  { id: "garbage", label: "Garbage dump", emoji: "🗑️", dept: "Sanitation", sla: "48 hrs" },
  { id: "streetlight", label: "Dead streetlight", emoji: "💡", dept: "Electrical", sla: "96 hrs" },
] as const;

type Issue = (typeof ISSUES)[number];
type Stage = "pick" | "routing" | "fixing" | "verify" | "closed";

const TICK_MS = 900;

export default function TryIt() {
  const reduce = useReducedMotion();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [stage, setStage] = useState<Stage>("pick");
  const [elapsed, setElapsed] = useState(0);

  // Drive the demo timeline once an issue is picked.
  useEffect(() => {
    if (!issue || reduce) return;
    const order: Stage[] = ["routing", "fixing", "verify"];
    const idx = order.indexOf(stage);
    if (idx === -1) return;
    const t = setTimeout(() => {
      setStage(order[idx + 1] ?? "verify");
      setElapsed((e) => e + 1);
    }, TICK_MS);
    return () => clearTimeout(t);
  }, [issue, stage, reduce]);

  // Reduced motion: skip straight to the decision point.
  useEffect(() => {
    if (issue && reduce && stage !== "closed") setStage("verify");
  }, [issue, reduce, stage]);

  const reset = () => {
    setIssue(null);
    setStage("pick");
    setElapsed(0);
  };

  const pick = (i: Issue) => {
    setIssue(i);
    setStage(reduce ? "verify" : "routing");
  };

  const stageLabel: Record<Stage, string> = {
    pick: "Tap an issue to file it",
    routing: "Classifying photo · matching department…",
    fixing: `Assigned to ${issue?.dept} · SLA ${issue?.sla} started`,
    verify: "Fix photo received — same geo-tag. Your call:",
    closed: "Closed. That was the whole product.",
  };

  return (
    <section id="try-it" className="scroll-mt-16 border-y border-ink/5 bg-white">
      <div className="mx-auto max-w-5xl px-5 py-16 sm:py-20">
        <Reveal>
          <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-accent-dark">
            Try it — 30 seconds
          </p>
          <h2 className="mt-3 max-w-3xl text-[26px] font-bold tracking-tight sm:text-[34px]">
            File one. Watch it close. You're the citizen.
          </h2>
          <p className="mt-3 max-w-xl text-[14.5px] leading-relaxed text-ink/60">
            A working slice of the loop, right here. This is the part existing portals stop at —
            and the part that gets fixes verified.
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="mt-8 rounded-3xl border border-ink/10 bg-paper p-5 shadow-[0_20px_50px_-30px_rgba(16,26,40,0.3)] sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[13px] font-bold text-ink/80">
                {issue ? `${issue.emoji} ${issue.label} · #F-2492` : "What do you see on your street?"}
              </p>
              <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide text-accent-dark">
                {stage === "pick" ? "Demo" : stage === "closed" ? "Done" : "Live"}
              </span>
            </div>

            {/* Progress rail */}
            <div className="mt-4 flex gap-1.5" aria-hidden="true">
              {(["routing", "fixing", "verify", "closed"] as Stage[]).map((s, i) => (
                <div
                  key={s}
                  className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${
                    stageOrder(stage) > i ? "bg-accent" : "bg-ink/10"
                  }`}
                />
              ))}
            </div>

            <div className="mt-5 min-h-[210px]">
              <AnimatePresence mode="wait">
                {stage === "pick" && (
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
                        onClick={() => pick(i)}
                        className="group flex items-center gap-3 rounded-2xl border border-ink/10 bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md"
                      >
                        <span className="text-[26px]">{i.emoji}</span>
                        <span>
                          <span className="block text-[14px] font-bold text-ink">{i.label}</span>
                          <span className="block text-[11.5px] text-ink/45">Take a photo →</span>
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}

                {stage === "routing" && (
                  <motion.div
                    key="routing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-4 rounded-2xl border border-ink/10 bg-white p-5"
                  >
                    <span className="relative flex h-10 w-10 items-center justify-center">
                      <span className="anim-loop absolute h-full w-full animate-ping rounded-full bg-accent/30" />
                      <span className="h-5 w-5 rounded-full border-2 border-accent border-t-transparent motion-safe:animate-spin" />
                    </span>
                    <div>
                      <p className="text-[14px] font-bold">Reading the photo…</p>
                      <p className="text-[12.5px] text-ink/50">Classifying issue type · reading GPS · opening ticket</p>
                    </div>
                  </motion.div>
                )}

                {stage === "fixing" && (
                  <motion.div
                    key="fixing"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-2.5"
                  >
                    <div className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-white p-4">
                      <Badge done text="✓" />
                      <div>
                        <p className="text-[13.5px] font-bold">Routed to {issue?.dept}</p>
                        <p className="text-[11.5px] text-ink/45">Deadline attached · ward supervisor notified</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl border border-amber-300/70 bg-amber-50/70 p-4">
                      <Badge done={false} text="⏳" />
                      <div>
                        <p className="text-[13.5px] font-bold">Crew dispatched</p>
                        <p className="text-[11.5px] text-amber-800/70">SLA clock running — {issue?.sla} to fix</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {stage === "verify" && (
                  <motion.div
                    key="verify"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-2xl border border-accent/30 bg-accent-soft/60 p-5"
                  >
                    <p className="text-[13.5px] font-bold">A fix photo arrived — geo-tagged to the same spot.</p>
                    <p className="mt-1 text-[12.5px] text-ink/60">
                      The department can't close this ticket. Only you can. That's the loop.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2.5">
                      <button
                        onClick={() => setStage("closed")}
                        className="rounded-xl bg-accent px-5 py-2.5 text-[13.5px] font-bold text-white transition-colors hover:bg-accent-dark"
                      >
                        ✓ Looks fixed — sign off
                      </button>
                      <button
                        onClick={() => setStage("fixing")}
                        className="rounded-xl border border-ink/15 bg-white px-5 py-2.5 text-[13.5px] font-bold text-ink transition-colors hover:border-ink/35"
                      >
                        Not fixed — reopen
                      </button>
                    </div>
                  </motion.div>
                )}

                {stage === "closed" && (
                  <motion.div
                    key="closed"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="rounded-2xl border border-accent/30 bg-white p-5"
                  >
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
                        <p className="text-[12px] text-ink/50">
                          Published to the public ledger · two photos · {issue?.dept}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-[12.5px] leading-relaxed text-ink/60">
                      Every closed ticket on the ledger carries exactly this evidence chain. Multiply
                      by one ward and 90 days — that's the pilot.
                    </p>
                    <button
                      onClick={reset}
                      className="mt-3 text-[12.5px] font-bold text-accent-dark underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
                    >
                      ↻ File another one
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <p className="mt-4 border-t border-ink/5 pt-3 text-[11.5px] text-ink/45">
              {stageLabel[stage]}
              {elapsed > 0 && stage !== "closed" ? ` · ${elapsed * 1}s in` : ""}
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

function stageOrder(s: Stage): number {
  return ["pick", "routing", "fixing", "verify", "closed"].indexOf(s) - 1;
}
