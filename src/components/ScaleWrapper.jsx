import { useEffect, useRef, useState } from 'react';

export default function ScaleWrapper({ scale = 0.8, buffer = 24, children }) {
  const innerRef = useRef(null);
  const [h, setH] = useState(null);

  const recalc = () => {
    const el = innerRef.current;
    if (!el) return;
    // altura real sin transform
    const origH =
      el.offsetHeight ||
      el.scrollHeight ||
      el.getBoundingClientRect().height ||
      0;
    // añadir buffer para evitar cortes finos
    setH(Math.ceil(origH * scale) + buffer);
  };

  useEffect(() => {
    recalc();
    const el = innerRef.current;
    if (!el) return undefined;

    let ro;
    let mo;
    let rafId;
    let t1;
    let t2;

    const scheduleRecalc = () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (t1) clearTimeout(t1);
      if (t2) clearTimeout(t2);
      recalc();
      rafId = requestAnimationFrame(recalc);
      t1 = setTimeout(recalc, 100);
      t2 = setTimeout(recalc, 300);
    };

    // ResizeObserver for layout changes
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(scheduleRecalc);
      ro.observe(el);
    }

    // MutationObserver to detect DOM changes (forms, async content)
    if (typeof MutationObserver !== 'undefined') {
      mo = new MutationObserver(scheduleRecalc);
      mo.observe(el, { childList: true, subtree: true, attributes: true });
    }

    // fallback
    window.addEventListener('resize', scheduleRecalc);

    // schedule extra recalcs in case of late layout
    t1 = setTimeout(recalc, 150);
    t2 = setTimeout(recalc, 400);

    return () => {
      if (ro) ro.disconnect();
      if (mo) mo.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
      if (t1) clearTimeout(t1);
      if (t2) clearTimeout(t2);
      window.removeEventListener('resize', scheduleRecalc);
    };
  }, [scale, buffer]);

  return (
    <div style={{ overflow: 'hidden', height: h ? `${h}px` : 'auto' }}>
      <div
        ref={innerRef}
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          width: `${100 / scale}%`,
          display: 'block',
          boxSizing: 'border-box',
        }}
      >
        {children}
      </div>
    </div>
  );
}
