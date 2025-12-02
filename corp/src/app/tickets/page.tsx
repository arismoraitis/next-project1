"use client";

import { useRouter } from "next/navigation";
import {FormEvent, useEffect, useState} from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTicketStore } from "@/store/useTicketStore";
import type { TicketStatus } from "@/types/ticket";
import RichTextEditor from "@/components/RichTextEditor";

export default function TicketsPage() {

    function stripHtml(html: string, maxLength = 200) {
        if (!html) return "";
        // βγάζει tags
        let text = html.replace(/<[^>]+>/g, " ");
        // βγάζει non-breaking spaces
        text = text.replace(/&nbsp;/g, " ");
        // κόβει σε λογικό μήκος
        text = text.trim();
        if (text.length > maxLength) {
            text = text.slice(0, maxLength) + "…";
        }
        return text;
    }


    const router = useRouter();
    const { user, isAuthenticated, users, logout } = useAuth();
    const { tickets, createTicket, removeTicket } = useTicketStore();

    const [filterStatus, setFilterStatus] = useState<TicketStatus | "ALL">(
        "ALL"
    );

    const [newTitle, setNewTitle] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [assignedTo, setAssignedTo] = useState<number | "">("");

    useEffect(() => {
        if (!isAuthenticated || !user) {
            router.replace("/login");
        }
    }, [isAuthenticated, user, router]);

    if (!isAuthenticated || !user) {
        return null; // ή <div>Loading...</div>
    }

    console.log("CURRENT USER IN /tickets:", user); // εδώ θα δεις role

    const developers = users.filter((u) => u.role === "DEVELOPER");

    const handleCreateTicket = (e: FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim()) return;

        createTicket(
            newTitle.trim(),
            newDesc.trim(),
            user.id,
            assignedTo === "" ? null : Number(assignedTo)
        );

        setNewTitle("");
        setNewDesc("");
        setAssignedTo("");
    };

    const filtered = tickets.filter((t) => {
        let ok = true;
        if (filterStatus !== "ALL") ok = ok && t.status === filterStatus;
        return ok;
    });

    return (
        <div className="p-6 space-y-6 max-w-5xl mx-auto">
            <header className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Tickets</h1>
                    <p className="text-sm text-slate-400">
                        Logged in as {user.name} ({user.role})
                    </p>
                </div>
                <div className="flex gap-2 items-center">
                    <select
                        className="rounded-lg border border-slate-700 bg-slate-950 text-xs px-2 py-1"
                        value={filterStatus}
                        onChange={(e) =>
                            setFilterStatus(e.target.value as TicketStatus | "ALL")
                        }
                    >
                        <option value="ALL">All statuses</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="COMPLETED_PENDING">COMPLETED_PENDING</option>
                        <option value="CLOSED">CLOSED</option>
                    </select>

                    <button
                        onClick={logout}
                        className="text-xs text-slate-400 hover:text-slate-100"
                    >
                        Logout
                    </button>
                </div>
            </header>


            {user.role === "SENIOR" && (
                <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
                    <h2 className="text-sm font-semibold">Create new ticket</h2>
                    <form
                        className="grid gap-3 md:grid-cols-2 md:items-start"
                        onSubmit={handleCreateTicket}
                    >
                        <div className="space-y-2">
                            <input
                                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-sm"
                                placeholder="Title"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                            />
                            <RichTextEditor
                                value={newDesc.trim()}
                                onChangeAction={setNewDesc}
                                placeholder="Ticket description…"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-slate-300">
                                Assign to developer
                                <select
                                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-sm"
                                    value={assignedTo}
                                    onChange={(e) =>
                                        setAssignedTo(
                                            e.target.value === "" ? "" : Number(e.target.value)
                                        )
                                    }
                                >
                                    <option value="">– none –</option>
                                    {developers.map((dev) => (
                                        <option key={dev.id} value={dev.id}>
                                            {dev.name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <button
                                type="submit"
                                className="mt-2 w-full rounded-lg bg-emerald-600 py-2 text-xs font-medium"
                            >
                                Create ticket
                            </button>
                        </div>
                    </form>
                </section>
            )}

            {/* Tickets List */}
            <section className="space-y-3">
                {filtered.map((t) => {
                    const assignedUser = users.find((u) => u.id === t.assignedToId);
                    const creator = users.find((u) => u.id === t.createdById);

                    return (
                        <div
                            key={t.id}
                            className="w-full text-left rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3"
                        >
                            <div className="flex justify-between items-start gap-4">
                                {/* Αριστερό μέρος – click για details */}
                                <div
                                    className="flex-1 cursor-pointer"
                                    onClick={() => router.push(`/tickets/${t.id}`)}
                                >
                                    <h2 className="text-sm font-semibold">{t.title}</h2>
                                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                                        {stripHtml(t.description)}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-2">
                                        Created by{" "}
                                        <span className="font-medium">
                {creator?.name ?? "Unknown"}
              </span>{" "}
                                        • Assigned to{" "}
                                        <span className="font-medium">
                {assignedUser?.name ?? "—"}
              </span>
                                    </p>
                                </div>

                                {/* Δεξί μέρος – status + Edit */}
                                <div className="flex flex-col items-end gap-2">
            <span className="text-[10px] px-3 py-1 rounded-full border border-slate-700 uppercase">
              {t.status}
            </span>
                                    <button
                                        onClick={() => router.push(`/tickets/${t.id}`)}
                                        className="text-[10px] px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700"
                                    >
                                        Open Ticket
                                    </button>

                                    <button
                                        onClick={() => removeTicket(t.id)}
                                        className="text-[10px] px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {filtered.length === 0 && (
                    <p className="text-sm text-slate-500">No tickets found.</p>
                )}
            </section>
        </div>
    );
}
