import { useIncidentDetails } from '../hooks/useIncidents';

export default function IncidentDetail({ incidentId }) {
  const { data, isLoading, isError } = useIncidentDetails(incidentId);

  if (isLoading || !data) return (
    <div className="flex-1 overflow-y-auto p-12 text-white flex items-center justify-center font-mono">
      <span className="material-symbols-outlined animate-spin mr-3">hourglass_empty</span>
      Connecting to Agent Gateway...
    </div>
  );

  if (isError) return (
    <div className="flex-1 overflow-y-auto p-12 text-error flex items-center justify-center font-mono">
      <span className="material-symbols-outlined mr-3">error</span>
      Data fetch failed for {incidentId}
    </div>
  );

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-error-container/20 text-error border-error/30 neon-glow-error';
      case 'HIGH': return 'bg-tertiary-fixed-dim/20 text-tertiary border-tertiary/30 neon-glow-tertiary';
      case 'MEDIUM': return 'bg-secondary-container/50 text-secondary border-outline-variant/50 neon-glow-secondary';
      default: return 'bg-surface-variant text-on-surface';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-10 h-full fade-in">
      {/* Top Header Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="/incidents" className="w-10 h-10 hover:bg-surface-container-high rounded-full transition-colors text-on-surface-variant flex items-center justify-center border border-outline-variant/10">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
          </a>
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white font-headline flex items-center gap-3">
              {data.title}
              <span className={`border text-[10px] px-2 py-0.5 rounded-sm font-bold uppercase tracking-tighter ${getSeverityStyle(data.severity)}`}>
                {data.severity}
              </span>
            </h2>
            <div className="flex items-center gap-2 mt-1 font-mono text-xs text-on-surface-variant">
              <span>{data.id}</span>
              <span>•</span>
              <span>{data.time}</span>
              <span>•</span>
              <span className="text-tertiary">{data.status}</span>
            </div>
          </div>
        </div>

        {/* Actions Menu */}
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-outline-variant/20 hover:bg-surface-container-high rounded-md text-sm font-bold text-white transition-all cursor-pointer hover-lift">
            ACKNOWLEDGE
          </button>
          <button className="px-4 py-2 bg-primary text-black hover:bg-primary/90 rounded-md text-sm font-bold transition-all cursor-pointer flex items-center gap-2 hover-lift">
            <span className="material-symbols-outlined text-sm font-bold">build</span>
            AUTHORIZE FIX
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">

        {/* Left Column: Context & Metadata */}
        <div className="col-span-12 xl:col-span-4 space-y-6">
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-lg hover-glow slide-up stagger-1">
            <h3 className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-4">Incident Context</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed font-sans mb-6">
              {data.description}
            </p>

            <div className="space-y-3">
              <h4 className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant pt-2 border-t border-outline-variant/5">Infrastructure Nodes</h4>
              {data.infrastructure.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant/70">{item.label}</span>
                  <span className="font-mono text-white bg-surface-container-high px-2 py-0.5 rounded">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#1C1B1B] p-6 rounded-xl border border-outline-variant/10 relative overflow-hidden group hover-glow slide-up stagger-2">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <span className="material-symbols-outlined text-8xl">troubleshoot</span>
            </div>
            <h3 className="font-label text-[10px] uppercase tracking-widest text-error mb-1">Root Cause Area</h3>
            <p className="font-mono text-sm text-white">{data.root_cause}</p>
          </div>
        </div>

        {/* Right Column: AI Agent Action Stream */}
        <div className="col-span-12 xl:col-span-8">
          <div className="bg-surface-container-lowest h-full min-h-[500px] rounded-xl border border-outline-variant/10 shadow-lg flex flex-col hover-glow scale-in">
            <div className="p-4 border-b border-outline-variant/10 bg-surface-container-low/30 flex items-center justify-between">
              <h3 className="font-label text-xs uppercase tracking-[0.2em] text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-tertiary">memory</span>
                Autonomous Action Stream
              </h3>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary"></span>
                </span>
                <span className="text-[10px] text-tertiary uppercase tracking-widest font-bold font-label">Engaged</span>
              </div>
            </div>

            <div className="flex-1 p-6 space-y-6 overflow-y-auto font-mono text-sm">
              {data.agentChats.map((chat, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className={`w-8 h-8 shrink-0 rounded flex items-center justify-center ${chat.class.includes('bg-') ? chat.class : 'bg-surface-container-highest text-white'}`}>
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>{chat.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-white text-xs">{chat.sender}</span>
                      <span className="text-[10px] text-on-surface-variant border border-outline-variant/20 px-1 rounded">{chat.role}</span>
                      <span className="text-[10px] text-on-surface-variant/50 ml-auto">{chat.time}</span>
                    </div>
                    <div className="bg-surface-container-low/50 border border-outline-variant/5 p-4 rounded-md text-[#00FF41] text-xs leading-relaxed whitespace-pre-wrap">
                      {chat.message}
                    </div>
                  </div>
                </div>
              ))}

              {/* Fake typing indicator for realtime feel */}
              <div className="flex gap-4 opacity-50 animate-pulse">
                <div className="w-8 h-8 shrink-0 rounded flex items-center justify-center bg-primary-container/20 text-primary">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>build</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-white text-xs">Fixer Agent</span>
                    <span className="text-[10px] text-on-surface-variant border border-outline-variant/20 px-1 rounded">Execution</span>
                  </div>
                  <div className="bg-surface-container-low/50 border border-outline-variant/5 p-3 rounded-md text-[#00FF41] text-xs">
                    <span className="inline-block w-2 h-4 bg-[#00FF41] animate-pulse"></span>
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
