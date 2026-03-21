import { useState } from 'react'
import Sidebar from './components/Sidebar'
import AgentSidebar from './components/AgentSidebar'
import Dashboard from './pages/Dashboard'
import Incidents from './pages/Incidents'
import Agents from './pages/Agents'

function App() {
  const path = window.location.pathname
  const [isAgentSidebarOpen, setIsAgentSidebarOpen] = useState(true)

  let Page = Dashboard
  if (path === '/incidents') Page = Incidents
  if (path === '/agents') Page = Agents

  return (
    <div className="flex min-h-screen bg-[#131313] text-[#e5e2e1] overflow-hidden relative font-sans selection:bg-[#4d8eff]/30">
      <Sidebar />
      <main className={`flex-1 transition-all duration-300 ${isAgentSidebarOpen ? 'mr-80' : ''}`}>
         <Page />
      </main>
      <AgentSidebar isOpen={isAgentSidebarOpen} setIsOpen={setIsAgentSidebarOpen} />
    </div>
  )
}

export default App
