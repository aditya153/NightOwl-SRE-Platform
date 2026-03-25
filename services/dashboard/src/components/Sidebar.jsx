import { useTheme } from '../context/ThemeContext';

export default function Sidebar() {
  const location = window.location.pathname;
  const { isDark } = useTheme();

  const links = [
    { href: '/', label: 'Dashboard', icon: 'dashboard' },
    { href: '/incidents', label: 'Incidents', icon: 'warning' },
    { href: '/agents', label: 'Agents', icon: 'smart_toy' },
    { href: '/logs', label: 'Logs', icon: 'terminal' },
    { href: '/settings', label: 'Settings', icon: 'settings' },
  ];

  const isActive = (href) => {
    if (href === '/') return location === '/';
    return location.startsWith(href);
  };

  return (
    <aside className={`hidden md:flex w-60 flex-col shrink-0 border-r ${isDark ? 'bg-surface-container-lowest border-outline-variant/10' : 'bg-white border-outline-variant/30'}`}>
      <div className="p-5 pb-4">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-md flex items-center justify-center ${isDark ? 'bg-white' : 'bg-on-surface'}`}>
            <span className={`material-symbols-outlined text-lg ${isDark ? 'text-black' : 'text-white'}`} style={{fontVariationSettings: "'FILL' 1"}}>visibility</span>
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-on-surface uppercase leading-none font-headline">NightOwl</h1>
            <p className="text-[11px] text-on-surface-variant font-mono tracking-wide uppercase mt-0.5">Incident Command</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive(link.href)
                ? `text-on-surface font-semibold ${isDark ? 'bg-surface-container-high' : 'bg-surface-container-high'}`
                : `text-on-surface-variant ${isDark ? 'hover:bg-surface-container-high/50 hover:text-on-surface' : 'hover:bg-surface-container-high hover:text-on-surface'}`
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">{link.icon}</span>
            <span>{link.label}</span>
          </a>
        ))}
      </nav>

      <div className={`mx-3 mb-4 p-3 rounded-lg flex items-center gap-3 ${isDark ? 'bg-surface-container-low' : 'bg-surface-container'}`}>
        <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-container-high border border-outline-variant/20">
          <img alt="User" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD1kL32nm4QQT36JYrf9QB8vg0_klrTvRauf_xhOMa3Njme27gcmlbhsd9lPX6us_S-kfDvPMbitoU6EaJy9dns_frSbVPwZdHPeq1L1y2yZVL5XuPkRuGh1BrHeA6zZmFtIxR_-UgAwZ3XB1E_4bxLCvtZyfKxlFx3PTMG0nt23qTL0CZjfPARcqgC2Z24yJNh_Z8kMWY2Zt5k7bOi8tjF19Hao7WACQ3GvWZdOEP9oOt4sMHXOasxSUqd_qybVkSBZHX-X-kLG-bU"/>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-on-surface truncate">alex.dev</p>
          <p className="text-[11px] text-on-surface-variant truncate">Lead SRE</p>
        </div>
      </div>
    </aside>
  );
}
