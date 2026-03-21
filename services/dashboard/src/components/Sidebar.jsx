import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const location = window.location.pathname; // using simple routing for now

  return (
    <aside className="w-64 h-screen bg-[#0e0e0e] border-r border-[#1c1b1b] flex flex-col font-sans tracking-tight z-50">
      <div className="p-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#e5e2e1] tracking-[-0.02em] flex items-center gap-2">
            <span className="text-[#3b82f6]">Night</span>Owl
          </h1>
          <p className="text-[10px] text-[#5d5f5f] uppercase tracking-widest font-display mt-1">Autonomous SRE</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        <div className="mb-6 px-4 text-[10px] text-[#5d5f5f] uppercase tracking-widest font-display">Command Center</div>
        
        <Link to="/" className={`flex items-center gap-3 px-4 py-2.5 rounded-sm transition-colors text-sm font-medium ${location === '/' ? 'bg-[#1c1b1b] text-[#ffffff] border-l-2 border-[#3b82f6]' : 'text-[#c6c6c6] hover:bg-[#131313] hover:text-[#e5e2e1] border-l-2 border-transparent'}`}>
          Overview
        </Link>
        
        <Link to="/incidents" className={`flex items-center gap-3 px-4 py-2.5 rounded-sm transition-colors text-sm font-medium ${location === '/incidents' ? 'bg-[#1c1b1b] text-[#ffffff] border-l-2 border-[#3b82f6]' : 'text-[#c6c6c6] hover:bg-[#131313] hover:text-[#e5e2e1] border-l-2 border-transparent'}`}>
          Incidents <span className="ml-auto bg-[#3b82f6]/20 text-[#4d8eff] py-0.5 px-2 rounded-sm text-[10px] font-mono">12</span>
        </Link>
        
        <Link to="/agents" className={`flex items-center gap-3 px-4 py-2.5 rounded-sm transition-colors text-sm font-medium ${location === '/agents' ? 'bg-[#1c1b1b] text-[#ffffff] border-l-2 border-[#3b82f6]' : 'text-[#c6c6c6] hover:bg-[#131313] hover:text-[#e5e2e1] border-l-2 border-transparent'}`}>
          AI Agents
        </Link>
      </nav>

      <div className="p-8 mb-4">
        <div className="bg-[#131313] border border-[#1c1b1b] rounded-sm p-4 text-center">
          <p className="text-[#5d5f5f] text-xs font-mono mb-2">System Status</p>
          <div className="flex items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#4ade80] shadow-[0_0_8px_#4ade80]"></div>
            <span className="text-[#e5e2e1] text-xs font-bold uppercase tracking-wider font-display">Healthy</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
