import SideBarNav from "../_components/SideBarNav"
import AuthGate from "../_components/AuthGate"
import BottomNav from "../_components/BottomNav"

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden md:block sticky top-0 h-screen shrink-0 z-[90]">
        <SideBarNav />
      </aside>
      <main className="relative z-0 flex-1 min-w-0 pb-20 md:pb-0">
        <AuthGate>{children}</AuthGate>
      </main>
      <BottomNav />
    </div>
  )
}
