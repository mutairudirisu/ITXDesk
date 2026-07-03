"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TicketsTable from "../_components/TicketsTable"
import TicketKanban from "../_components/TicketKanban"

export default function TicketsPage() {
  return (
    <Tabs defaultValue="table" className="space-y-4">
      <TabsList className="bg-white/80 backdrop-blur dark:bg-[#0f1620]">
        <TabsTrigger value="table">Table View</TabsTrigger>
        <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
      </TabsList>
      <TabsContent value="table">
        <TicketsTable />
      </TabsContent>
      <TabsContent value="kanban">
        <TicketKanban />
      </TabsContent>
    </Tabs>
  )
}
