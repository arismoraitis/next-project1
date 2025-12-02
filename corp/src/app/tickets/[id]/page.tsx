"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo, useState, useEffect } from "react";

import { useAuth } from "@/contexts/AuthContext";
import { useTicketStore } from "@/store/useTicketStore";
import type { TicketStatus } from "@/types/ticket";
import RichTextEditor from "@/components/RichTextEditor";
import {RICH_TEXT_CLASSES} from "@/richTextStyles";


const STATUS_OPTIONS: TicketStatus[] = ["IN_PROGRESS", "COMPLETED_PENDING", "CLOSED"];

type CommentDraft = {
    id: number;
    authorId: number;
    body: string;
    deleteBody: boolean;
};


export default function TicketDetailsPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();

    const {user, isAuthenticated, users} = useAuth();
    const {tickets, comments, editTicket, addComment, updateComment, deleteComment, removeTicket} =
        useTicketStore();

    useEffect(() => {
        if (!isAuthenticated || !user) {
            router.replace("/login");
        }
    }, [isAuthenticated, user, router]);

    if (!isAuthenticated || !user) {
        return null; // ή <div>Loading...</div>
    }

    const ticketId = Number(params.id);
    const ticket = tickets.find((t) => t.id === ticketId);

    if (!ticket) {
        return <div className="p-6">Ticket not found.</div>;
    }

    const ticketComments = useMemo(
        () => comments.filter((c) => c.ticketId === ticket.id),
        [comments, ticket.id]
    );

    const creator = users.find((u) => u.id === ticket.createdById);
    const assignedUser = users.find((u) => u.id === ticket.assignedToId);
    const developers = users.filter((u) => u.role === "DEVELOPER");

    const isDeveloper = user.role === "DEVELOPER";
    const isSenior = user.role === "SENIOR";

    // ------------ GLOBAL EDIT MODE ------------
    const [isEditing, setIsEditing] = useState(false);

    // Ticket editable fields
    const [editTitle, setEditTitle] = useState(ticket.title);
    const [editDescription, setEditDescription] = useState(ticket.description);
    const [editStatus, setEditStatus] = useState<TicketStatus>(ticket.status);
    const [editAssignedTo, setEditAssignedTo] = useState<number | "">(
        ticket.assignedToId ?? ""
    );

    // Drafts για ΟΛΑ τα υπάρχοντα comments του ticket
    const [commentDrafts, setCommentDrafts] = useState<CommentDraft[]>([]);

    // Draft για ΝΕΟ comment (μόνο body)
    const [newCommentBody, setNewCommentBody] = useState("");

    const enterEditMode = () => {
        setEditTitle(ticket.title);
        setEditDescription(ticket.description);
        setEditStatus(ticket.status);
        setEditAssignedTo(ticket.assignedToId ?? "");

        setCommentDrafts(
            ticketComments.map((c) => ({
                id: c.id,
                authorId: c.authorId,
                body: c.body,
                deleteBody: false,
            }))
        );

        setNewCommentBody("");
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setEditTitle(ticket.title);
        setEditDescription(ticket.description);
        setEditStatus(ticket.status);
        setEditAssignedTo(ticket.assignedToId ?? "");
        setCommentDrafts([]);
        setNewCommentBody("");
        setIsEditing(false);
    };

    const handleSaveTicket = () => {
        // 1) Ticket updates
        const updates: {
            title?: string;
            description?: string;
            status?: TicketStatus;
            assignedToId?: number | null;
        } = {
            title: editTitle.trim(),
            description: editDescription.trim(),
            status: editStatus,
        };

        if (isSenior) {
            updates.assignedToId =
                editAssignedTo === "" ? null : Number(editAssignedTo);
        }

        editTicket(ticket.id, updates);

        // 2) Existing comments: update / "delete" body (μόνο για δικά του)
        commentDrafts.forEach((draft) => {
            if (draft.authorId !== user.id) return;

            const newBody = draft.deleteBody ? "" : draft.body.trim();

            // Αν το body είναι άδειο -> μπορούμε να σβήσουμε τελείως το comment
            if (!newBody) {
                deleteComment(draft.id);
            } else {
                updateComment(draft.id, {
                    body: newBody,
                });
            }
        });

        // 3) ΝΕΟ comment (αν έχει γράψει κάτι)
        if (newCommentBody.trim()) {
            // Προσαρμόζεις το addComment στο store ώστε να μην χρειάζεται code
            addComment(ticket.id, user.id, newCommentBody.trim(), "COMMENT");
        }

        setIsEditing(false);
        setCommentDrafts([]);
        setNewCommentBody("");
    };

    // helpers για draft comments
    const updateDraftBody = (id: number, body: string) => {
        setCommentDrafts((prev) =>
            prev.map((d) => (d.id === id ? { ...d, body } : d))
        );
    };

    const toggleDeleteBody = (id: number) => {
        setCommentDrafts((prev) =>
            prev.map((d) =>
                d.id === id ? { ...d, deleteBody: !d.deleteBody } : d
            )
        );
    };

    const getDraftFor = (id: number) =>
        commentDrafts.find((d) => d.id === id) || null;

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8">
            <button
                onClick={() => router.push("/tickets")}
                className="text-xs text-slate-400 hover:text-slate-200"
            >
                ← Back to tickets
            </button>

            {/* ========== HEADER + GLOBAL EDIT BUTTON ========== */}
            <header className="space-y-2">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                        {isEditing ? (
                            <>
                                <input
                                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-sm"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                />

                                <RichTextEditor
                                    value={editDescription}
                                    onChangeAction={setEditDescription}
                                    placeholder="Ticket description…"
                                />
                            </>
                        ) : (
                            <>
                                <h1 className="text-2xl font-semibold">{ticket.title}</h1>

                                <div
                                    className={RICH_TEXT_CLASSES}
                                    dangerouslySetInnerHTML={{ __html: ticket.description || "<p>—</p>" }}
                                />
                            </>

                        )}

                        <p className="text-sm text-slate-400">
                            Created by{" "}
                            <span className="font-medium">
                {creator?.name ?? "Unknown"}
              </span>{" "}
                            • Assigned to{" "}
                            {isEditing ? (
                                <select
                                    className="ml-1 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-xs"
                                    value={editAssignedTo}
                                    onChange={(e) =>
                                        setEditAssignedTo(
                                            e.target.value === "" ? "" : Number(e.target.value)
                                        )
                                    }
                                    disabled={isDeveloper} // dev δεν αλλάζει assigned
                                >
                                    <option value="">– none –</option>
                                    {developers.map((dev) => (
                                        <option key={dev.id} value={dev.id}>
                                            {dev.name}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <span className="font-medium">
                  {assignedUser?.name ?? "—"}
                </span>
                            )}
                        </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        {/* STATUS */}
                        <select
                            className="text-[10px] px-2 py-1 rounded-full border border-slate-700 bg-slate-950 uppercase"
                            value={isEditing ? editStatus : (ticket.status as TicketStatus)}
                            onChange={(e) =>
                                setEditStatus(e.target.value as TicketStatus)
                            }
                            disabled={!isEditing}
                        >
                            {STATUS_OPTIONS.map((s) => (
                                <option
                                    key={s}
                                    value={s}
                                    disabled={isDeveloper && s === "CLOSED"}
                                >
                                    {s}
                                </option>
                            ))}
                        </select>

                        {!isEditing ? (
                            <div className="flex gap-2">
                            <button
                                onClick={enterEditMode}
                                className="text-[10px] px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700"
                            >
                                Edit ticket
                            </button>
                            <button
                                onClick={() => {
                                    removeTicket(ticket.id);
                                    router.push("/tickets");
                                }}
                                className="text-[10px] px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700"
                            >
                                Delete
                            </button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSaveTicket}
                                    className="text-[10px] px-3 py-1 rounded-xl bg-emerald-600"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={handleCancelEdit}
                                    className="text-[10px] px-3 py-1 rounded-xl bg-slate-700"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* ========== COMMENTS SECTION (ΜΟΝΟ body) ========== */}
            <section className="space-y-3">
                <h2 className="font-medium text-sm">Comments</h2>
                <div className="space-y-2">
                    {ticketComments.map((c) => {
                        const author = users.find((u) => u.id === c.authorId);
                        const draft = getDraftFor(c.id);
                        const isMine = c.authorId === user.id;

                        const bodyValue = isEditing && draft ? draft.body : c.body;
                        const deleteBody = draft?.deleteBody ?? false;

                        const showStriked = isEditing && isMine && deleteBody;

                        return (
                            <div
                                key={c.id}
                                className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3"
                            >
                                <div className="flex justify-between items-start gap-3">
                                    <div className="flex-1 space-y-2">
                                        <p className="text-xs text-slate-300">
                      <span className="font-semibold">
                        {author?.name ?? "Unknown"}
                      </span>{" "}
                                            <span className="text-slate-500">
                        ({author?.role.toLowerCase()})
                      </span>
                                        </p>

                                        {isEditing && isMine ? (
                                            <RichTextEditor
                                                value={bodyValue}
                                                onChangeAction={(html) => updateDraftBody(c.id, html)}
                                                placeholder="Edit your comment…"
                                            />
                                        ) : (
                                            <div
                                                className={`
    text-xs ${RICH_TEXT_CLASSES}
    ${showStriked ? "line-through opacity-60" : ""}
  `}
                                                dangerouslySetInnerHTML={{
                                                    __html: bodyValue || "—",
                                                }}
                                            />

                                        )}

                                    </div>

                                    {isEditing && isMine && (
                                        <button
                                            onClick={() => toggleDeleteBody(c.id)}
                                            className={`text-[9px] ${
                                                deleteBody
                                                    ? "text-slate-300"
                                                    : "text-red-400 hover:text-red-200"
                                            }`}
                                        >
                                            {deleteBody ? "Undo delete" : "Delete comment"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {ticketComments.length === 0 && (
                        <p className="text-xs text-slate-500">No comments yet.</p>
                    )}
                </div>

                {/* ΝΕΟ COMMENT (μόνο body) */}
                {isEditing && (
                    <div className="mt-4 space-y-2">
                        <h3 className="text-xs font-semibold text-slate-300">
                            New comment
                        </h3>

                        {/* ΠΡΙΝ: <textarea ... /> */}
                        <RichTextEditor
                            value={newCommentBody}
                            onChangeAction={setNewCommentBody}
                            placeholder="Νέο σχόλιο… (format, links, εικόνες κτλ.)"
                        />
                    </div>
                )}
            </section>
        </div>
    );
}
