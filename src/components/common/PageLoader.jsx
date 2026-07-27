// Full-viewport Suspense fallback — branded, no layout shift, matches
// the white canvas so lazy chunk loads feel seamless.
export default function PageLoader() {
  return (
    <div className="fixed inset-0 z-[800] flex items-center justify-center bg-canvas">
      <div className="flex flex-col items-center gap-5">
        <span className="relative flex h-10 w-10 items-center justify-center">
          <span className="absolute inset-0 rounded-full border border-accent/25" />
          <span className="absolute inset-0 animate-pulse-ring rounded-full border border-accent/40" />
          <span className="h-2.5 w-2.5 rounded-full bg-accent" />
        </span>
        <span className="text-xs font-medium uppercase tracking-eyebrow text-muted">
          wenilo
        </span>
      </div>
    </div>
  );
}
