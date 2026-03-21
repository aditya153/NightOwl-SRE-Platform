export default function TopNav() {
  return (
    <header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-16 bg-[#131313]/90 backdrop-blur-xl flex items-center justify-between px-8 z-40 border-b border-surface-container-high">
      <div className="flex items-center gap-4">
        <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">System Status</span>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary neon-glow-primary"></span>
          <span className="text-sm font-medium text-white font-sans">All Engines Nominal</span>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="relative group flex items-center">
          <span className="absolute left-3 material-symbols-outlined text-on-surface-variant text-sm">search</span>
          <input className="bg-surface-container-highest text-sm rounded-md border-none focus:outline-none focus:ring-1 focus:ring-tertiary/20 pl-10 pr-4 py-1.5 w-64 transition-all text-white placeholder-on-surface-variant/50 font-sans" placeholder="Search incidents, logs..." type="text"/>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-[#C6C6C6] hover:text-white transition-opacity">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="text-[#C6C6C6] hover:text-white transition-opacity">
            <span className="material-symbols-outlined">help_outline</span>
          </button>
          <button className="bg-primary text-on-primary font-bold text-xs px-4 py-2 rounded-md hover:opacity-90 transition-opacity font-sans cursor-pointer">
            NEW INCIDENT
          </button>
        </div>
      </div>
    </header>
  );
}
