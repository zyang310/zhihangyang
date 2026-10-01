import { forwardRef } from 'react';
import { PROFILE } from '../../data/profile';

interface NameplateProps {
  onOpenCatalog: () => void;
}

/** Always-visible name, tagline, and contact links, so nobody has to open a book for the basics. */
export const Nameplate = forwardRef<HTMLButtonElement, NameplateProps>(function Nameplate({ onOpenCatalog }, catalogButtonRef) {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-20 flex flex-wrap items-start justify-between gap-x-8 gap-y-2 bg-linear-to-b from-walnut-950/90 via-walnut-950/45 to-transparent px-4 pt-3 pb-10 sm:px-8 sm:pt-6">
      <div className="pointer-events-auto">
        <h1 className="font-book text-[clamp(1.3rem,2.4vw,2rem)] leading-tight font-semibold tracking-[0.14em] text-paper-50 uppercase">
          {PROFILE.name}
        </h1>
        <p className="font-book text-[clamp(0.9rem,1.3vw,1.05rem)] text-brass-300 italic">{PROFILE.tagline}</p>
        {PROFILE.seeking && <p className="font-book text-sm text-paper-300">{PROFILE.seeking}</p>}
      </div>
      <nav
        aria-label="Contact"
        className="pointer-events-auto flex flex-wrap items-center gap-x-4 gap-y-2 font-book text-[0.72rem] tracking-[0.14em] uppercase sm:gap-x-5 sm:text-[0.8rem] sm:tracking-[0.18em]"
      >
        {PROFILE.links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target={link.href.startsWith('http') ? '_blank' : undefined}
            rel="noreferrer"
            className="text-paper-100/90 underline-offset-4 hover:text-brass-200 hover:underline focus-visible:text-brass-200 focus-visible:underline focus-visible:outline-none"
          >
            {link.label}
          </a>
        ))}
        <button
          ref={catalogButtonRef}
          type="button"
          onClick={onOpenCatalog}
          className="cursor-pointer rounded-sm border border-brass-400/60 px-2.5 py-1.5 text-brass-200 uppercase transition-colors hover:bg-brass-400/15 focus-visible:bg-brass-400/15 focus-visible:outline-none sm:px-3"
        >
          <span className="hidden sm:inline">Card </span>catalog
        </button>
      </nav>
    </header>
  );
});
