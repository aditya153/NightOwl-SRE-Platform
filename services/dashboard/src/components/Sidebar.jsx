import { useTheme } from '../context/ThemeContext';

export default function Sidebar() {
  const location = window.location.pathname;
  const { isDark } = useTheme();

  return (
    <aside className={`hidden md:flex fixed left-0 top-0 h-full w-64 flex-col py-8 px-4 gap-y-6 z-50 slide-in-left ${isDark ? 'bg-[#0E0E0E] shadow-[40px_0_40px_rgba(0,0,0,0.4)]' : 'bg-white shadow-[4px_0_20px_rgba(0,0,0,0.08)] border-r border-outline-variant/20'}`}>
      <div className="flex items-center gap-3 px-4 mb-4">
        <div className="w-8 h-8 bg-white flex items-center justify-center rounded-sm">
          <span className="material-symbols-outlined text-black text-xl" style={{fontVariationSettings: "'FILL' 1"}}>visibility</span>
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tighter text-white uppercase leading-none font-headline">NightOwl</h1>
          <p className="text-[10px] text-on-surface-variant font-mono tracking-widest uppercase mt-1">Incident Command</p>
        </div>
      </div>
      
      <nav className="flex flex-col gap-y-1">
        <a href="/" className={`rounded-md px-4 py-2 font-bold flex items-center gap-3 transition-all duration-100 hover-scale ${location === '/' ? 'text-white bg-[#2A2A2A]' : 'text-[#C6C6C6] hover:text-white hover:bg-[#1C1B1B]'}`}>
          <span className="material-symbols-outlined text-sm">dashboard</span>
          <span className="font-sans font-medium text-sm tracking-tight">Dashboard</span>
        </a>
        <a href="/incidents" className={`rounded-md px-4 py-2 flex items-center gap-3 transition-all duration-100 hover-scale ${location === '/incidents' ? 'text-white bg-[#2A2A2A] font-bold' : 'text-[#C6C6C6] hover:text-white hover:bg-[#1C1B1B] font-medium'}`}>
          <span className="material-symbols-outlined text-sm">warning</span>
          <span className="font-sans text-sm tracking-tight">Incidents</span>
        </a>
        <a href="/agents" className={`rounded-md px-4 py-2 flex items-center gap-3 transition-all duration-100 hover-scale ${location === '/agents' ? 'text-white bg-[#2A2A2A] font-bold' : 'text-[#C6C6C6] hover:text-white hover:bg-[#1C1B1B] font-medium'}`}>
          <span className="material-symbols-outlined text-sm">smart_toy</span>
          <span className="font-sans text-sm tracking-tight">Agents</span>
        </a>
        <a href="/logs" className={`rounded-md px-4 py-2 flex items-center gap-3 transition-all duration-100 hover-scale ${location === '/logs' ? 'text-white bg-[#2A2A2A] font-bold' : 'text-[#C6C6C6] hover:text-white hover:bg-[#1C1B1B] font-medium'}`}>
          <span className="material-symbols-outlined text-sm">terminal</span>
          <span className="font-sans text-sm tracking-tight">Logs</span>
        </a>
        <a href="/settings" className={`rounded-md px-4 py-2 flex items-center gap-3 transition-all duration-100 hover-scale ${location === '/settings' ? 'text-white bg-[#2A2A2A] font-bold' : 'text-[#C6C6C6] hover:text-white hover:bg-[#1C1B1B] font-medium'}`}>
          <span className="material-symbols-outlined text-sm">settings</span>
          <span className="font-sans text-sm tracking-tight">Settings</span>
        </a>
      </nav>
      
      <div className="mt-auto px-4 py-4 flex items-center gap-3 border-t border-outline-variant/10">
        <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-container-high border border-outline-variant/20">
          <img alt="User Profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD1kL32nm4QQT36JYrf9QB8vg0_klrTvRauf_xhOMa3Njme27gcmlbhsd9lPX6us_S-kfDvPMbitoU6EaJy9dns_frSbVPwZdHPeq1L1y2yZVL5XuPkRuGh1BrHeA6zZmFtIxR_-UgAwZ3XB1E_4bxLCvtZyfKxlFx3PTMG0nt23qTL0CZjfPARcqgC2Z24yJNh_Z8kMWY2Zt5k7bOi8tjF19Hao7WACQ3GvWZdOEP9oOt4sMHXOasxSUqd_qybVkSBZHX-X-kLG-bU"/>
        </div>
        <div className="overflow-hidden">
          <p className="text-xs font-bold text-white truncate font-sans">alex.dev</p>
          <p className="text-[10px] text-on-surface-variant truncate font-sans">Lead SRE</p>
        </div>
      </div>
    </aside>
  );
}
