import { useState } from 'react';

const mockAgents = [
  { name: 'Triage Agent', status: 'IDLE', lastAction: 'Classified INC-9040 as MEDIUM', time: '1 hr ago', color: 'bg-owl-muted' },
  { name: 'Log Analyst', status: 'ANALYZING', lastAction: 'Parsing Java stack trace...', time: 'Now', color: 'bg-owl-purple animate-pulse' },
  { name: 'Correlator', status: 'WAITING', lastAction: 'Waiting for log analysis', time: '2 mins ago', color: 'bg-owl-yellow' },
  { name: 'Fixer Agent', status: 'IDLE', lastAction: 'Restarted api-gateway pod', time: '10 mins ago', color: 'bg-owl-green' }
];

export default function AgentSidebar({ isOpen, setIsOpen }) {
  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed top-6 right-6 p-3 bg-owl-surface border border-owl-border rounded-full hover:bg-owl-bg transition-colors shadow-lg shadow-black/50 z-50 text-owl-purple"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
      </button>
    );
  }

  return (
    <aside className="w-80 h-screen bg-owl-surface border-l border-owl-border p-6 flex flex-col z-40 fixed right-0 top-0">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-owl-text flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-owl-green animate-pulse"></div>
          Live Agent Status
        </h2>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-owl-muted hover:text-owl-text transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {mockAgents.map((agent, i) => (
          <div key={i} className="p-4 bg-owl-bg/50 border border-owl-border rounded-xl">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-owl-text text-sm">{agent.name}</h3>
              <span className="text-[10px] font-mono text-owl-muted">{agent.time}</span>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-2 h-2 rounded-full ${agent.color}`}></div>
              <span className="text-xs font-medium text-owl-muted tracking-wide">{agent.status}</span>
            </div>
            <p className="text-sm text-owl-muted leading-relaxed font-mono bg-black/20 p-2 rounded border border-owl-border/50">
              {agent.lastAction}
            </p>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-owl-border/50">
         <div className="text-xs text-owl-muted space-y-1 font-mono">
            <div className="flex justify-between"><span>System Load:</span> <span className="text-owl-green">14%</span></div>
            <div className="flex justify-between"><span>Kafka Queue:</span> <span className="text-owl-yellow">2 Events</span></div>
            <div className="flex justify-between"><span>DB Latency:</span> <span className="text-owl-green">12ms</span></div>
         </div>
      </div>
    </aside>
  );
}
