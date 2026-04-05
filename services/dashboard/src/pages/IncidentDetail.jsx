import { useIncidentDetails, useAcknowledgeIncident, useAuthorizeFix } from '../hooks/useIncidents';

const iconStyles = {
  'icon-purple': { background: 'rgba(139,92,246,0.15)', color: '#a78bfa' },
  'icon-teal': { background: 'rgba(20,184,166,0.12)', color: '#2dd4bf' },
  'icon-orange': { background: 'rgba(249,115,22,0.12)', color: '#fb923c' },
  'icon-blue': { background: 'rgba(59,130,246,0.12)', color: '#60a5fa' },
};

export default function IncidentDetail({ incidentId }) {
  const { data, isLoading, isError } = useIncidentDetails(incidentId);
  const { mutate: acknowledge, isPending: isAcking } = useAcknowledgeIncident();
  const { mutate: authorizeFix, isPending: isFixing } = useAuthorizeFix();

  if (isLoading || !data) return (
    <div className="flex-1 flex items-center justify-center p-12 text-text2">
      <span className="material-symbols-outlined animate-spin mr-3 text-[20px]">progress_activity</span>
      <span className="text-sm" style={{ fontFamily: 'var(--font-mono)' }}>Connecting to Agent Gateway...</span>
    </div>
  );

  if (isError) return (
    <div className="flex-1 flex items-center justify-center p-12 text-red">
      <span className="material-symbols-outlined mr-3 text-[20px]">error</span>
      <span className="text-sm" style={{ fontFamily: 'var(--font-mono)' }}>Failed to fetch incident {incidentId}</span>
    </div>
  );

  const getSevStyle = (severity) => {
    const map = {
      CRITICAL: { bg: 'var(--color-red-bg)', color: 'var(--color-red)', border: 'rgba(232,69,60,0.2)' },
      HIGH: { bg: 'var(--color-amber-bg)', color: 'var(--color-amber)', border: 'rgba(245,158,11,0.2)' },
      MEDIUM: { bg: 'var(--color-blue-bg)', color: 'var(--color-blue)', border: 'rgba(59,130,246,0.2)' },
    };
    return map[severity] || { bg: 'var(--color-green-bg)', color: 'var(--color-green)', border: 'rgba(16,185,129,0.2)' };
  };

  const sev = getSevStyle(data.severity);
  const isResolved = data.status === 'Resolved';
  const isActionable = !isResolved && data.status !== 'Investigating';

  return (
    <div className="p-6 fade-in">
      <div className="flex items-center gap-2 text-text2 cursor-pointer text-[13px] font-medium mb-5 w-fit transition-colors hover:text-text" onClick={() => (window.location.href = '/incidents')}>
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Back to incidents
      </div>

      <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-[10px] flex-wrap mb-[6px]" style={{ fontFamily: 'var(--font-head)', fontSize: '20px', fontWeight: 700, color: 'var(--color-text)' }}>
            {data.title}
            <span
              className="text-[10.5px] font-bold px-2 py-[3px] rounded tracking-[0.05em] uppercase"
              style={{ fontFamily: 'var(--font-mono)', background: sev.bg, color: sev.color, border: `1px solid ${sev.border}` }}
            >
              {data.severity}
            </span>
          </div>
          <div className="flex gap-3 flex-wrap text-[11px] text-text3" style={{ fontFamily: 'var(--font-mono)' }}>
            <span>{data.id}</span>
            <span>-</span>
            <span>{data.time}</span>
            <span>-</span>
            <span style={{ color: isResolved ? 'var(--color-green)' : 'var(--color-amber)' }}>{data.status}</span>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <div className="flex items-center gap-[5px] px-3 py-[6px] rounded-[6px] text-[11px] font-bold text-accent2 tracking-[0.06em]" style={{ fontFamily: 'var(--font-mono)', border: '1px solid rgba(91,106,240,0.3)', background: 'var(--color-accent-glow)' }}>
            <div className="w-[7px] h-[7px] rounded-full bg-green" />
            Engaged
          </div>
          <button
            onClick={() => acknowledge(data.id)}
            disabled={isResolved || isAcking}
            className="bg-transparent text-text py-[7px] px-[14px] rounded-[6px] text-[12.5px] font-medium cursor-pointer transition-all hover:bg-bg3 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ border: '1px solid var(--color-border2)', fontFamily: 'var(--font-body)' }}
          >
            {isAcking ? 'Acknowledging...' : 'Acknowledge'}
          </button>
          <button
            onClick={() => authorizeFix(data.id)}
            disabled={!isActionable || isFixing}
            className="bg-green border-none text-black py-[7px] px-[14px] rounded-[6px] text-[12.5px] font-bold cursor-pointer flex items-center gap-[6px] transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            <span className="material-symbols-outlined text-[15px]">build</span>
            {isFixing ? 'Authorizing...' : 'Authorize Fix'}
          </button>
        </div>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: '300px 1fr' }}>
        <div className="flex flex-col gap-3">
          <div className="bg-bg2 border border-border rounded-[10px] overflow-hidden">
            <div className="text-[9.5px] tracking-[0.12em] uppercase text-text3 px-[14px] pt-3 pb-[10px] border-b border-border" style={{ fontFamily: 'var(--font-mono)' }}>Context</div>
            <div className="p-[14px]">
              <p className="text-[13px] text-text2 leading-[1.6]">{data.description}</p>
              <div className="mt-3">
                <div className="text-[9.5px] tracking-[0.12em] uppercase text-text3 pb-2" style={{ fontFamily: 'var(--font-mono)' }}>Infrastructure</div>
                {data.infrastructure.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-[7px] border-b border-border text-[12.5px] last:border-b-0 last:pb-0">
                    <span className="text-text2">{item.label}</span>
                    <span className="text-[11.5px] text-text bg-bg3 px-2 py-[2px] rounded border border-border" style={{ fontFamily: 'var(--font-mono)' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-bg2 rounded-[10px] p-3" style={{ border: '1px solid rgba(232,69,60,0.2)' }}>
            <div className="text-[9.5px] tracking-[0.12em] uppercase text-red mb-[6px]" style={{ fontFamily: 'var(--font-mono)' }}>Root Cause</div>
            <div className="text-[12px] text-text leading-[1.5]" style={{ fontFamily: 'var(--font-mono)' }}>{data.root_cause}</div>
          </div>
        </div>

        <div className="bg-bg2 border border-border rounded-[10px] flex flex-col min-h-[360px]">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div className="text-[10px] tracking-[0.12em] uppercase text-text2 flex items-center gap-[7px]" style={{ fontFamily: 'var(--font-mono)' }}>
              <span className="material-symbols-outlined text-[14px] text-green">memory</span>
              Action Stream
            </div>
            <div className="flex items-center gap-[6px] text-[11px] text-green" style={{ fontFamily: 'var(--font-mono)' }}>
              <div className="w-[6px] h-[6px] rounded-full bg-green" style={{ animation: 'pulse 2s infinite' }} />
              3 agents running
            </div>
          </div>
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
            {data.agentChats.map((chat, idx) => {
              const style = iconStyles[chat.class] || iconStyles['icon-purple'];
              return (
                <div key={idx} className="flex gap-3">
                  <div className="w-7 h-7 rounded-[6px] flex items-center justify-center shrink-0 mt-[1px]" style={style}>
                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1", color: style.color }}>{chat.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-[6px] flex-wrap">
                      <span className="text-[12.5px] font-semibold text-text">{chat.sender}</span>
                      <span className="text-[10px] text-text3 border border-border px-[6px] py-[1px] rounded-[3px]" style={{ fontFamily: 'var(--font-mono)' }}>{chat.role}</span>
                      <span className="text-[10.5px] text-text3 ml-auto" style={{ fontFamily: 'var(--font-mono)' }}>{chat.time}</span>
                    </div>
                    <div className="bg-bg3 border border-border p-[10px_12px] rounded-[6px] text-[11.5px] text-green leading-[1.7] whitespace-pre-wrap" style={{ fontFamily: 'var(--font-mono)' }}>
                      {chat.message}
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="flex gap-3 opacity-50">
              <div className="w-7 h-7 rounded-[6px] flex items-center justify-center shrink-0" style={iconStyles['icon-blue']}>
                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1", color: iconStyles['icon-blue'].color }}>build</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-[6px]">
                  <span className="text-[12.5px] font-semibold text-text">Fixer Agent</span>
                  <span className="text-[10px] text-text3 border border-border px-[6px] py-[1px] rounded-[3px]" style={{ fontFamily: 'var(--font-mono)' }}>Execution</span>
                </div>
                <div className="bg-bg3 border border-border p-[10px_12px] rounded-[6px]">
                  <span className="cursor-blink" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
