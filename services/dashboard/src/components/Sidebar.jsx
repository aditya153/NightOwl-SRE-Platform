export default function Sidebar() {
  const links = [
    { name: "Dashboard", path: "/" },
    { name: "Incidents", path: "/incidents" },
    { name: "Agents", path: "/agents" },
  ]

  return (
    <aside className="w-64 min-h-screen bg-owl-surface border-r border-owl-border p-6">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-owl-blue tracking-wide">NightOwl</h2>
        <p className="text-xs text-owl-muted mt-1">Autonomous SRE Platform</p>
      </div>
      <nav className="flex flex-col gap-2">
        {links.map((link) => (
          <a
            key={link.path}
            href={link.path}
            className="px-4 py-2 rounded-lg text-owl-muted hover:text-owl-text hover:bg-owl-bg transition-colors"
          >
            {link.name}
          </a>
        ))}
      </nav>
    </aside>
  )
}
