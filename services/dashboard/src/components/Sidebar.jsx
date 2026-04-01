export default function Sidebar() {
  const location = window.location.pathname;

  const overviewLinks = [
    { href: '/', label: 'Dashboard', icon: 'dashboard' },
    { href: '/incidents', label: 'Incidents', icon: 'warning', badge: 3 },
  ];

  const systemLinks = [
    { href: '/agents', label: 'Agents', icon: 'smart_toy' },
    { href: '/logs', label: 'Logs', icon: 'terminal' },
    { href: '/settings', label: 'Settings', icon: 'settings' },
  ];

  const isActive = (href) => {
    if (href === '/') return location === '/';
    return location.startsWith(href);
  };

  const renderLink = (link) => (
    <a
      key={link.href}
      href={link.href}
      className={`flex items-center gap-[10px] py-[9px] px-[10px] rounded-[6px] cursor-pointer text-[13.5px] font-medium transition-all no-underline relative ${
        isActive(link.href)
          ? 'text-accent2'
          : 'text-text2 hover:text-text hover:bg-bg4'
      }`}
      style={isActive(link.href) ? { background: 'var(--color-accent-glow)' } : {}}
    >
      {isActive(link.href) && (
        <span className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-[3px] h-[20px] bg-accent rounded-r-[3px]" />
      )}
      <span className="material-symbols-outlined text-[18px]">{link.icon}</span>
      {link.label}
      {link.badge && (
        <span className="ml-auto bg-red text-white text-[10px] font-semibold px-[6px] py-[2px] rounded-[10px]" style={{ fontFamily: 'var(--font-mono)' }}>
          {link.badge}
        </span>
      )}
    </a>
  );

  return (
    <aside className="w-[220px] shrink-0 bg-bg2 border-r border-border flex flex-col overflow-hidden z-10">
      <div className="flex items-center gap-[10px] px-4 pt-5 pb-[18px] border-b border-border">
        <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[18px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>visibility</span>
        </div>
        <div className="leading-none">
          <div className="text-[16px] font-[800] tracking-[0.04em] text-text" style={{ fontFamily: 'var(--font-head)' }}>NightOwl</div>
          <div className="text-[9px] text-text3 tracking-[0.12em] uppercase mt-[3px]" style={{ fontFamily: 'var(--font-mono)' }}>Incident Command</div>
        </div>
      </div>

      <nav className="flex-1 px-2 py-3 overflow-y-auto">
        <div className="mb-5">
          <div className="text-[9px] tracking-[0.14em] uppercase text-text3 px-2 mb-1 font-medium" style={{ fontFamily: 'var(--font-mono)' }}>Overview</div>
          {overviewLinks.map(renderLink)}
        </div>
        <div className="mb-5">
          <div className="text-[9px] tracking-[0.14em] uppercase text-text3 px-2 mb-1 font-medium" style={{ fontFamily: 'var(--font-mono)' }}>System</div>
          {systemLinks.map(renderLink)}
        </div>
      </nav>

      <div className="px-3 py-3 border-t border-border flex items-center gap-[10px]">
        <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0" style={{ background: 'linear-gradient(135deg, var(--color-accent), #8b5cf6)' }}>
          AD
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="text-[12.5px] font-semibold text-text truncate">alex.dev</div>
          <div className="text-[10px] text-text3" style={{ fontFamily: 'var(--font-mono)' }}>Lead SRE</div>
        </div>
        <span className="material-symbols-outlined text-[16px] text-text3 cursor-pointer">more_vert</span>
      </div>
    </aside>
  );
}
