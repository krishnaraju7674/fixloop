import { Reveal } from "../lib/reveal";
import { AUTHOR } from "../config";

export default function WhyMe() {
  return (
    <section>
      <div className="mx-auto max-w-5xl px-5 py-16 sm:py-24">
        <Reveal>
          <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-accent-dark">
            Who's asking
          </p>
          <h2 className="mt-3 max-w-3xl text-[26px] font-bold tracking-tight sm:text-[34px]">
            Built by someone who files these complaints, not just reads about them.
          </h2>
        </Reveal>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <Reveal delay={0.05}>
            <div className="space-y-4 text-[15px] leading-relaxed text-ink/75">
              <p>
                I'm <strong className="font-semibold text-ink">{AUTHOR.name}</strong>, a third-year
                IT student who has filed — and re-filed, and re-filed — pothole and garbage
                complaints in my own city. The portals work; the endings don't. That gap is the
                whole product.
              </p>
              <p>
                I built the whole loop you've just tried — reporting, routing, the ledger — end to
                end, alone. That's the point: a 90-day pilot needs someone who can change the
                product the week the ward gives feedback. That's me.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="rounded-2xl border border-ink/10 bg-white p-6">
              <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-ink/45">
                Built & shipped by one person
              </p>
              <ul className="mt-4 space-y-3 text-[13.5px] text-ink/75">
                <li className="flex gap-2.5">
                  <Check /> End-to-end reporting → routing → closure flow
                </li>
                <li className="flex gap-2.5">
                  <Check /> Public resolution ledger with verifiable closure evidence
                </li>
                <li className="flex gap-2.5">
                  <Check /> Mobile-first — designed for the citizen's phone, not the office desktop
                </li>
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Check() {
  return (
    <svg viewBox="0 0 16 16" className="mt-1 h-4 w-4 shrink-0 text-accent" aria-hidden="true">
      <circle cx="8" cy="8" r="8" fill="currentColor" opacity="0.15" />
      <path
        d="M4.5 8.5l2.2 2.2 4.8-5"
        stroke="currentColor"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
