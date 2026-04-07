import { memo } from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "purple" | "blue" | "green" | "pink" | "cyan" | "yellow" | "red" | "orange";
}

const variants = {
  purple: "bg-purple-500/15 text-purple-300 border-purple-500/20",
  blue: "bg-cyan-500/15 text-cyan-300 border-cyan-500/20",
  green: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
  pink: "bg-rose-500/15 text-rose-300 border-rose-500/20",
  cyan: "bg-sky-500/15 text-sky-300 border-sky-500/20",
  yellow: "bg-amber-400/15 text-amber-300 border-amber-400/20",
  red: "bg-red-500/15 text-red-300 border-red-500/20",
  orange: "bg-orange-500/15 text-orange-300 border-orange-500/20",
};

export default memo(function Badge({ children, variant = "purple" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${variants[variant]}`}>
      {children}
    </span>
  );
});
