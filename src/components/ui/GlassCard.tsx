"use client";

import { motion } from "framer-motion";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

const hoverEffect = { scale: 1.02, borderColor: "rgba(249,115,22,0.3)" };
const hoverTransition = { duration: 0.2 };

export default function GlassCard({ children, className = "", hover = false }: GlassCardProps) {
  return (
    <motion.div
      className={`glass-card p-6 ${className}`}
      whileHover={hover ? hoverEffect : undefined}
      transition={hoverTransition}
    >
      {children}
    </motion.div>
  );
}
