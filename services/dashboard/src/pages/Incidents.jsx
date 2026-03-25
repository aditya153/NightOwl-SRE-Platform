import { useState } from 'react';
import { useIncidentsList } from '../hooks/useIncidents';

export default function Incidents() {
  const [activeTab, setActiveTab] = useState('All');
  const { data: incidents = [], isLoading, isError } = useIncidentsList();

  const tabs = ['All', 'Critical', 'Warnings', 'Resolved'];

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-error-container/20 text-error border-error/30 neon-glow-error text-[10px] px-2 py-0.5 rounded-sm font-bold uppercase tracking-tighter';
      case 'HIGH': return 'bg-tertiary-fixed-dim/20 text-tertiary border-tertiary/30 neon-glow-tertiary text-[10px] px-2 py-0.5 rounded-sm font-bold uppercase tracking-tighter';
      case 'MEDIUM': return 'bg-secondary-container/50 text-secondary border-outline-variant/50 neon-glow-secondary text-[10px] px-2 py-0.5 rounded-sm font-bold uppercase tracking-tighter';
      case 'LOW': return 'bg-surface-variant text-on-surface-variant border-outline-variant/30 text-[10px] px-2 py-0.5 rounded-sm font-bold uppercase tracking-tighter';
      default: return 'bg-surface-variant text-on-surface text-[10px] px-2 py-0.5 rounded-sm font-bold uppercase tracking-tighter';
    }
  };

  const getStatusDot = (status, severity) => {
    if (status === 'Resolved') return <span className="material-symbols-outlined text-[14px] text-on-surface-variant">check_circle</span>;
    let color = 'bg-surface-variant';
    if (severity === 'CRITICAL') color = 'bg-error animate-pulse';
    else if (severity === 'HIGH') color = 'bg-tertiary-container animate-pulse';
    else if (severity === 'MEDIUM') color = 'bg-secondary-container';
    
    return <div className={`w-1.5 h-1.5 rounded-full ${color}`}></div>;
  };

  return (
    <section className="flex-1 overflow-y-auto p-8 border-r border-outline-variant/10 relative h-full fade-in">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2 font-headline">Active Engineering Incidents</h2>
        <p className="text-on-surface-variant text-sm font-sans mb-10">Real-time oversight of system anomalies and remediation efforts.</p>
        
        {/* Dashboard Bento Stats */}
        <div className="grid grid-cols-3 gap-6 mb-10">
          <div className="bg-surface-container-low p-6 rounded-lg relative overflow-hidden group hover-lift hover-glow border border-transparent slide-up stagger-1">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-6xl">priority_high</span>
            </div>
            <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Active Critical</p>
            <p className="text-4xl font-black text-error font-sans">03</p>
          </div>
          <div className="bg-surface-container-low p-6 rounded-lg relative overflow-hidden group hover-lift hover-glow border border-transparent slide-up stagger-2">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-6xl">query_stats</span>
            </div>
            <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Mean Time to Resolve</p>
            <p className="text-4xl font-black text-white font-sans">14<span className="text-lg font-normal ml-1 text-on-surface-variant">min</span></p>
          </div>
          <div className="bg-surface-container-low p-6 rounded-lg relative overflow-hidden group hover-lift hover-glow border border-transparent slide-up stagger-3">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-6xl">robot_2</span>
            </div>
            <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Agent Participation</p>
            <p className="text-4xl font-black text-tertiary font-sans">98<span className="text-lg font-normal ml-1 text-on-surface-variant">%</span></p>
          </div>
        </div>

        {/* Incidents Table */}
        <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-2xl border border-outline-variant/5 hover-glow scale-in stagger-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-6 py-4 font-label text-[10px] uppercase tracking-[0.15em] text-on-surface-variant">ID</th>
                <th className="px-6 py-4 font-label text-[10px] uppercase tracking-[0.15em] text-on-surface-variant">Incident Title</th>
                <th className="px-6 py-4 font-label text-[10px] uppercase tracking-[0.15em] text-on-surface-variant">Severity</th>
                <th className="px-6 py-4 font-label text-[10px] uppercase tracking-[0.15em] text-on-surface-variant">Status</th>
                <th className="px-6 py-4 font-label text-[10px] uppercase tracking-[0.15em] text-on-surface-variant text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {isLoading && (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-on-surface-variant">Loading real-time incidents...</td></tr>
              )}
              {isError && (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-error">Failed to synchronize with Agent Gateway.</td></tr>
              )}
              {!isLoading && !isError && incidents.map((incident) => (
                <tr 
                  key={incident.id} 
                  onClick={() => window.location.href = `/incident/${incident.id}`}
                  className="row-highlight cursor-pointer group"
                >
                  <td className="px-6 py-5 font-mono text-xs text-on-surface-variant">{incident.id}</td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-white font-bold group-hover:text-tertiary transition-colors font-sans">{incident.title}</span>
                      <span className="text-[10px] text-on-surface-variant/60 font-mono mt-0.5">{incident.root_cause}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`border text-[10px] px-2 py-0.5 rounded-sm font-bold uppercase tracking-tighter ${getSeverityStyle(incident.severity)}`}>
                      {incident.severity}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      {getStatusDot(incident.status, incident.severity)}
                      <span className="text-xs text-white font-sans">{incident.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right font-mono text-xs text-on-surface-variant">{incident.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="bg-surface-container-low/30 px-6 py-4 border-t border-outline-variant/10 flex items-center justify-between">
            <span className="text-xs text-on-surface-variant font-sans">Showing {incidents.length} active incidents</span>
            <div className="flex gap-2">
              <button className="p-1 hover:bg-surface-container-high transition-colors rounded-sm text-on-surface-variant cursor-pointer">
                <span className="material-symbols-outlined text-sm pt-1">chevron_left</span>
              </button>
              <button className="p-1 hover:bg-surface-container-high transition-colors rounded-sm text-on-surface-variant cursor-pointer">
                <span className="material-symbols-outlined text-sm pt-1">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
