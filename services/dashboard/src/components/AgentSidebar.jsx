const agents = [
  {
    name: 'Triage Bot',
    role: 'L7 Pattern Matcher',
    icon: 'robot',
    thoughts: [
      'Scanning API logs for stack traces...',
      '404/500 density threshold exceeded',
      'Routing to Network Engine...',
    ],
  },
  {
    name: 'Log Analyst',
    role: 'NLP Root Cause',
    icon: 'analytics',
    thoughts: [
      'Identifying memory leak patterns...',
      'Heap size growth: +4.2GB/min',
      'GC cycle failure detected in svc-01',
    ],
  },
  {
    name: 'Correlator',
    role: 'Graph Logic',
    icon: 'hub',
    thoughts: [
      'Correlating with incident #124...',
      'Cluster deploy dependency: 92%',
      'Action: Rollback v2.4.1',
    ],
  },
];

export default function AgentSidebar({ setIsOpen }) {
  return (
    <aside className="hidden lg:flex w-72 shrink-0 flex-col border-l border-outline-variant/10 bg-surface-container-lowest overflow-y-auto">
      <div className="p-4 flex items-center justify-between border-b border-outline-variant/10">
        <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">Live Agents</h3>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            Active
          </span>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4">
        {agents.map((agent, i) => (
          <div key={i} className="rounded-lg border border-outline-variant/10 overflow-hidden">
            <div className="flex items-center gap-3 p-3">
              <div className="w-7 h-7 rounded-md bg-surface-container-high flex items-center justify-center">
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant" style={{fontVariationSettings: "'FILL' 1"}}>{agent.icon}</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-on-surface leading-tight">{agent.name}</p>
                <p className="text-[11px] text-on-surface-variant">{agent.role}</p>
              </div>
              <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
            <div className="bg-surface-container-low/50 px-3 py-2 font-mono text-[11px] text-emerald-400 leading-relaxed border-t border-outline-variant/5">
              {agent.thoughts.map((thought, idx) => (
                <p key={idx} className="truncate">&gt; {thought}</p>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-outline-variant/10">
        <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-3">System Health</p>
        <div className="grid grid-cols-8 gap-1">
          {[...Array(16)].map((_, i) => (
            <div
              key={i}
              className={`aspect-square rounded-sm ${i === 2 || i === 6 ? 'bg-red-500' : i === 13 ? 'bg-blue-500' : 'bg-emerald-500/70'}`}
            ></div>
          ))}
        </div>
      </div>
    </aside>
  );
}
