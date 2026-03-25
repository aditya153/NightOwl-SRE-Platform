import { useIncidentDetails } from '../hooks/useIncidents';

export default function IncidentDetail({ incidentId }) {
  const { data, isLoading, isError } = useIncidentDetails(incidentId);

  if (isLoading || !data) return (
    <div className="flex-1 flex items-center justify-center p-12 text-on-surface-variant">
      <span className="material-symbols-outlined animate-spin mr-3 text-[20px]">progress_activity</span>
      <span className="text-sm font-mono">Connecting to Agent Gateway...</span>
    </div>
  );

  if (isError) return (
    <div className="flex-1 flex items-center justify-center p-12 text-red-400">
      <span className="material-symbols-outlined mr-3 text-[20px]">error</span>
      <span className="text-sm font-mono">Failed to fetch incident {incidentId}</span>
    </div>
  );

  const getSeverityBadge = (severity) => {
    const styles = {
      CRITICAL: 'bg-red-500/10 text-red-400 border-red-500/20',
      HIGH: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      MEDIUM: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    };
    return styles[severity] || 'bg-surface-variant text-on-surface';
  };

  return (
    <div className="p-6 lg:p-8 fade-in">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <a href="/incidents" className="w-9 h-9 rounded-lg flex items-center justify-center border border-outline-variant/20 hover:bg-surface-container-high transition-colors text-on-surface-variant">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          </a>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-on-surface">{data.title}</h2>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${getSeverityBadge(data.severity)}`}>
                {data.severity}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-on-surface-variant font-mono">
              <span>{data.id}</span>
              <span>-</span>
              <span>{data.time}</span>
              <span>-</span>
              <span className="text-emerald-400">{data.status}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-outline-variant/20 rounded-lg text-sm font-semibold text-on-surface hover:bg-surface-container-high transition-colors">
            Acknowledge
          </button>
          <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-600/90 transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">build</span>
            Authorize Fix
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-4 space-y-4">
          <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/10">
            <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">Context</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">{data.description}</p>
            <div className="mt-4 pt-4 border-t border-outline-variant/10 space-y-2">
              <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Infrastructure</h4>
              {data.infrastructure.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <span className="text-on-surface-variant">{item.label}</span>
                  <span className="font-mono text-on-surface bg-surface-container-high px-2 py-0.5 rounded text-xs">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/10">
            <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">Root Cause</h3>
            <p className="font-mono text-sm text-on-surface">{data.root_cause}</p>
          </div>
        </div>

        <div className="xl:col-span-8">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 flex flex-col min-h-[400px]">
            <div className="px-5 py-3 border-b border-outline-variant/10 flex items-center justify-between">
              <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-emerald-400">memory</span>
                Action Stream
              </h3>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider">Engaged</span>
              </div>
            </div>

            <div className="flex-1 p-5 space-y-5 overflow-y-auto">
              {data.agentChats.map((chat, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className={`w-7 h-7 shrink-0 rounded-md flex items-center justify-center ${chat.class && chat.class.includes('bg-') ? chat.class : 'bg-surface-container-high text-on-surface-variant'}`}>
                    <span className="material-symbols-outlined text-[14px]" style={{fontVariationSettings: "'FILL' 1"}}>{chat.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-on-surface">{chat.sender}</span>
                      <span className="text-[11px] text-on-surface-variant border border-outline-variant/20 px-1.5 py-0.5 rounded">{chat.role}</span>
                      <span className="text-[11px] text-on-surface-variant/50 ml-auto">{chat.time}</span>
                    </div>
                    <div className="bg-surface-container-low/50 border border-outline-variant/5 p-3 rounded-lg text-emerald-400 text-xs font-mono leading-relaxed whitespace-pre-wrap">
                      {chat.message}
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex gap-3 opacity-50">
                <div className="w-7 h-7 shrink-0 rounded-md flex items-center justify-center bg-surface-container-high text-on-surface-variant">
                  <span className="material-symbols-outlined text-[14px]" style={{fontVariationSettings: "'FILL' 1"}}>build</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-on-surface">Fixer Agent</span>
                    <span className="text-[11px] text-on-surface-variant border border-outline-variant/20 px-1.5 py-0.5 rounded">Execution</span>
                  </div>
                  <div className="bg-surface-container-low/50 border border-outline-variant/5 p-3 rounded-lg">
                    <span className="inline-block w-1.5 h-4 bg-emerald-400 animate-pulse rounded-sm"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
