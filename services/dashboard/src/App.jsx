import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'

function App() {
  return (
    <div className="flex min-h-screen bg-owl-bg">
      <Sidebar />
      <main className="flex-1">
        <Dashboard />
      </main>
    </div>
  )
}

export default App
