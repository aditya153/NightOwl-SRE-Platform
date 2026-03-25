import { useState } from 'react';

const mockAgents = [
  { 
    name: 'Triage Bot', 
    role: 'L7 Pattern Matcher', 
    status: 'ACTIVE', 
    icon: 'robot',
    colorClass: 'text-tertiary bg-tertiary-container/20',
    thoughts: [
      '> Scanning API logs for stack traces...',
      '> 404/500 density threshold exceeded',
      '> Routing to Network Engine...'
    ],
    statusColor: 'bg-[#00FF41] shadow-[0_0_8px_#00FF41]'
  },
  { 
    name: 'Log Analyst', 
    role: 'NLP Root Cause', 
    status: 'ACTIVE', 
    icon: 'analytics',
    colorClass: 'text-white bg-surface-container-highest',
    thoughts: [
      '> Identifying memory leak patterns...',
      '> Heap size growth: +4.2GB/min',
      '> GC cycle failure detected in svc-01'
    ],
    statusColor: 'bg-[#00FF41] shadow-[0_0_8px_#00FF41]'
  },
  { 
    name: 'Correlator', 
    role: 'Graph Logic', 
    status: 'ACTIVE', 
    icon: 'hub',
    colorClass: 'text-error bg-error-container/20',
    thoughts: [
      '> Correlating with previous incident #124...',
      '> Cluster deploy dependency match: 92%',
      '> Recommended Action: Rollback v2.4.1'
    ],
    statusColor: 'bg-[#00FF41] shadow-[0_0_8px_#00FF41]'
  }
];

export default function AgentSidebar({ isOpen, setIsOpen }) {
  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="absolute top-6 right-6 p-3 bg-surface border border-outline-variant/20 rounded-sm hover:bg-surface-container-high transition-colors shadow-2xl z-50 text-tertiary"
      >
        <span className="material-symbols-outlined">first_page</span>
      </button>
    );
  }

  return (
    <aside className="w-80 shrink-0 bg-surface-container-lowest flex flex-col p-6 gap-y-8 overflow-y-auto border-l border-outline-variant/10 relative transition-all duration-300 z-30 slide-in-right">
      <button 
        onClick={() => setIsOpen(false)}
        className="absolute top-4 right-4 text-on-surface-variant hover:text-white transition-colors"
      >
        <span className="material-symbols-outlined text-sm">last_page</span>
      </button>

      <div className="flex items-center justify-between mt-2">
        <h3 className="font-label text-xs uppercase tracking-[0.2em] text-white">Live Agents</h3>
        <span className="flex items-center gap-1.5 bg-tertiary-container/10 text-tertiary px-2 py-0.5 rounded-full text-[10px] font-bold">
          <span className="w-1 h-1 bg-tertiary rounded-full animate-ping"></span>
          ACTIVE
        </span>
      </div>

      <div className="space-y-6 flex-1">
        {mockAgents.map((agent, i) => (
          <div key={i} className="bg-surface-container-low/50 p-4 rounded-lg border border-outline-variant/5 hover-lift hover-glow slide-up">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-8 h-8 rounded-md flex items-center justify-center ${agent.colorClass}`}>
                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>{agent.icon}</span>
              </div>
              <div>
                <p className="text-xs font-bold text-white font-sans">{agent.name}</p>
                <p className="text-[10px] text-on-surface-variant tracking-wide font-sans">{agent.role}</p>
              </div>
              <div className={`ml-auto w-2 h-2 rounded-full ${agent.statusColor}`}></div>
            </div>
            <div className="bg-surface-container-lowest p-3 rounded font-mono text-[10px] text-[#00FF41] leading-relaxed">
              <p className="opacity-50 text-[8px] mb-1 uppercase tracking-widest text-[#00FF41]">Thought Stream</p>
              {agent.thoughts.map((thought, idx) => (
                <p key={idx} className={i === 2 && idx === 2 ? 'text-error font-bold' : ''}>{thought}</p>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto bg-surface-container-high/40 p-4 rounded-lg">
        <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-3">System Health Map</p>
        <div className="grid grid-cols-8 gap-1.5">
          {[...Array(16)].map((_, i) => (
            <div 
              key={i} 
              className={`aspect-square rounded-sm ${i === 2 || i === 6 ? 'bg-error neon-glow-error' : i === 13 ? 'bg-tertiary' : 'bg-[#00FF41] opacity-80'}`}
            ></div>
          ))}
        </div>
      </div>
    </aside>
  );
}
