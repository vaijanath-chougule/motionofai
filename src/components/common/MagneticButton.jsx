import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { useMagnetic } from '../../hooks/useMagnetic';
import { useCursor } from '../../contexts/CursorContext';
import { mergeRefs } from '../../utils/mergeRefs';

const VARIANTS = {
  primary:
    'bg-ink text-white hover:bg-accent shadow-[0_16px_40px_-16px_rgba(37,99,235,0.55)]',
  secondary:
    'bg-transparent text-ink border border-hairline hover:border-ink/30 hover:bg-ink/[0.03]',
  accent: 'bg-accent text-white hover:bg-ink',
  ghost: 'bg-transparent text-ink hover:text-accent',
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
    'group relative inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-[15px] font-medium tracking-tight transition-colors duration-500 ease-premium gpu will-change-transform';

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
