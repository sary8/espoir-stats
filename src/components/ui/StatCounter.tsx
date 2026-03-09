"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useInView, useReducedMotion } from "framer-motion";

interface StatCounterProps {
  end: number;
  decimals?: number;
  suffix?: string;
  duration?: number;
  className?: string;
}

export default function StatCounter({ end, decimals = 0, suffix = "", duration = 1.5, className = "" }: StatCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const prefersReducedMotion = useReducedMotion();
  const finalValue = useMemo(() => end.toFixed(decimals), [end, decimals]);
  const [display, setDisplay] = useState(() => prefersReducedMotion ? finalValue : "0");

  useEffect(() => {
    if (!isInView || prefersReducedMotion) return;

    let rafId: number;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * end;
      setDisplay(current.toFixed(decimals));
      if (progress < 1) rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [isInView, end, decimals, duration, prefersReducedMotion]);

  return (
    <span ref={ref} className={className}>
      {display}{suffix}
    </span>
  );
}
