import { useTheme } from '../context/ThemeContext';

export default function TopNav({ isAgentSidebarOpen, setIsAgentSidebarOpen }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className={`h-14 shrink-0 flex items-center justify-between px-6 border-b ${isDark ? 'bg-surface-container-lowest border-outline-variant/10' : 'bg-white border-outline-variant/30'}`}>
      <div className="flex items-center gap-3">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-500/10 text-emerald-600'}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Live
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative hidden sm:flex items-center">
          <span className="absolute left-3 material-symbols-outlined text-on-surface-variant text-[18px]">search</span>
          <input
            className={`text-sm rounded-lg pl-10 pr-4 py-2 w-56 transition-all text-on-surface placeholder-on-surface-variant/50 font-sans border-none outline-none focus:ring-2 focus:ring-tertiary-container/30 ${isDark ? 'bg-surface-container-high' : 'bg-surface-container'}`}
            placeholder="Search..."
            type="text"
          />
        </div>
        <button onClick={toggleTheme} className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors" title="Toggle Theme">
          <span className="material-symbols-outlined text-[20px]">{isDark ? 'light_mode' : 'dark_mode'}</span>
        </button>
        <button className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors">
          <span className="material-symbols-outlined text-[20px]">notifications</span>
        </button>
        <button
          onClick={() => setIsAgentSidebarOpen(!isAgentSidebarOpen)}
          className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
          title="Toggle Agent Panel"
        >
          <span className="material-symbols-outlined text-[20px]">smart_toy</span>
        </button>
        <button className={`ml-2 text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${isDark ? 'bg-white text-black hover:bg-white/90' : 'bg-on-surface text-white hover:bg-on-surface/90'}`}>
          New Incident
        </button>
      </div>
    </header>
  );
}
