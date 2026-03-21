import Sidebar from './components/Sidebar'
import TopNav from './components/TopNav'
import AgentSidebar from './components/AgentSidebar'
import Incidents from './pages/Incidents'
import { useState } from 'react'

function App() {
  const [isAgentSidebarOpen, setIsAgentSidebarOpen] = useState(true)

  // Simple routing for testing
  const path = window.location.pathname
  let Page = Incidents
  if (path === '/agents') {
    Page = () => <div className="p-12 flex-1 w-full"><h1 className="text-2xl font-bold font-headline text-white">AI Agents Panel</h1></div>
  } else if (path === '/logs') {
    Page = () => <div className="p-12 flex-1 w-full"><h1 className="text-2xl font-bold font-headline text-white">System Logs</h1></div>
  } else if (path === '/settings') {
    Page = () => <div className="p-12 flex-1 w-full"><h1 className="text-2xl font-bold font-headline text-white">Settings</h1></div>
  } else if (path === '/') {
    Page = Incidents
  }

  return (
    <div className="flex min-h-screen bg-surface text-on-surface overflow-x-auto relative font-sans selection:bg-primary selection:text-on-primary min-w-[1280px]">
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
