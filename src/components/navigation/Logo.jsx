import { BRAND } from '../../utils/constants';

// Wordmark with a small orbit glyph. Pure SVG/CSS — crisp at any scale.
export default function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="relative flex h-6 w-6 items-center justify-center">
        <span className="absolute inset-0 rounded-full border border-accent/40" />
        <span className="absolute inset-[6px] rounded-full bg-accent" />
        <span className="absolute inset-0 animate-pulse-ring rounded-full border border-accent/30" />
      </span>
      <span className="text-[17px] font-semibold tracking-tight text-ink">
        {BRAND.name}
      </span>
    </span>
  );
}
