"use client";

import { memo } from "react";
import { motion } from "framer-motion";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

const hoverEffect = { borderColor: "rgba(255,255,255,0.18)", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" };
const hoverTransition = { duration: 0.2 };

export default memo(function GlassCard({ children, className = "", hover = false }: GlassCardProps) {
  return (
    <motion.div
      className={`glass-card p-4 sm:p-6 ${className}`}
      whileHover={hover ? hoverEffect : undefined}
      transition={hoverTransition}
    >
      {children}
    </motion.div>
  );
});
