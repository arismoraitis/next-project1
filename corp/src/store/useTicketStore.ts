// src/store/useTicketStore.ts
"use client";

import { create } from "zustand";
import type { Ticket, TicketStatus, Comment } from "@/types/ticket";
import {persist} from "zustand/middleware";

type TicketStore = {
    tickets: Ticket[];
    comments: Comment[];
    createTicket: (
        title: string,
        description: string,
        createdById: number,
        assignedToId?: number | null
    ) => void;
    editTicket: (
        ticketId: number,
        updates: {
            title?: string;
            description?: string;
            status?: TicketStatus;
            assignedToId?: number | null;
        }
    ) => void;
    removeTicket: (
        ticketId: number,
    ) => void;
    updateTicketStatus: (ticketId: number, status: TicketStatus) => void;
    addComment: (
        ticketId: number,
        authorId: number,
        body: string,
        code?: string | null,
        type?: Comment["type"]
    ) => void;
    updateComment: (
        commentId: number,
        updates: { body?: string; code?: string | null }
    ) => void;
    deleteComment: (commentId: number) => void;
};


export const useTicketStore = create<TicketStore>()(
    persist(
        (set) => ({
            tickets: [],
            comments: [],

            createTicket: (title, description, createdById, assignedToId = null) =>
                set((state) => {
                    const now = new Date().toISOString();
                    const newId =
                        state.tickets.length === 0
                            ? 1
                            : Math.max(...state.tickets.map((t) => t.id)) + 1;

                    return {
                        tickets: [
                            {
                                id: newId,
                                title,
                                description,
                                status: "IN_PROGRESS",
                                createdById,
                                assignedToId,
                                createdAt: now,
                                updatedAt: now,
                            },
                            ...state.tickets,
                        ],
                    };
                }),

            editTicket: (ticketId, updates) =>
                set((state) => ({
                    tickets: state.tickets.map((t) =>
                        t.id === ticketId
                            ? { ...t, ...updates, updatedAt: new Date().toISOString() }
                            : t
                    ),
                })),

            removeTicket: (ticketId) =>
                set((state) => ({
                    tickets: state.tickets.filter((t) => t.id !== ticketId),
                    comments: state.comments.filter((c) => c.ticketId !== ticketId),
                })),

            updateTicketStatus: (ticketId, status) =>
                set((state) => ({
                    tickets: state.tickets.map((t) =>
                        t.id === ticketId
                            ? { ...t, status, updatedAt: new Date().toISOString() }
                            : t
                    ),
                })),

            addComment: (ticketId, authorId, body, code = null, type = "COMMENT") =>
                set((state) => {
                    const newId =
                        state.comments.length === 0
                            ? 1
                            : Math.max(...state.comments.map((c) => c.id)) + 1;

                    return {
                        comments: [
                            ...state.comments,
                            {
                                id: newId,
                                ticketId,
                                authorId,
                                body,
                                code,
                                type,
                                createdAt: new Date().toISOString(),
                            },
                        ],
                    };
                }),

            updateComment: (commentId, updates) =>
                set((state) => ({
                    comments: state.comments.map((c) =>
                        c.id === commentId ? { ...c, ...updates } : c
                    ),
                })),

            deleteComment: (commentId) =>
                set((state) => ({
                    comments: state.comments.filter((c) => c.id !== commentId),
                })),
        }),
        {
            name: "ticket-store",
        }
    )
);
