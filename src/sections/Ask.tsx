import { Reveal } from "../lib/reveal";
import { CONTACT } from "../config";

export default function Ask() {
  return (
    <section id="the-ask" className="scroll-mt-16 border-t border-ink/5 bg-accent-soft/50">
      <div className="mx-auto max-w-5xl px-5 py-16 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
          <Reveal>
            <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-accent-dark">
              The ask
            </p>
            <h2 className="mt-3 text-[28px] font-extrabold leading-[1.15] tracking-tight sm:text-[40px]">
              One ward. Ninety days. Measured in fixes, not meetings.
            </h2>
            <p className="mt-5 max-w-lg text-[15.5px] leading-relaxed text-ink/70">
              Green-light one ward for 90 days. The ledger publishes from day one; the pilot is
              judged on one number — <strong className="font-semibold text-ink">median time-to-fix</strong> — and
              one threshold: <strong className="font-semibold text-ink">80% citizen-verified closures</strong>.
            </p>
            <p className="mt-4 max-w-lg text-[13.5px] leading-relaxed text-ink/50">
              If the number isn't there at day 90, the pilot ends with a public dataset and no
              further spend. That's the whole downside.
            </p>
            <div className="mt-8">
              <a
                href={CONTACT.mailto("FixLoop ward pilot — let's talk")}
                className="inline-block rounded-xl bg-ink px-7 py-3.5 text-[15px] font-semibold text-paper shadow-sm transition-colors hover:bg-accent-dark"
              >
                Back the pilot →
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-2xl border border-ink/10 bg-white p-6 sm:p-7">
              <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-ink/45">
                What a yes buys
              </p>
              <ul className="mt-4 divide-y divide-ink/5">
                {[
                  ["Days 1–14", "Ward onboarding, department routing rules, citizen awareness push"],
                  ["Days 15–75", "Live operation: reports in, fixes verified, ledger publishing daily"],
                  ["Days 76–90", "Public report: time-to-fix curve, verification rate, next-ward cost"],
                ].map(([k, v]) => (
                  <li key={k} className="flex gap-4 py-3.5">
                    <span className="w-24 shrink-0 text-[12px] font-bold text-accent-dark">{k}</span>
                    <span className="text-[13.5px] leading-snug text-ink/70">{v}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 rounded-xl bg-paper p-4">
                <p className="text-[12px] leading-relaxed text-ink/55">
                  Success metric agreed <em className="not-italic font-semibold">before</em> day 1 —
                  so day 90 is a verdict, not a debate.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
