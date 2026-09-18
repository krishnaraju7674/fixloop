import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Reveal } from "../lib/reveal";

const FAQS = [
  {
    q: "Doesn't the existing complaint portal already do this?",
    a: "It does the first half — collecting complaints. The gap is the ending: no geo-verified fix evidence, no citizen sign-off, no public ledger. FixLoop doesn't replace the portal; it adds the closing loop the portal was never built to prove.",
  },
  {
    q: "What does a pilot actually cost?",
    a: "Less than one month of an existing call-centre or portal-maintenance contract. One ward, 90 days, one developer (me), commodity infrastructure — geo-tagged photos, a small classification model, a public ledger page.",
  },
  {
    q: "What stops fake or duplicate reports?",
    a: "Three gates: one report per geo-cell per issue per week, photo classification filters non-issues, and closure requires a fresh geo-tagged photo at the same spot. And because the ledger is public, fakes are visible to everyone — including journalists.",
  },
  {
    q: "Who owns the data?",
    a: "The municipal corporation does, fully. The pilot's deliverable is a public dataset of every ticket with timestamps and outcomes — data the corporation can defend in an audit, not a vendor lock-in.",
  },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section>
      <div className="mx-auto max-w-3xl px-5 py-16 sm:py-20">
        <Reveal>
          <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-accent-dark">
            Straight answers
          </p>
          <h2 className="mt-3 text-[26px] font-bold tracking-tight sm:text-[34px]">
            The four questions every budget-holder asks.
          </h2>
        </Reveal>

        <div className="mt-8 divide-y divide-ink/8 rounded-2xl border border-ink/10 bg-white">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-paper/60"
                >
                  <span className="text-[14.5px] font-bold tracking-tight text-ink">{f.q}</span>
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[15px] font-bold leading-none text-accent-dark"
                    aria-hidden="true"
                  >
                    +
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-[13.5px] leading-relaxed text-ink/65">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
