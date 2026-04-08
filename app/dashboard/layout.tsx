import SideBarNav from "../_components/SideBarNav"
import AuthGate from "../_components/AuthGate"
import BottomNav from "../_components/BottomNav"
import TopBar from "../_components/TopBar"

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden md:block sticky top-0 h-screen shrink-0 z-[90]">
        <SideBarNav />
      </aside>
      <main className="relative z-0 flex-1 min-w-0">
        <AuthGate>
          <div className="min-h-screen bg-gradient-to-b from-[#eef3ff] via-white to-white dark:bg-[#0b0f14] dark:bg-none">
            <TopBar />
            <div className="p-2 md:p-4 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-6">{children}</div>
          </div>
        </AuthGate>
      </main>
      <BottomNav />
    </div>
  )
}
