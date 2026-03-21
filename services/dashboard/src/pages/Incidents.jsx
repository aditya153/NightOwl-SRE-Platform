import { useState } from 'react';

const mockIncidents = [
  { id: "NO-GRA-1422", title: "API Gateway OOMKilled", severity: "CRITICAL", status: "RESOLVED", agent: "Fixer Agent", time: "10m ago", root_cause: "TransactionHandler loop exceeded batch limits." },
  { id: "NO-GRA-1421", title: "Database CPU Spike", severity: "HIGH", status: "ANALYZING", agent: "Correlator", time: "25m ago", root_cause: "High volume of unindexed SELECT queries." },
  { id: "NO-GRA-1420", title: "Kafka Consumer Lag", severity: "MEDIUM", status: "OPEN", agent: "Triage", time: "1h ago", root_cause: "Pending" }
];

export default function Incidents() {
  const [incidents] = useState(mockIncidents);

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'CRITICAL': return 'text-[#ffb4ab] bg-[#93000a] shadow-[0_0_8px_#93000a]';
      case 'HIGH': return 'text-[#1a1c1c] bg-[#e2e2e2] shadow-[0_0_8px_#ffffff]'; // High contrast inverted
      case 'MEDIUM': return 'text-[#d8e2ff] bg-[#004395] shadow-[0_0_8px_#005ac2]'; // Deep blue
      default: return 'text-owl-muted bg-owl-focus';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'RESOLVED': return 'bg-[#e5e2e1]';
      case 'ANALYZING': return 'bg-[#4d8eff] animate-pulse';
      case 'OPEN': return 'bg-[#ffb4ab]';
      default: return 'bg-[#c6c6c6]';
    }
  };

  return (
    <div className="p-10 h-full max-h-screen overflow-y-auto font-sans tracking-tight">
      <div className="flex justify-between items-end mb-10">
        <div>
          <p className="text-[#8b949e] uppercase tracking-[0.05em] text-xs font-display mb-2">Observatory</p>
          <h1 className="text-4xl font-bold text-[#ffffff] tracking-[-0.02em]">Incident Master List</h1>
        </div>
        <div className="flex gap-4">
          <input 
            type="text" 
            placeholder="Search incident ID..." 
            className="px-5 py-2.5 bg-[#1c1b1b] text-[#e5e2e1] font-mono text-sm focus:outline-none focus:bg-[#353534] transition-colors placeholder-[#474747] w-64"
          />
        </div>
      </div>

      <div className="flex flex-col gap-[1px] bg-[#2a2a2a] p-[1px] rounded-sm">
        {/* Header Row */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-[#131313] text-[#c6c6c6] text-[11px] uppercase tracking-wider font-display shrink-0">
          <div className="col-span-2">Incident ID</div>
          <div className="col-span-4">Pattern / Root Cause</div>
          <div className="col-span-2">Severity</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 text-right">Time</div>
        </div>

        {/* Data Rows - Zebra Striping via surface_container variables */}
        <div className="flex flex-col gap-[1px]">
          {incidents.map((incident, i) => (
            <div 
              key={incident.id} 
              className={`grid grid-cols-12 gap-4 px-6 py-5 items-center group cursor-pointer transition-colors ${i % 2 === 0 ? 'bg-[#1c1b1b]' : 'bg-[#131313]'} hover:bg-[#2a2a2a]`}
            >
              <div className="col-span-2 text-[#e5e2e1] font-mono text-xs">{incident.id}</div>
              <div className="col-span-4 pr-4">
                <div className="text-[#ffffff] font-medium text-sm mb-1 group-hover:text-[#4d8eff] transition-colors">{incident.title}</div>
                <div className="text-[#919191] text-xs font-mono truncate">{incident.root_cause}</div>
              </div>
              <div className="col-span-2">
                <span className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-sm ${getSeverityStyle(incident.severity)}`}>
                  {incident.severity}
                </span>
              </div>
              <div className="col-span-2 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(incident.status)}`}></div>
                  <span className="text-xs text-[#e5e2e1]">{incident.status}</span>
                </div>
                <div className="text-[10px] text-[#5d5f5f] uppercase tracking-widest">{incident.agent}</div>
              </div>
              <div className="col-span-2 text-right text-[#919191] text-xs font-mono">{incident.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
