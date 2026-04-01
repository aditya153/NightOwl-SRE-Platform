import { useState } from 'react';
import { useIncidentsList } from '../hooks/useIncidents';

export default function Incidents() {
  const { data: incidents, isLoading, isError } = useIncidentsList();
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Critical', 'Investigating', 'Resolved'];

  const getSeverityClass = (severity) => {
    const map = {
      CRITICAL: { bg: 'var(--color-red-bg)', color: 'var(--color-red)', border: 'rgba(232,69,60,0.2)' },
      HIGH: { bg: 'var(--color-amber-bg)', color: 'var(--color-amber)', border: 'rgba(245,158,11,0.2)' },
      MEDIUM: { bg: 'var(--color-blue-bg)', color: 'var(--color-blue)', border: 'rgba(59,130,246,0.2)' },
      LOW: { bg: 'var(--color-green-bg)', color: 'var(--color-green)', border: 'rgba(16,185,129,0.2)' },
    };
    return map[severity] || map.LOW;
  };

  const getStatusDot = (status) => {
    if (status === 'Investigating') return { bg: 'var(--color-red)', shadow: '0 0 6px var(--color-red)', animate: true };
    if (status === 'Correlating') return { bg: 'var(--color-blue)', shadow: 'none', animate: true };
    if (status === 'Resolved') return { bg: 'var(--color-green)', shadow: 'none', animate: false };
    if (status === 'Escalated') return { bg: 'var(--color-amber)', shadow: 'none', animate: false };
    return { bg: 'var(--color-text3)', shadow: 'none', animate: false };
  };

  return (
    <div className="p-6 fade-in">
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-text mb-1" style={{ fontFamily: 'var(--font-head)' }}>Active Incidents</h1>
        <p className="text-[13px] text-text2">Real-time overview of system anomalies and AI agent remediation.</p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-bg2 border border-border rounded-[10px] p-4 relative overflow-hidden transition-[border-color] duration-150 hover:border-border2 slide-up stagger-1">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-red" />
          <div className="text-[9.5px] tracking-[0.1em] uppercase text-text3 mb-[10px]" style={{ fontFamily: 'var(--font-mono)' }}>Active Critical</div>
          <div className="text-[32px] font-[800] text-red leading-none" style={{ fontFamily: 'var(--font-head)' }}>03</div>
          <div className="text-[11px] text-text3 mt-[6px]" style={{ fontFamily: 'var(--font-mono)' }}>^ 1 since last hour</div>
        </div>
        <div className="bg-bg2 border border-border rounded-[10px] p-4 relative overflow-hidden transition-[border-color] duration-150 hover:border-border2 slide-up stagger-2">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-amber" />
          <div className="text-[9.5px] tracking-[0.1em] uppercase text-text3 mb-[10px]" style={{ fontFamily: 'var(--font-mono)' }}>Mean Resolve Time</div>
          <div className="text-[32px] font-[800] text-amber leading-none" style={{ fontFamily: 'var(--font-head)' }}>14<span className="text-[14px] font-normal ml-[2px] text-text2">min</span></div>
          <div className="text-[11px] text-text3 mt-[6px]" style={{ fontFamily: 'var(--font-mono)' }}>v 3min vs yesterday</div>
        </div>
        <div className="bg-bg2 border border-border rounded-[10px] p-4 relative overflow-hidden transition-[border-color] duration-150 hover:border-border2 slide-up stagger-3">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-green" />
          <div className="text-[9.5px] tracking-[0.1em] uppercase text-text3 mb-[10px]" style={{ fontFamily: 'var(--font-mono)' }}>Agent Participation</div>
          <div className="text-[32px] font-[800] text-green leading-none" style={{ fontFamily: 'var(--font-head)' }}>98<span className="text-[14px] font-normal ml-[2px] text-text2">%</span></div>
          <div className="text-[11px] text-text3 mt-[6px]" style={{ fontFamily: 'var(--font-mono)' }}>7 agents active</div>
        </div>
      </div>

      <div className="bg-bg2 border border-border rounded-[10px] overflow-hidden slide-up stagger-4">
        <div className="flex items-center justify-between px-[18px] py-[14px] border-b border-border">
          <div>
            <div className="text-[14px] font-bold text-text" style={{ fontFamily: 'var(--font-head)' }}>Incident Feed</div>
            <div className="text-[12px] text-text3" style={{ fontFamily: 'var(--font-mono)' }}>
              {incidents ? `${incidents.length} incidents` : '...'} - synced 2s ago
            </div>
          </div>
          <div className="flex gap-[6px]">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className="px-[10px] py-1 rounded-[20px] text-[11px] font-medium border cursor-pointer transition-all"
                style={{
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.04em',
                  borderColor: activeFilter === f ? 'var(--color-accent)' : 'var(--color-border)',
                  color: activeFilter === f ? 'var(--color-accent2)' : 'var(--color-text2)',
                  background: activeFilter === f ? 'var(--color-accent-glow)' : 'transparent',
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-text2">
            <span className="material-symbols-outlined animate-spin mr-3 text-[20px]">progress_activity</span>
            <span className="text-sm">Connecting to Agent Gateway...</span>
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center py-20 text-red">
            <span className="material-symbols-outlined mr-3 text-[20px]">error</span>
            <span className="text-sm">Failed to synchronize with Agent Gateway.</span>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="px-[18px] py-[10px] text-left text-[10px] tracking-[0.1em] uppercase text-text3 font-medium whitespace-nowrap" style={{ fontFamily: 'var(--font-mono)' }}>ID</th>
                <th className="px-[18px] py-[10px] text-left text-[10px] tracking-[0.1em] uppercase text-text3 font-medium whitespace-nowrap" style={{ fontFamily: 'var(--font-mono)' }}>Incident</th>
                <th className="px-[18px] py-[10px] text-left text-[10px] tracking-[0.1em] uppercase text-text3 font-medium whitespace-nowrap" style={{ fontFamily: 'var(--font-mono)' }}>Severity</th>
                <th className="px-[18px] py-[10px] text-left text-[10px] tracking-[0.1em] uppercase text-text3 font-medium whitespace-nowrap" style={{ fontFamily: 'var(--font-mono)' }}>Status</th>
                <th className="px-[18px] py-[10px] text-right text-[10px] tracking-[0.1em] uppercase text-text3 font-medium whitespace-nowrap" style={{ fontFamily: 'var(--font-mono)' }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((incident) => {
                const sev = getSeverityClass(incident.severity);
                const dot = getStatusDot(incident.status);
                return (
                  <tr
                    key={incident.id}
                    onClick={() => (window.location.href = `/incident/${incident.id}`)}
                    className="border-b border-border cursor-pointer transition-[background] duration-100 hover:bg-bg3 last:border-b-0"
                  >
                    <td className="px-[18px] py-[14px] align-middle">
                      <span className="text-[11px] text-text3" style={{ fontFamily: 'var(--font-mono)' }}>{incident.id}</span>
                    </td>
                    <td className="px-[18px] py-[14px] align-middle">
                      <div className="text-[13.5px] font-semibold text-text mb-[2px]">{incident.title}</div>
                      <div className="text-[11.5px] text-text3" style={{ fontFamily: 'var(--font-mono)' }}>{incident.root_cause}</div>
                    </td>
                    <td className="px-[18px] py-[14px] align-middle">
                      <span
                        className="inline-flex items-center gap-[5px] px-2 py-[3px] rounded text-[10.5px] font-bold tracking-[0.05em] uppercase"
                        style={{ fontFamily: 'var(--font-mono)', background: sev.bg, color: sev.color, border: `1px solid ${sev.border}` }}
                      >
                        {incident.severity}
                      </span>
                    </td>
                    <td className="px-[18px] py-[14px] align-middle">
                      <div className="flex items-center gap-[7px] text-[12.5px] text-text">
                        <div
                          className="w-[7px] h-[7px] rounded-full shrink-0"
                          style={{ background: dot.bg, boxShadow: dot.shadow, animation: dot.animate ? 'pulse 1.5s infinite' : 'none' }}
                        />
                        {incident.status}
                      </div>
                    </td>
                    <td className="px-[18px] py-[14px] align-middle text-right text-[11.5px] text-text3 whitespace-nowrap" style={{ fontFamily: 'var(--font-mono)' }}>
                      {incident.time}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        <div className="flex items-center justify-between px-[18px] py-3 border-t border-border">
          <span className="text-[12px] text-text3" style={{ fontFamily: 'var(--font-mono)' }}>
            {incidents ? `Showing ${incidents.length} incidents` : 'Loading...'}
          </span>
          <div className="flex gap-1">
            <button className="w-7 h-7 rounded-[6px] border border-border bg-transparent text-text2 cursor-pointer flex items-center justify-center transition-all hover:bg-bg3 hover:border-border2 hover:text-text">
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>
            <button className="w-7 h-7 rounded-[6px] border border-border bg-transparent text-text2 cursor-pointer flex items-center justify-center transition-all hover:bg-bg3 hover:border-border2 hover:text-text">
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
