import { useState } from 'react'
import { useSocket } from './hooks/useSocket'
import Sidebar from './components/Sidebar'
import TopNav from './components/TopNav'
import AgentSidebar from './components/AgentSidebar'
import Incidents from './pages/Incidents'
import IncidentDetail from './pages/IncidentDetail'

function AgentsPage() {
  return (
    <div className="p-8">
      <h1 className="text-[22px] font-bold text-text" style={{ fontFamily: 'var(--font-head)' }}>AI Agents Panel</h1>
      <p className="text-[13px] text-text2 mt-1">Monitor agent status and execution history.</p>
    </div>
  )
}

function LogsPage() {
  return (
    <div className="p-8">
      <h1 className="text-[22px] font-bold text-text" style={{ fontFamily: 'var(--font-head)' }}>System Logs</h1>
      <p className="text-[13px] text-text2 mt-1">Real-time log stream from all services.</p>
    </div>
  )
}

function SettingsPage() {
  return (
    <div className="p-8">
      <h1 className="text-[22px] font-bold text-text" style={{ fontFamily: 'var(--font-head)' }}>Settings</h1>
      <p className="text-[13px] text-text2 mt-1">Configure NightOwl preferences.</p>
    </div>
  )
}

function App() {
  const [isAgentSidebarOpen, setIsAgentSidebarOpen] = useState(true)
  useSocket()

  const path = window.location.pathname
  let content
  if (path === '/agents') {
    content = <AgentsPage />
  } else if (path === '/logs') {
    content = <LogsPage />
  } else if (path === '/settings') {
    content = <SettingsPage />
  } else if (path.startsWith('/incident/')) {
    const incidentId = path.split('/')[2]
    content = <IncidentDetail incidentId={incidentId} />
  } else {
    content = <Incidents />
  }

  return (
    <div className="h-screen flex overflow-hidden bg-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav isAgentSidebarOpen={isAgentSidebarOpen} setIsAgentSidebarOpen={setIsAgentSidebarOpen} />
        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            {content}
          </main>
          {isAgentSidebarOpen && <AgentSidebar setIsOpen={setIsAgentSidebarOpen} />}
        </div>
      </div>
    </div>
  )
}

export default App
