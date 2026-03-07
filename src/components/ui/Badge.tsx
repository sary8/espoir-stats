import { memo } from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "purple" | "blue" | "green" | "pink" | "cyan" | "yellow" | "red" | "orange";
}

const variants = {
  purple: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  green: "bg-green-500/20 text-green-400 border-green-500/30",
  pink: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  cyan: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  yellow: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  red: "bg-red-500/20 text-red-400 border-red-500/30",
  orange: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

export default memo(function Badge({ children, variant = "purple" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]}`}>
      {children}
    </span>
  );
});
