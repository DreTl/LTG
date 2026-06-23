import { useRef, useState, useLayoutEffect } from 'react';
import { EXPORT_TOTAL_WIDTH, EXPORT_TOTAL_HEIGHT } from '../utils/exportDimensions';

/**
 * Scales a fixed-size (1438 × 1451) export graphic down to fit its container
 * width while preserving aspect ratio, for on-screen previewing.
 */
export default function CardPreview({ children, width = EXPORT_TOTAL_WIDTH, height = EXPORT_TOTAL_HEIGHT }) {
  const wrapRef = useRef(null);
  const [scale, setScale] = useState(0.4);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / width);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);

  return (
    <div ref={wrapRef} style={{ width: '100%', height: height * scale, overflow: 'hidden' }}>
      <div style={{ width, height, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        {children}
      </div>
    </div>
  );
}
