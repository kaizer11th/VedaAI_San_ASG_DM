"use client";

// A small hand-drawn-style checkmark, evoking a teacher's red pen —
// the one deliberate signature flourish for this design.
function PenTick() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      className="-rotate-6 text-redpen"
      aria-hidden="true"
    >
      <path
        d="M4 12.5c1.8 2 3.4 3.8 4.6 5.4C11.5 13.3 15 8 20 4"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Header({
  onHome
}: {
  onHome?: () => void;
}) {
  return (
    <header className="flex items-center justify-between border-b border-paper-line bg-paper/80 px-4 py-3 backdrop-blur-sm sm:px-6">
      <div>
        {onHome && (
          <button
            onClick={onHome}
            className="flex items-center gap-1.5 rounded-full border border-ink/10 bg-white px-3 py-1.5 text-xs font-semibold text-ink-soft transition hover:border-ink/20 hover:text-ink"
          >
            <span aria-hidden="true">←</span> Return to home
          </button>
        )}
      </div>

      <a
        href="/"
        className="flex items-center gap-1.5 font-display text-lg font-semibold tracking-tight text-ink sm:text-xl"
      >
        <span>
          Sayan<span className="text-redpen">_</span>DMO
        </span>
        <PenTick />
      </a>
    </header>
  );
}
