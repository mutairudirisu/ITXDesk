"use client"

import { useState, useMemo } from "react"
import useSWR from "swr"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { getTickets, updateTicketStatus, type Ticket } from "@/app/_lib/data-service"
import { getStatusBadgeClass, getPriorityBadgeClass, STATUS_OPTIONS } from "@/lib/ticket-utils"

interface SortableTicketProps {
  ticket: Ticket
  isOverlay?: boolean
}

function SortableTicket({ ticket, isOverlay }: SortableTicketProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: ticket.id,
    disabled: false,
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 999 : "auto",
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white/80 backdrop-blur dark:bg-[#0f1620] shadow-sm cursor-grab active:cursor-grabbing"
    >
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="font-mono text-xs text-zinc-600 dark:text-zinc-400">#{ticket.id}</div>
            <Badge className={getPriorityBadgeClass(ticket.priority)}>{ticket.priority}</Badge>
          </div>
          <div className="font-medium">{ticket.title}</div>
          <div className="text-xs text-zinc-600 dark:text-zinc-400">
            {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : "—"}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function TicketKanban() {
  const { data: tickets, error, isLoading, mutate } = useSWR<Ticket[]>("tickets", getTickets)
  const { toast } = useToast()
  const [activeId, setActiveId] = useState<number | null>(null)
  const [columns, setColumns] = useState<Record<string, Ticket[]>>({})

  // Initialize columns from tickets
  useMemo(() => {
    if (!tickets) return
    const initialColumns = STATUS_OPTIONS.reduce((acc, status) => {
      acc[status] = tickets.filter(t => t.status === status)
      return acc
    }, {} as Record<string, Ticket[]>)
    setColumns(initialColumns)
  }, [tickets])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event

    if (!over) return

    const activeTicket = tickets?.find(t => t.id === active.id)
    if (!activeTicket) return

    // Find which column the dragged ticket is coming from
    let sourceColumn = activeTicket.status
    let destinationColumn: string | null = null

    // Check if over is a column ID
    if (STATUS_OPTIONS.includes(over.id as string)) {
      destinationColumn = over.id as string
    } else {
      // If over is a ticket, get its column
      const overTicket = tickets?.find(t => t.id === over.id)
      if (overTicket) {
        destinationColumn = overTicket.status
      }
    }

    if (!destinationColumn || sourceColumn === destinationColumn) return

    // Optimistic update
    const newColumns = { ...columns }
    const sourceItems = [...newColumns[sourceColumn]]
    const activeIndex = sourceItems.findIndex(t => t.id === active.id)
    if (activeIndex !== -1) {
      const [movedItem] = sourceItems.splice(activeIndex, 1)
      newColumns[sourceColumn] = sourceItems
      newColumns[destinationColumn] = [...newColumns[destinationColumn], { ...movedItem, status: destinationColumn as Ticket["status"] }]
      setColumns(newColumns)
    }

    // Persist to database
    try {
      await updateTicketStatus(active.id as number, destinationColumn as Ticket["status"])
      await mutate()
      toast({ title: "Updated", description: "Ticket status updated", variant: "success" })
    } catch {
      // Revert optimistic update
      if (tickets) {
        const revertedColumns = STATUS_OPTIONS.reduce((acc, status) => {
          acc[status] = tickets.filter(t => t.status === status)
          return acc
        }, {} as Record<string, Ticket[]>)
        setColumns(revertedColumns)
      }
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" })
    }
  }

  const activeTicket = useMemo(() => tickets?.find(t => t.id === activeId), [tickets, activeId])

  if (error) {
    return (
      <div className="rounded-xl border bg-white/80 p-6 backdrop-blur dark:bg-zinc-950/60">
        <p className="text-sm text-red-600">Failed to load tickets</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Ticket Board</h2>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">Drag tickets to update status</p>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {STATUS_OPTIONS.map((status) => (
            <div key={status} className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{status}</h3>
                <Badge variant="outline">{columns[status]?.length || 0}</Badge>
              </div>
              <div
                className="space-y-2 min-h-[200px] p-2 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-800"
              >
                <SortableContext
                  items={columns[status]?.map(t => t.id) || []}
                  strategy={verticalListSortingStrategy}
                >
                  {isLoading ? (
                    <div className="text-center text-sm text-zinc-500 py-4">Loading...</div>
                  ) : columns[status]?.length === 0 ? (
                    <div className="text-center text-sm text-zinc-500 py-4">No tickets</div>
                  ) : (
                    columns[status].map((ticket) => (
                      <SortableTicket key={ticket.id} ticket={ticket} />
                    ))
                  )}
                </SortableContext>
              </div>
            </div>
          ))}
        </div>

        <DragOverlay>
          {activeTicket ? <SortableTicket ticket={activeTicket} isOverlay /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
