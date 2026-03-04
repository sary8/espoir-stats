export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-8 text-center text-sm text-neutral-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <nav className="flex justify-center gap-6 mb-4" aria-label="フッターナビゲーション">
          <a href="#overview" className="hover:text-white transition-colors">Overview</a>
          <a href="#players" className="hover:text-white transition-colors">Players</a>
          <a href="#games" className="hover:text-white transition-colors">Games</a>
        </nav>
        <p className="text-xs sm:text-sm"><span className="text-accent-orange font-semibold">ESPOIR</span> Stats Dashboard</p>
        <p className="mt-1 text-xs sm:text-sm">Season 2025-2026</p>
      </div>
    </footer>
  );
}
