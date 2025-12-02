// src/types.ts
export type Role = "DEVELOPER" | "SENIOR";

export type User = {
    id: number;
    name: string;
    email: string;
    role: Role;
};

export type TicketStatus =
    | "IN_PROGRESS"
    | "COMPLETED_PENDING"
    | "CLOSED";

export type Ticket = {
    id: number;
    title: string;
    description: string;
    status: TicketStatus;
    createdById: number;
    assignedToId?: number | null;
    createdAt: string;
    updatedAt: string;
};

export type CommentType = "COMMENT" | "COMPLETION_UPDATE" | "REVIEW_FEEDBACK";

export type Comment = {
    id: number;
    ticketId: number;
    authorId: number;
    body: string;
    code?: string | null;
    type: CommentType;
    createdAt: string;
};
