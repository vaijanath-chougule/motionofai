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
      <span
        className="font-display font-semibold leading-none"
        style={{
          fontSize: '30px',
          letterSpacing: '-0.045em',
          backgroundImage: 'linear-gradient(180deg, #7aa2ff 0%, #2563eb 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
        }}
      >
        {BRAND.name}
      </span>
    </span>
  );
}
