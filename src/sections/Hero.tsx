import { motion, useReducedMotion } from "framer-motion";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const chips = ["Potholes", "Garbage", "Streetlights", "Waterlogging", "Sewage overflow"];

export default function Hero() {
  const reduce = useReducedMotion();
  const fade = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay, ease: EASE },
        };

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-5xl px-5 pb-20 pt-16 sm:pt-24">
        <motion.p
          {...fade(0)}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent-soft px-3.5 py-1.5 text-[12px] font-semibold text-accent-dark"
        >
          <span className="relative flex h-2 w-2">
            <span className="anim-loop absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          A funding pitch for one 90-day ward pilot
        </motion.p>

        <motion.h1
          {...fade(0.08)}
          className="max-w-3xl text-[34px] font-extrabold leading-[1.12] tracking-tight sm:text-[52px]"
        >
          Citizens report potholes every day.
          <br />
          <span className="text-ink/55">
            Cities have no reliable way to prove they were fixed.
          </span>
        </motion.h1>

        <motion.p {...fade(0.16)} className="mt-6 max-w-2xl text-[17px] leading-relaxed text-ink/70">
          Cities log millions of complaints a year. The failure isn't collection — it's{" "}
          <strong className="font-semibold text-ink">closure</strong>. FixLoop makes the fix the
          receipt: photo in, department routed, repair verified, you sign off — in public.
        </motion.p>

        <motion.div {...fade(0.24)} className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href="#how-it-works"
            className="rounded-xl bg-accent px-6 py-3 text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-accent-dark"
          >
            See how the loop closes
          </a>
          <a
            href="#try-it"
            className="rounded-xl border border-ink/15 bg-white px-6 py-3 text-[15px] font-semibold text-ink transition-colors hover:border-ink/35"
          >
            ⚡ Try it — 30 seconds
          </a>
        </motion.div>

        <motion.div {...fade(0.32)} className="mt-10 flex flex-wrap gap-2">
          {chips.map((c) => (
            <span
              key={c}
              className="rounded-full border border-ink/10 bg-white px-3 py-1 text-[12px] font-medium text-ink/60"
            >
              {c}
            </span>
          ))}
          <span className="rounded-full border border-ink/10 bg-white px-3 py-1 text-[12px] font-medium text-ink/60">
            → all in one queue
          </span>
        </motion.div>
      </div>
    </section>
  );
}
