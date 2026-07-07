import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { useMagnetic } from '../../hooks/useMagnetic';
import { useCursor } from '../../contexts/CursorContext';
import { mergeRefs } from '../../utils/mergeRefs';

const VARIANTS = {
  primary:
    'bg-ink text-white hover:bg-accent shadow-[0_16px_40px_-16px_rgba(37,99,235,0.55)]',
  // Glassmorphism CTA (frosted blur + thin border + soft shadow) so it
  // reads clearly over bright hero media. Visuals + prefixed backdrop
  // blur live in the `.cta-glass` class; here we only set the 300ms
  // paint transition. Transform is left to the magnetic GSAP layer, so
  // `!transition-[...]` deliberately excludes it.
  secondary:
    'text-ink cta-glass ' +
    '!transition-[background-color,border-color,box-shadow,backdrop-filter] !duration-300',
  accent: 'bg-accent text-white hover:bg-ink',
  ghost: 'bg-transparent text-ink hover:text-accent',
};

// Padding / type-size presets. `compact` is phone-first: small on mobile,
// full size from the `sm` breakpoint up — for CTAs that must fit a tight
// mobile layout (e.g. the voice-agent phone finale) yet stay full-size on
// desktop. `default` is unchanged, so every existing button is untouched.
const SIZES = {
  default: 'px-8 py-4 text-[15px]',
  sm: 'px-5 py-2.5 text-sm',
  compact: 'px-5 py-2.5 text-sm sm:px-8 sm:py-4 sm:text-[15px]',
};

/**
 * The site's single button primitive: magnetic pull toward the pointer,
 * an inner label that drifts a touch further (parallax depth), and
 * cursor-context integration. Renders as <button>, router <Link>, or
 * <a> based on the props you pass — one component, every CTA.
 */
const MagneticButton = forwardRef(function MagneticButton(
  {
    children,
    variant = 'primary',
    size = 'default',
    to,
    href,
    onClick,
    className = '',
    strength = 0.4,
    type = 'button',
    ...rest
  },
  externalRef,
) {
  const magneticRef = useMagnetic(strength);
  const { setCursor, resetCursor } = useCursor();

  const base =
    `group relative inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight transition-colors duration-500 ease-premium gpu will-change-transform ${
      SIZES[size] ?? SIZES.default
    }`;

  const content = (
    <span data-magnetic-inner className="relative z-10 inline-flex items-center gap-2">
      {children}
    </span>
  );

  const hoverProps = {
    onMouseEnter: () => setCursor('hover'),
    onMouseLeave: () => resetCursor(),
    className: `${base} ${VARIANTS[variant]} ${className}`,
  };

  const ref = mergeRefs(magneticRef, externalRef);

  if (to) {
    return (
      <Link ref={ref} to={to} onClick={onClick} {...hoverProps} {...rest}>
        {content}
      </Link>
    );
  }
  if (href) {
    return (
      <a ref={ref} href={href} onClick={onClick} {...hoverProps} {...rest}>
        {content}
      </a>
    );
  }
  return (
    <button ref={ref} type={type} onClick={onClick} {...hoverProps} {...rest}>
      {content}
    </button>
  );
});

export default MagneticButton;
