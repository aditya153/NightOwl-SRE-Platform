export default function TopNav({ isAgentSidebarOpen, setIsAgentSidebarOpen }) {
  return (
    <header className="h-14 bg-bg2 border-b border-border flex items-center px-5 gap-3 shrink-0">
      <div className="flex items-center gap-[6px] px-[10px] py-1 rounded-[20px] text-[11px] font-semibold text-green uppercase tracking-[0.06em]" style={{ fontFamily: 'var(--font-mono)', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
        <div className="live-dot" />
        Live
      </div>

      <div className="flex-1 max-w-[360px] relative">
        <span className="material-symbols-outlined absolute left-[9px] top-1/2 -translate-y-1/2 text-[16px] text-text3">search</span>
        <input
          type="text"
          placeholder="Search incidents, agents, logs..."
          className="w-full bg-bg3 border border-border rounded-[6px] py-[7px] pl-[34px] pr-3 text-[13px] text-text outline-none transition-[border-color] duration-150 placeholder:text-text3 focus:border-border2"
          style={{ fontFamily: 'var(--font-body)' }}
        />
      </div>

      <div className="flex items-center gap-[6px] ml-auto">
        <button className="w-[34px] h-[34px] rounded-[6px] border border-border bg-transparent text-text2 cursor-pointer flex items-center justify-center transition-all hover:bg-bg3 hover:text-text hover:border-border2">
          <span className="material-symbols-outlined text-[18px]">dark_mode</span>
        </button>
        <button className="w-[34px] h-[34px] rounded-[6px] border border-border bg-transparent text-text2 cursor-pointer flex items-center justify-center transition-all hover:bg-bg3 hover:text-text hover:border-border2">
          <span className="material-symbols-outlined text-[18px]">notifications</span>
        </button>
        <button
          onClick={() => setIsAgentSidebarOpen(!isAgentSidebarOpen)}
          className="w-[34px] h-[34px] rounded-[6px] border border-border bg-transparent text-text2 cursor-pointer flex items-center justify-center transition-all hover:bg-bg3 hover:text-text hover:border-border2"
        >
          <span className="material-symbols-outlined text-[18px]">smart_toy</span>
        </button>
        <button className="bg-accent text-white border-none py-[7px] px-4 rounded-[6px] text-[12.5px] font-semibold cursor-pointer tracking-[0.02em] transition-all flex items-center gap-[6px] whitespace-nowrap hover:bg-[#4a58d4]" style={{ fontFamily: 'var(--font-body)' }}>
          <span className="material-symbols-outlined text-[15px]">add</span>
          New Incident
        </button>
      </div>
    </header>
  );
}
