export default function VolunteerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b bg-background px-6 py-4">
        {/* Header content: Logo, User profile, Notifications, Help Score */}
        <h1 className="text-2xl font-bold">SahayaK Volunteer</h1>
      </header>
      <div className="flex flex-1">
        <aside className="w-64 border-r hidden md:block px-4 py-6">
          {/* Sidebar navigation */}
          <nav className="space-y-2">
            <a href="/volunteer/dashboard" className="block p-2 hover:bg-accent rounded-md">Dashboard</a>
            <a href="/volunteer/tasks" className="block p-2 hover:bg-accent rounded-md">Tasks</a>
            <a href="/volunteer/profile" className="block p-2 hover:bg-accent rounded-md">Profile</a>
          </nav>
        </aside>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
