import { Reveal, CountUp } from "../lib/reveal";

const stats = [
  {
    value: 9438,
    suffix: "",
    label: "deaths in pothole-related road accidents, 2020–2024",
    source: "Government data tabled in Parliament",
  },
  {
    value: 1200000,
    suffix: "+",
    label: "civic complaints logged by one municipal corporation in six years",
    source: "BMC public complaint records, 2018–2024",
  },
  {
    value: 60,
    suffix: "+ days",
    label: "a routine complaint can sit unresolved even after a portal exists",
    source: "Municipal grievance reviews, 2025",
  },
];

export default function Cost() {
  return (
    <section className="border-y border-ink/5 bg-white">
      <div className="mx-auto max-w-5xl px-5 py-16 sm:py-20">
        <Reveal>
          <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-alert">
            The cost of inaction
          </p>
          <h2 className="mt-3 max-w-3xl text-[26px] font-bold tracking-tight sm:text-[34px]">
            A complaint system that doesn't close loops isn't a system. It's a waiting room.
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08}>
              <div className="h-full rounded-2xl border border-ink/5 bg-paper p-6">
                <div className="text-[30px] font-extrabold tracking-tight text-accent-dark sm:text-[36px]">
                  <CountUp value={s.value} suffix={s.suffix} />
                </div>
                <p className="mt-2 text-[14px] leading-snug text-ink/75">{s.label}</p>
                <p className="mt-3 text-[11px] font-medium uppercase tracking-wide text-ink/40">
                  {s.source}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
