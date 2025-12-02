"use client";

import { useState } from "react";
import type { Ticket, TicketStatus, User } from "@/types/ticket";

type EditTicketModalProps = {
    ticket: Ticket;
    isSenior: boolean;
    developers: User[];
    onClose: () => void;
    onSave: (updates: {
        title?: string;
        description?: string;
        status?: TicketStatus;
        assignedToId?: number | null;
    }) => void;
};

const STATUS_OPTIONS: TicketStatus[] = [
    "IN_PROGRESS",
    "COMPLETED_PENDING",
    "CLOSED",
];

export default function EditTicketModal({
                                            ticket,
                                            isSenior,
                                            developers,
                                            onClose,
                                            onSave,
                                        }: EditTicketModalProps) {
    const [title, setTitle] = useState(ticket.title);
    const [description, setDescription] = useState(ticket.description);
    const [status, setStatus] = useState<TicketStatus>(ticket.status);
    const [assignedTo, setAssignedTo] = useState<number | "">(
        ticket.assignedToId ?? ""
    );

    const handleSave = () => {
        const updates: {
            title?: string;
            description?: string;
            status?: TicketStatus;
            assignedToId?: number | null;
        } = {
            title: title.trim(),
            description: description.trim(),
            status,
        };

        if (isSenior) {
            updates.assignedToId =
                assignedTo === "" ? null : Number(assignedTo);
        }

        onSave(updates);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 p-6 space-y-5">

                {/* HEADER */}
                <div className="flex justify-between items-center">
                    <h2 className="text-sm font-semibold">Edit ticket #{ticket.id}</h2>
                    <button
                        onClick={onClose}
                        className="text-xs text-slate-400 hover:text-slate-100"
                    >
                        ✕
                    </button>
                </div>

                {/* TITLE */}
                <div>
                    <label className="text-xs text-slate-300">Title</label>
                    <input
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-sm mt-1"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                {/* DESCRIPTION */}
                <div>
                    <label className="text-xs text-slate-300">Description</label>
                    <textarea
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-sm mt-1"
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                {/* STATUS + ASSIGNED */}
                <div className="flex gap-3 flex-wrap">

                    {/* STATUS */}
                    <div className="flex-1">
                        <label className="text-xs text-slate-300">Status</label>
                        <select
                            className="w-full mt-1 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-xs"
                            value={status}
                            onChange={(e) =>
                                setStatus(e.target.value as TicketStatus)
                            }
                        >
                            {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* ASSIGNED */}
                    <div className="flex-1">
                        <label className="text-xs text-slate-300">
                            Assigned to {isSenior ? "" : "(read only)"}
                        </label>
                        <select
                            className="w-full mt-1 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-xs"
                            value={assignedTo}
                            onChange={(e) =>
                                setAssignedTo(
                                    e.target.value === "" ? "" : Number(e.target.value)
                                )
                            }
                            disabled={!isSenior}
                        >
                            <option value="">– none –</option>
                            {developers.map((dev) => (
                                <option key={dev.id} value={dev.id}>
                                    {dev.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex justify-end gap-2 pt-2">
                    <button
                        onClick={onClose}
                        className="px-3 py-1 rounded-lg bg-slate-800 text-xs"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-3 py-1 rounded-lg bg-emerald-600 text-xs font-medium"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}
