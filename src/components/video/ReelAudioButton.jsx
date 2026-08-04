import { Volume2, VolumeX } from 'lucide-react';

/**
 * ReelAudioButton — the per-reel sound toggle for the vertical showcase.
 *
 * Deliberately built from the SAME chrome as ReelCard's overlay play glyph
 * (frosted disc, white/60 hairline, white/15 fill, backdrop blur) so it reads
 * as part of the existing design language rather than a bolted-on control.
 *
 * It is a pure control: it owns no audio state. The parent showcase decides
 * which single reel may sound, and this button only reports the intent.
 */
export default function ReelAudioButton({ on, onToggle, label }) {
  const Icon = on ? Volume2 : VolumeX;

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      aria-label={on ? `Mute ${label}` : `Unmute ${label}`}
      title={on ? 'Mute' : 'Unmute'}
      className={`ease-premium flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-500 md:h-10 md:w-10 ${
        on
          ? 'border-accent/70 bg-accent/30 text-white'
          : 'border-white/60 bg-white/15 text-white/85 hover:bg-white/25'
      }`}
      style={
        on
          ? { boxShadow: '0 0 0 1px rgba(255,255,255,0.18), 0 8px 24px -12px rgba(37,99,235,0.9)' }
          : undefined
      }
    >
      <Icon size={16} strokeWidth={2} aria-hidden="true" />
    </button>
  );
}
