import { memo } from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default memo(function GlassCard({ children, className = "", hover = false }: GlassCardProps) {
  return (
    <div
      className={`glass-card p-4 sm:p-6 ${hover ? "glass-card-hover" : ""} ${className}`}
    >
      {children}
    </div>
  );
});
