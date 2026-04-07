"use client";

import { memo, useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

interface ProgressRingProps {
  percentage: number | null;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
}

export default memo(function ProgressRing({
  percentage,
  size = 80,
  strokeWidth = 6,
  color = "#A855F7",
  label,
}: ProgressRingProps) {
  const ref = useRef<SVGSVGElement>(null);
  const isInView = useInView(ref, { once: true });
  const prefersReducedMotion = useReducedMotion();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = percentage ?? 0;
  const offset = circumference - (pct / 100) * circumference;
  const displayValue = percentage !== null ? `${percentage.toFixed(1)}%` : "-";
  const ariaLabel = label ? `${label}: ${displayValue}` : displayValue;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg ref={ref} width={size} height={size} className="-rotate-90" role="img" aria-label={ariaLabel}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(168, 85, 247, 0.08)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: prefersReducedMotion ? offset : circumference }}
          animate={isInView ? { strokeDashoffset: offset } : { strokeDashoffset: circumference }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <span className="stat-number text-sm" style={{ color }}>
        {displayValue}
      </span>
      {label ? <span className="text-xs text-neutral-500">{label}</span> : null}
    </div>
  );
});
