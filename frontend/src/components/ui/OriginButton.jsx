import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

/**
 * Cursor-aware hover effect inspired by Motiondrops' "Origin Button".
 * A fill springs open from the cursor's entry point and collapses toward
 * the exit point. Non-destructive: layers over any button styling.
 *
 * Props:
 *  - to        : when set, renders a react-router <Link>
 *  - hoverColor: the reveal fill (default subtle white wash)
 *  - className : base button classes (e.g. "btn-ltg btn-ltg-primary")
 */
export default function OriginButton({
  children,
  to,
  hoverColor = 'rgba(255, 255, 255, 0.18)',
  className = '',
  style,
  ...rest
}) {
  const ref = useRef(null);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState(0);
  const [hovered, setHovered] = useState(false);

  const pointFrom = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setOrigin({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setSize(Math.max(rect.width, rect.height) * 2.4);
  };

  const handleEnter = (e) => {
    pointFrom(e);
    setHovered(true);
  };

  const handleLeave = (e) => {
    pointFrom(e);
    setHovered(false);
  };

  const fill = (
    <motion.span
      aria-hidden="true"
      initial={false}
      animate={{ scale: hovered ? 1 : 0 }}
      transition={{ type: 'spring', stiffness: 220, damping: 26, mass: 0.6 }}
      style={{
        position: 'absolute',
        left: origin.x,
        top: origin.y,
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        borderRadius: '9999px',
        background: hoverColor,
        pointerEvents: 'none',
        transformOrigin: 'center',
        zIndex: 0,
      }}
    />
  );

  const inner = (
    <>
      {fill}
      <span style={{ position: 'relative', zIndex: 1, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        {children}
      </span>
    </>
  );

  const sharedProps = {
    ref,
    className,
    onMouseEnter: handleEnter,
    onMouseLeave: handleLeave,
    style: { position: 'relative', overflow: 'hidden', isolation: 'isolate', ...style },
    ...rest,
  };

  if (to) {
    return (
      <Link to={to} {...sharedProps}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" {...sharedProps}>
      {inner}
    </button>
  );
}
