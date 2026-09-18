import { Reveal } from "../lib/reveal";

const beats = [
  {
    title: "The money is already moving",
    body: "Smart-city funds are buying complaint infrastructure right now. What's unspent is accountability — nothing forces the last mile to close.",
  },
  {
    title: "Fixes are being priced, not counted",
    body: "Pothole deaths are now tabled in Parliament. 'We received the complaint' is no longer an acceptable answer — to citizens or auditors.",
  },
  {
    title: "The tech got cheap",
    body: "Geo-tagged photos, GPS matching, a small classifier — commodity parts in 2026. A ward pilot costs less than a month of a call-centre contract.",
  },
];

export default function WhyNow() {
  return (
    <section className="border-y border-ink/5 bg-ink text-paper">
      <div className="mx-auto max-w-5xl px-5 py-16 sm:py-24">
        <Reveal>
          <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-accent-soft/80">
            Why this, why now
          </p>
          <h2 className="mt-3 max-w-3xl text-[26px] font-bold tracking-tight sm:text-[34px]">
            Complaint volume is a solved problem. Complaint closure is not — and it just became
            measurable.
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-6">
          {beats.map((b, i) => (
            <Reveal key={b.title} delay={i * 0.08}>
              <div className="border-t-2 border-accent pt-4">
                <p className="text-[15px] font-bold tracking-tight">{b.title}</p>
                <p className="mt-2 text-[13.5px] leading-relaxed text-paper/65">{b.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <div className="mt-12 rounded-2xl border border-paper/15 bg-paper/5 p-6 sm:p-7">
            <p className="text-[15.5px] font-semibold leading-relaxed">
              Existing portals collect complaints. <span className="text-accent-soft">FixLoop closes them in public</span> — a
              verified fix, two photos, a timestamp, open to any resident or auditor.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
