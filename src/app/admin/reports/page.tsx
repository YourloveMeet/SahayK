export default function AdminReportsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0a0a0a] p-6 rounded-2xl shadow-sm border border-zinc-800">
        <div>
          <h1 className="text-3xl font-black text-white">Reports & Analytics</h1>
          <p className="text-zinc-500 font-medium">View platform statistics and generate reports.</p>
        </div>
      </div>
      <div className="p-12 bg-[#0a0a0a] rounded-2xl border border-zinc-800 text-center">
        <h3 className="text-xl font-bold text-white">Coming Soon</h3>
        <p className="text-zinc-500 mt-2">The reporting module is currently under development.</p>
      </div>
    </div>
  )
}
