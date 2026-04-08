import { supabase } from "./supabase";


export type TicketStatus = "Open" | "In Progress" | "Resolved" | "Closed";
export type TicketPriority = "Low" | "Medium" | "High" | "Urgent";
export type TicketCategory = "Hardware" | "Software" | "Network" | "Access" | "Other";

export type Ticket = {
  id: number;
  title: string;
  description: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  requester_name: string | null;
  requester_email: string | null;
  created_at: string;
};

export type TicketCreateData = {
  title: string;
  description?: string;
  priority: TicketPriority;
  category: TicketCategory;
  requester_name?: string;
  requester_email?: string;
};

export const getTickets = async () => {
  const { data, error } = await supabase
    .from("tickets")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("tickets could not be loaded");
  }

  return data as Ticket[];
};

export const insertTicket = async (ticketData: TicketCreateData) => {
  const { data, error } = await supabase
    .from("tickets")
    .insert([
      {
        ...ticketData,
        status: "Open",
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error("Failed to submit ticket: " + error.message);
  }

  return data as Ticket;
};

export const updateTicketStatus = async (id: number, newStatus: TicketStatus) => {
  const { data, error } = await supabase
    .from("tickets")
    .update({ status: newStatus })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error("ticket status could not be updated");
  }

  return data as Ticket;
};

const escapeCsv = (value: unknown) => {
  const str = value === null || value === undefined ? "" : String(value);
  const needsQuotes = /[",\n]/.test(str);
  const escaped = str.replaceAll('"', '""');
  return needsQuotes ? `"${escaped}"` : escaped;
};

export const ticketsToCsv = (tickets: Ticket[]) => {
  const headers = [
    "no",
    "title",
    "status",
    "priority",
    "category",
    "requester_name",
    "requester_email",
    "created_at",
    "description",
  ];

  const rows = tickets.map((t, idx) =>
    [
      idx + 1,
      t.title,
      t.status,
      t.priority,
      t.category,
      t.requester_name ?? "",
      t.requester_email ?? "",
      t.created_at,
      t.description ?? "",
    ]
      .map(escapeCsv)
      .join(",")
  );

  return [headers.join(","), ...rows].join("\n");
};
