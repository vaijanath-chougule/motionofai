// Minimal Apple-style scroll cue: a hairline capsule with a dot that
// rises and fades on loop. Purely decorative — aria-hidden.
export default function ScrollIndicator() {
  return (
    <div className="pointer-events-none flex flex-col items-center gap-3" aria-hidden="true">
      <span className="text-[11px] font-medium uppercase tracking-eyebrow text-muted">
        Scroll
      </span>
      <span className="relative flex h-10 w-6 items-end justify-center rounded-full border border-ink/15">
        <span className="mb-2 h-1.5 w-1.5 rounded-full bg-accent animate-scroll-dot" />
      </span>
    </div>
  );
}
