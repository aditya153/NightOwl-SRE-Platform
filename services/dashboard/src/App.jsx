import Sidebar from './components/Sidebar'
import TopNav from './components/TopNav'
import AgentSidebar from './components/AgentSidebar'
import Incidents from './pages/Incidents'
import { useState } from 'react'

const Dashboard = () => <div className="p-12"><h1 className="text-2xl font-bold font-headline text-white">Dashboard Overview</h1></div>
const Agents = () => <div className="p-12"><h1 className="text-2xl font-bold font-headline text-white">AI Agents Panel</h1></div>

function App() {
  const [isAgentSidebarOpen, setIsAgentSidebarOpen] = useState(true)

  // Simple routing for testing
  const path = window.location.pathname
  let Page = Dashboard
  if (path === '/incidents') Page = Incidents
  if (path === '/agents') Page = Agents

  return (
    <div className="flex min-h-screen bg-surface text-on-surface overflow-hidden relative font-sans selection:bg-primary selection:text-on-primary">
      {/* 256px Left Sidebar */}
      <Sidebar />
      
      {/* 64px Top Header that lives beside Left Sidebar */}
      <TopNav />
      
      {/* Main content push right by 256px and down by 64px */}
      <main className="ml-64 pt-16 flex-1 flex h-screen relative">
         <Page />
         
         <AgentSidebar isOpen={isAgentSidebarOpen} setIsOpen={setIsAgentSidebarOpen} />
      </main>
    </div>
  )
}

export default App
