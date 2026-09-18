export default function TopBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink/5 bg-paper/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
        <div className="flex items-center gap-2">
          <LogoMark />
          <span className="text-[15px] font-bold tracking-tight">FixLoop</span>
        </div>
        <a
          href="#the-ask"
          className="rounded-full bg-ink px-4 py-1.5 text-[13px] font-semibold text-paper transition-colors hover:bg-accent-dark"
        >
          The ask
        </a>
      </div>
    </header>
  );
}

export function LogoMark() {
  return (
    <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#0E7C66" />
      <path
        d="M9 16a7 7 0 1 1 2.2 5.1"
        stroke="white"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M9 22.5v-5h5"
        stroke="white"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
