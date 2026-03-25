import { useTheme } from '../context/ThemeContext';

export default function TopNav() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className={`fixed top-0 right-0 w-full md:w-[calc(100%-16rem)] h-16 backdrop-blur-xl flex items-center justify-between px-4 md:px-8 z-40 border-b border-outline-variant/10 fade-in ${isDark ? 'bg-[#131313]/90' : 'bg-white/90'}`}>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-full border border-primary/20">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse neon-glow-primary"></span>
          <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] font-sans">Live Stream Active</span>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="relative group flex items-center">
          <span className="absolute left-3 material-symbols-outlined text-on-surface-variant text-sm">search</span>
          <input className="bg-surface-container-highest text-sm rounded-md border-none focus:outline-none focus:ring-1 focus:ring-tertiary/20 pl-10 pr-4 py-1.5 w-64 transition-all text-on-surface placeholder-on-surface-variant/50 font-sans" placeholder="Search incidents, logs..." type="text"/>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="text-[#C6C6C6] hover:text-on-surface transition-colors hover-scale" title="Toggle Theme">
            <span className="material-symbols-outlined">{isDark ? 'light_mode' : 'dark_mode'}</span>
          </button>
          <button className="text-[#C6C6C6] hover:text-on-surface transition-colors hover-scale">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="text-[#C6C6C6] hover:text-on-surface transition-colors hover-scale">
            <span className="material-symbols-outlined">help_outline</span>
          </button>
          <button className="bg-primary text-on-primary font-bold text-xs px-4 py-2 rounded-md hover:opacity-90 transition-all font-sans cursor-pointer hover-lift">
            NEW INCIDENT
          </button>
        </div>
      </div>
    </header>
  );
}
