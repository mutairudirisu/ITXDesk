"use client"

import TicketsTable from "../_components/TicketsTable"
import TopBar from "../_components/TopBar"

export default function TicketsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eef3ff] via-white to-white dark:bg-[#0b0f14] dark:bg-none">
      <TopBar title="Tickets" subtitle="Log requests, track progress, and export data." />
      <div className="p-2 md:p-4">
        <TicketsTable />
      </div>
    </div>
  )
}
