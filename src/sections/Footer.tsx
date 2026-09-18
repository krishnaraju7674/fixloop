import { AUTHOR, CONTACT } from "../config";
import { LogoMark } from "./TopBar";

export default function Footer() {
  return (
    <footer className="border-t border-ink/5">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-5 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <LogoMark />
          <span className="text-[13px] font-bold tracking-tight">FixLoop</span>
          <span className="text-[12.5px] text-ink/45">— close the civic loop</span>
        </div>
        <p className="text-[12.5px] text-ink/45">
          {CONTACT.email} · {AUTHOR.name}
        </p>
      </div>
    </footer>
  );
}
