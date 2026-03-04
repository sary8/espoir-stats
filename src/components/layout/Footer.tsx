export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-8 text-center text-sm text-neutral-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <nav className="flex justify-center gap-6 mb-4" aria-label="フッターナビゲーション">
          <a href="#overview" className="hover:text-white transition-colors">Overview</a>
          <a href="#players" className="hover:text-white transition-colors">Players</a>
          <a href="#games" className="hover:text-white transition-colors">Games</a>
        </nav>
        <p><span className="text-accent-orange font-semibold">ESPOIR</span> Basketball Stats Dashboard</p>
        <p className="mt-1">Season 2025-2026</p>
      </div>
    </footer>
  );
}
