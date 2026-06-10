export default function SeekerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b bg-background px-6 py-4">
        {/* Header content: Logo, User profile, Notifications */}
        <h1 className="text-2xl font-bold">SahayaK Seeker</h1>
      </header>
      <div className="flex flex-1">
        <aside className="w-64 border-r hidden md:block px-4 py-6">
          {/* Sidebar navigation */}
          <nav className="space-y-2">
            <a href="/seeker/dashboard" className="block p-2 hover:bg-accent rounded-md">Dashboard</a>
            <a href="/seeker/tasks" className="block p-2 hover:bg-accent rounded-md">My Tasks</a>
            <a href="/seeker/profile" className="block p-2 hover:bg-accent rounded-md">Profile</a>
          </nav>
        </aside>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
