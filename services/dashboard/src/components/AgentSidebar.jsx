import { useState } from 'react';

const mockAgents = [
  { name: 'Triage Agent', status: 'IDLE', lastAction: 'Classified INC-9040 as MEDIUM', time: '1 hr ago', color: 'bg-[#5d5f5f] shadow-[0_0_8px_#5d5f5f]' },
  { name: 'Log Analyst', status: 'ANALYZING', lastAction: 'Parsing Java stack trace in TransactionHandler...', time: 'Now', color: 'bg-[#3b82f6] shadow-[0_0_8px_#3b82f6] animate-pulse' },
  { name: 'Correlator', status: 'WAITING', lastAction: 'Waiting for log analysis', time: '2 mins ago', color: 'bg-[#fcd34d] shadow-[0_0_12px_#fcd34d]' },
  { name: 'Fixer Agent', status: 'IDLE', lastAction: 'Restarted api-gateway pod', time: '10 mins ago', color: 'bg-[#4ade80] shadow-[0_0_8px_#4ade80]' }
];

export default function AgentSidebar({ isOpen, setIsOpen }) {
  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed top-6 right-6 p-3 bg-[#131313] border border-[#2a2a2a] rounded-sm hover:bg-[#1c1b1b] transition-colors shadow-2xl z-50 text-[#3b82f6]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
      </button>
    );
  }

  return (
    <aside className="w-80 h-screen bg-[#0e0e0e]/95 backdrop-blur-[20px] border-l border-[#1c1b1b] p-6 flex flex-col z-40 fixed right-0 top-0 font-sans shadow-2xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <p className="text-[#5d5f5f] text-[10px] uppercase tracking-widest font-display mb-1">Live Feed</p>
          <h2 className="text-sm font-bold text-[#e5e2e1] flex items-center gap-2 tracking-wide">
            <div className="w-1.5 h-1.5 rounded-full bg-[#4ade80] shadow-[0_0_8px_#4ade80] animate-pulse"></div>
            Agent Status
          </h2>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-[#5d5f5f] hover:text-[#e5e2e1] transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pr-2">
        {mockAgents.map((agent, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="flex justify-between items-end">
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${agent.color}`}></div>
                <h3 className="font-semibold text-[#c6c6c6] text-xs">{agent.name}</h3>
              </div>
              <span className="text-[10px] font-mono text-[#5d5f5f]">{agent.time}</span>
            </div>
            
            <div className="bg-[#131313] border border-[#1c1b1b] rounded-sm p-3">
              <span className="text-[10px] font-display uppercase tracking-widest text-[#5d5f5f] mb-2 block">{agent.status}</span>
              <p className="text-[11px] text-[#e5e2e1] leading-relaxed font-mono">
                {agent.lastAction}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-6 border-t border-[#1c1b1b]">
         <div className="text-[10px] text-[#919191] space-y-2 font-mono bg-[#131313] p-4 rounded-sm">
            <div className="flex justify-between"><span>CPU Load</span> <span className="text-[#4ade80]">14%</span></div>
            <div className="flex justify-between"><span>Kafka</span> <span className="text-[#fcd34d]">2 Events</span></div>
            <div className="flex justify-between"><span>Latency</span> <span className="text-[#4ade80]">12ms</span></div>
         </div>
      </div>
    </aside>
  );
}
