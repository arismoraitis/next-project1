import type { Ticket, Comment, TicketStatus } from "@/types/ticket";

const BASE_URL = "/api"; // αργότερα θα το αλλάξεις αν χρειάζεται

export async function fetchTickets(): Promise<Ticket[]> {
    const res = await fetch(`${BASE_URL}/tickets`, { cache: "no-store" });
    if (!res.ok) {
        // προσωρινό mock αν σπάει
        console.warn("fetchTickets failed, using mock data");
        return [];
    }
    return res.json();
}

export async function fetchTicketById(id: number): Promise<Ticket> {
    const res = await fetch(`${BASE_URL}/tickets/${id}`);
    if (!res.ok) {
        throw new Error("Failed to fetch ticket");
    }
    return res.json();
}

export async function fetchComments(ticketId: number): Promise<Comment[]> {
    const res = await fetch(`${BASE_URL}/tickets/${ticketId}/comments`);
    if (!res.ok) {
        console.warn("fetchComments failed");
        return [];
    }
    return res.json();
}

export async function addComment(
    ticketId: number,
    comment: {
        body: string;
        code?: string;
        markAsCompleted?: boolean;
    }
): Promise<Comment> {
    const res = await fetch(`${BASE_URL}/tickets/${ticketId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(comment),
    });
    if (!res.ok) throw new Error("Failed to add comment");
    return res.json();
}

export async function updateTicketStatusApi(
    ticketId: number,
    status: TicketStatus
): Promise<Ticket> {
    const res = await fetch(`${BASE_URL}/tickets/${ticketId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error("Failed to update ticket");
    return res.json();
}
