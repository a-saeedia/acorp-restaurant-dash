import { useEffect, useRef, useState } from 'react';

/**
 * Width of a block element, tracked with ResizeObserver. Charts need an explicit
 * pixel width (no ResponsiveContainer) so a dashboard panel and a rendered video
 * frame agree on geometry.
 */
export function useElementWidth<T extends HTMLElement>(initial = 640) {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(initial);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const measure = (value: number) => {
      if (value > 0) setWidth(Math.round(value));
    };

    measure(node.getBoundingClientRect().width);

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) measure(entry.contentRect.width);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, width };
}
