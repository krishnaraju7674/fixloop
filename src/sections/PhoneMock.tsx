import { motion, useReducedMotion } from "framer-motion";

const timeline = [
  { label: "Submitted", meta: "Today · 9:02 AM", done: true },
  { label: "Routed → Roads Dept", meta: "Deadline: 72 hrs", done: true },
  { label: "Fix photo uploaded", meta: "Geo-tagged · same spot", done: true },
  { label: "Verified by you", meta: "One tap, in public", done: false },
];

export default function PhoneMock() {
  const reduce = useReducedMotion();
  return (
    <div className="mx-auto w-[250px]">
      {/* Frame */}
      <div className="rounded-[2.4rem] border-[9px] border-ink bg-ink shadow-[0_24px_60px_-24px_rgba(16,26,40,0.45)]">
        <div className="overflow-hidden rounded-[1.8rem] bg-white">
          {/* Status bar */}
          <div className="flex items-center justify-between bg-paper px-4 pb-1.5 pt-2">
            <span className="text-[9px] font-bold text-ink/70">9:41</span>
            <div className="h-3.5 w-14 rounded-full bg-ink" aria-hidden="true" />
            <span className="text-[9px] font-bold text-ink/70">100%</span>
          </div>

          {/* App header */}
          <div className="flex items-center justify-between border-b border-ink/5 bg-white px-4 py-2.5">
            <span className="text-[11px] font-extrabold tracking-tight">FixLoop</span>
            <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[8.5px] font-bold text-accent-dark">
              WARD 12
            </span>
          </div>

          <div className="space-y-3 px-3.5 py-3.5">
            {/* Photo card */}
            <div className="relative overflow-hidden rounded-xl bg-[#3a3f47]">
              <svg viewBox="0 0 220 110" className="block w-full" aria-hidden="true">
                <rect width="220" height="110" fill="#3a3f47" />
                {/* lane dashes */}
                <rect x="0" y="52" width="30" height="6" rx="2" fill="#e8e4da" opacity="0.85" />
                <rect x="48" y="52" width="30" height="6" rx="2" fill="#e8e4da" opacity="0.85" />
                <rect x="96" y="52" width="30" height="6" rx="2" fill="#e8e4da" opacity="0.35" />
                <rect x="144" y="52" width="30" height="6" rx="2" fill="#e8e4da" opacity="0.85" />
                <rect x="192" y="52" width="28" height="6" rx="2" fill="#e8e4da" opacity="0.85" />
                {/* the pothole */}
                <path
                  d="M78 46c10-7 34-8 46-2 9 5 10 16 2 22-11 8-37 8-48 1-8-5-8-15 0-21z"
                  fill="#23272e"
                />
                <path
                  d="M88 52c7-4 22-4 29-1 5 3 5 9 0 12-7 4-23 4-29 0-4-3-4-8 0-11z"
                  fill="#15181d"
                />
              </svg>
              <span className="absolute left-2 top-2 rounded-md bg-ink/70 px-1.5 py-0.5 text-[8px] font-bold text-white backdrop-blur">
                #F-2481 · POTHOLE
              </span>
              <span className="absolute bottom-2 right-2 rounded-md bg-ink/70 px-1.5 py-0.5 text-[8px] font-medium text-white backdrop-blur">
                📍 MG Rd, 2nd Cross · 9:02 AM
              </span>
            </div>

            {/* Timeline */}
            <div className="relative space-y-2.5 pl-1">
              <div aria-hidden="true" className="absolute bottom-3 left-[13px] top-3 w-px bg-ink/10" />
              {timeline.map((t, i) => (
                <div key={t.label} className="relative flex items-center gap-2.5">
                  <span
                    className={`z-10 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${
                      t.done ? "bg-accent text-white" : "bg-ink/10 text-ink/40"
                    }`}
                  >
                    {t.done ? "✓" : i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={`text-[10.5px] font-bold leading-tight ${t.done ? "text-ink" : "text-ink/45"}`}>
                      {t.label}
                    </p>
                    <p className="text-[8.5px] leading-tight text-ink/40">{t.meta}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Verified sign-off bar */}
          <div className="flex items-center justify-between border-t border-ink/5 bg-paper px-4 py-2.5">
            <span className="text-[9.5px] font-semibold text-ink/55">Signed off in public</span>
            <motion.span
              initial={reduce ? false : { scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 300, damping: 16, delay: 0.5 }}
              className="rounded-full bg-accent px-2 py-0.5 text-[8.5px] font-extrabold text-white"
            >
              VERIFIED ✓
            </motion.span>
          </div>
        </div>
      </div>
    </div>
  );
}
