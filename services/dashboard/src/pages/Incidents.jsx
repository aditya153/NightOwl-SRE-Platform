import { useIncidentsList } from '../hooks/useIncidents';

export default function Incidents() {
  const { data: incidents, isLoading, isError } = useIncidentsList();

  const getSeverityBadge = (severity) => {
    const styles = {
      CRITICAL: 'bg-red-500/10 text-red-400 border-red-500/20',
      HIGH: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      MEDIUM: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      LOW: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    };
    return styles[severity] || styles.LOW;
  };

  const getStatusDot = (status) => {
    if (status === 'Agent Investigating') return 'bg-amber-400';
    if (status === 'Awaiting Approval') return 'bg-blue-400';
    if (status === 'Resolved') return 'bg-emerald-400';
    return 'bg-on-surface-variant';
  };

  return (
    <div className="p-6 lg:p-8 fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-on-surface mb-1">Active Incidents</h2>
        <p className="text-sm text-on-surface-variant">Real-time overview of system anomalies and AI agent remediation.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/10 slide-up stagger-1">
          <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Active Critical</p>
          <p className="text-3xl font-black text-red-400">03</p>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/10 slide-up stagger-2">
          <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Mean Resolve Time</p>
          <p className="text-3xl font-black text-on-surface">14<span className="text-base font-normal text-on-surface-variant ml-1">min</span></p>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/10 slide-up stagger-3">
          <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Agent Participation</p>
          <p className="text-3xl font-black text-emerald-400">98<span className="text-base font-normal text-on-surface-variant ml-1">%</span></p>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden slide-up stagger-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-on-surface-variant">
            <span className="material-symbols-outlined animate-spin mr-3 text-[20px]">progress_activity</span>
            <span className="text-sm">Connecting to Agent Gateway...</span>
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center py-20 text-red-400">
            <span className="material-symbols-outlined mr-3 text-[20px]">error</span>
            <span className="text-sm">Failed to synchronize with Agent Gateway.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-outline-variant/10">
                  <th className="px-5 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">ID</th>
                  <th className="px-5 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Incident</th>
                  <th className="px-5 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Severity</th>
                  <th className="px-5 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-right">Time</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((incident) => (
                  <tr
                    key={incident.id}
                    onClick={() => window.location.href = `/incident/${incident.id}`}
                    className="border-b border-outline-variant/5 hover:bg-surface-container-high/30 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-4 font-mono text-xs text-on-surface-variant">{incident.id}</td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-on-surface">{incident.title}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5 font-mono">{incident.root_cause}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-[11px] font-bold px-2 py-1 rounded border ${getSeverityBadge(incident.severity)}`}>
                        {incident.severity}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${getStatusDot(incident.status)}`}></span>
                        <span className="text-sm text-on-surface">{incident.status}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right text-xs text-on-surface-variant font-mono">{incident.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-5 py-3 border-t border-outline-variant/10 flex items-center justify-between">
          <span className="text-xs text-on-surface-variant">
            {incidents ? `${incidents.length} active incidents` : 'Loading...'}
          </span>
          <div className="flex gap-1">
            <button className="p-1.5 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button className="p-1.5 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
