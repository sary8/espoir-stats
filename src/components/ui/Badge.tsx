interface BadgeProps {
  children: React.ReactNode;
  variant?: "purple" | "blue" | "green";
}

const variants = {
  purple: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  green: "bg-green-500/20 text-green-400 border-green-500/30",
};

export default function Badge({ children, variant = "purple" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]}`}>
      {children}
    </span>
  );
}
