const agents = [
  {
    name: 'Triage Bot',
    role: 'L7 Pattern Matcher',
    icon: 'robot',
    colorClass: 'icon-purple',
    thoughts: [
      'Scanning API logs for stack traces',
      '> 404/500 density threshold exceeded',
      '> Routing to Network Engine...',
    ],
  },
  {
    name: 'Log Analyst',
    role: 'NLP Root Cause',
    icon: 'analytics',
    colorClass: 'icon-teal',
    thoughts: [
      'Heap growth: +4.2GB/min detected',
      '> Identifying memory leak patterns',
      '> GC cycle failure in svc-01',
    ],
  },
  {
    name: 'Correlator',
    role: 'Graph Logic',
    icon: 'hub',
    colorClass: 'icon-orange',
    thoughts: [
      'Action: Rollback v2.4.1 -> v2.3.9',
      '> Correlating with incident #124',
      '> Deploy dependency: 92% match',
    ],
  },
  {
    name: 'Fixer Agent',
    role: 'Remediation',
    icon: 'build',
    colorClass: 'icon-blue',
    thoughts: [
      'Awaiting compliance review...',
      '> Preparing rollback manifest',
      '> Risk level: LOW',
    ],
    isPending: true,
  },
  {
    name: 'Compliance',
    role: 'SOC2 Enforcer',
    icon: 'security',
    colorClass: 'icon-pink',
    thoughts: [],
    isIdle: true,
  },
];

const iconStyles = {
  'icon-purple': { background: 'rgba(139,92,246,0.15)', color: '#a78bfa' },
  'icon-teal': { background: 'rgba(20,184,166,0.12)', color: '#2dd4bf' },
  'icon-orange': { background: 'rgba(249,115,22,0.12)', color: '#fb923c' },
  'icon-blue': { background: 'rgba(59,130,246,0.12)', color: '#60a5fa' },
  'icon-pink': { background: 'rgba(236,72,153,0.12)', color: '#f472b6' },
};

export default function AgentSidebar({ setIsOpen }) {
  const healthData = [1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 2, 1, 1];
  const healthColors = { 0: 'var(--color-red)', 1: 'rgba(16,185,129,0.6)', 2: 'var(--color-blue)' };

  return (
    <aside className="w-[280px] shrink-0 bg-bg2 border-l border-border flex flex-col overflow-hidden">
      <div className="px-4 py-[14px] border-b border-border flex items-center justify-between">
        <span className="text-[10px] tracking-[0.14em] uppercase text-text2 font-semibold" style={{ fontFamily: 'var(--font-mono)' }}>Live Agents</span>
        <div className="flex items-center gap-[5px] text-[10px] text-green font-semibold" style={{ fontFamily: 'var(--font-mono)' }}>
          <div className="live-dot" style={{ width: '5px', height: '5px' }} />
          Active
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {agents.map((agent, i) => {
          const style = iconStyles[agent.colorClass] || {};
          return (
            <div
              key={i}
              className="bg-bg3 border border-border rounded-[10px] overflow-hidden transition-[border-color] duration-150 hover:border-border2"
              style={agent.isIdle ? { opacity: 0.5 } : agent.isPending ? { borderColor: 'rgba(91,106,240,0.2)' } : {}}
            >
              <div className="flex items-center gap-[10px] p-[10px_12px]">
                <div className="w-7 h-7 rounded-[6px] flex items-center justify-center shrink-0" style={style}>
                  <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1", color: style.color }}>
                    {agent.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] font-semibold text-text">{agent.name}</div>
                  <div className="text-[10px] text-text3" style={{ fontFamily: 'var(--font-mono)' }}>{agent.role}</div>
                </div>
                <div
                  className="w-[7px] h-[7px] rounded-full shrink-0"
                  style={
                    agent.isIdle
                      ? { background: 'var(--color-text3)' }
                      : agent.isPending
                      ? { background: 'var(--color-accent2)', boxShadow: '0 0 5px var(--color-accent)' }
                      : { background: 'var(--color-green)', boxShadow: '0 0 5px var(--color-green)' }
                  }
                />
              </div>
              {agent.thoughts.length > 0 && (
                <div
                  className="px-3 py-2 border-t border-border text-[10.5px] leading-[1.7]"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    background: 'rgba(0,0,0,0.3)',
                    color: agent.isPending ? 'var(--color-accent2)' : 'var(--color-green)',
                  }}
                >
                  {agent.thoughts.map((t, idx) => (
                    <div key={idx} className="truncate" style={idx === 0 ? { opacity: 1, color: agent.isPending ? 'var(--color-text2)' : 'var(--color-text)' } : { opacity: 0.7 }}>
                      {t}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-3 border-t border-border">
        <div className="text-[9px] tracking-[0.12em] uppercase text-text3 mb-2" style={{ fontFamily: 'var(--font-mono)' }}>System Health Map</div>
        <div className="grid grid-cols-8 gap-[3px]">
          {healthData.map((v, i) => (
            <div
              key={i}
              className="aspect-square rounded-[3px]"
              style={{
                background: healthColors[v],
                boxShadow: v === 0 ? '0 0 4px var(--color-red)' : 'none',
              }}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}
