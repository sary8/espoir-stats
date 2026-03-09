import { memo } from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  style?: React.CSSProperties;
}

export default memo(function GlassCard({ children, className = "", hover = false, style }: GlassCardProps) {
  return (
    <div
      className={`glass-card p-4 sm:p-6 ${hover ? "glass-card-hover" : ""} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
});
