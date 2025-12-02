"use client";

import React, {
    useRef,
    useEffect,
    useCallback,
    ChangeEvent,
    useState,
} from "react";

type Props = {
    value: string;
    onChangeAction: (value: string) => void;
    readOnly?: boolean;
    placeholder?: string;
};

export default function RichTextEditor({
                                           value,
                                           onChangeAction,
                                           readOnly = false,
                                           placeholder = "",
                                       }: Props) {
    const editorRef = useRef<HTMLDivElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [isFocused, setIsFocused] = useState(false);

    // sync prop -> DOM
    useEffect(() => {
        if (!editorRef.current) return;
        const current = editorRef.current.innerHTML;
        if (value !== current) {
            editorRef.current.innerHTML = value || "";
        }
    }, [value]);

    // όταν αλλάζει το DOM, ενημερώνουμε parent
    const handleInput = useCallback(() => {
        if (!editorRef.current) return;
        onChangeAction(editorRef.current.innerHTML);
    }, [onChangeAction]);

    //  helper
    const exec = (command: string, value?: string) => {
        if (readOnly) return;
        editorRef.current?.focus();

        document.execCommand(command, false, value);
        handleInput();
    };

    const handleLink = () => {
        if (readOnly) return;
        const url = window.prompt("Link URL");
        if (!url) return;
        exec("createLink", url);
    };

    const triggerImageUpload = () => {
        if (readOnly) return;
        fileInputRef.current?.click();
    };

    const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const src = reader.result as string;
            insertHtmlAtCursor(`<img src="${src}" alt="" />`);
            handleInput();
        };
        reader.readAsDataURL(file);

        event.target.value = "";
    };

    const insertHtmlAtCursor = (html: string) => {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0 || !editorRef.current) {
            editorRef.current?.focus();
            return;
        }

        const range = sel.getRangeAt(0);
        range.deleteContents();

        const temp = document.createElement("div");
        temp.innerHTML = html;
        const frag = document.createDocumentFragment();

        let node: ChildNode | null;
        let lastNode: ChildNode | null = null;
        while ((node = temp.firstChild)) {
            lastNode = frag.appendChild(node);
        }

        range.insertNode(frag);

        if (lastNode) {
            range.setStartAfter(lastNode);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
        }
    };

    const btn =
        "px-2 py-1 text-[10px] rounded border border-slate-700 bg-slate-900 hover:bg-slate-800";

    return (
        <div className="space-y-1">
            {/* Toolbar */}
            {!readOnly && (
                <div className="flex flex-wrap gap-1 border border-slate-800 rounded-lg px-2 py-1 bg-slate-950">
                    {/* basic */}
                    <button type="button" onClick={() => exec("bold")} className={btn}>
                        B
                    </button>
                    <button type="button" onClick={() => exec("italic")} className={btn}>
                        I
                    </button>
                    <button
                        type="button"
                        onClick={() => exec("underline")}
                        className={btn}
                    >
                        U
                    </button>
                    <button
                        type="button"
                        onClick={() => exec("strikeThrough")}
                        className={btn}
                    >
                        S
                    </button>

                    {/* headings */}
                    <button
                        type="button"
                        onClick={() => exec("formatBlock", "<h1>")}
                        className={btn}
                    >
                        H1
                    </button>
                    <button
                        type="button"
                        onClick={() => exec("formatBlock", "<h2>")}
                        className={btn}
                    >
                        H2
                    </button>
                    <button
                        type="button"
                        onClick={() => exec("formatBlock", "<h3>")}
                        className={btn}
                    >
                        H3
                    </button>

                    {/* lists */}
                    <button
                        type="button"
                        onClick={() => exec("insertUnorderedList")}
                        className={btn}
                    >
                        • List
                    </button>
                    <button
                        type="button"
                        onClick={() => exec("insertOrderedList")}
                        className={btn}
                    >
                        1. List
                    </button>

                    {/* align */}
                    <button
                        type="button"
                        onClick={() => exec("justifyLeft")}
                        className={btn}
                    >
                        Left
                    </button>
                    <button
                        type="button"
                        onClick={() => exec("justifyCenter")}
                        className={btn}
                    >
                        Center
                    </button>
                    <button
                        type="button"
                        onClick={() => exec("justifyRight")}
                        className={btn}
                    >
                        Right
                    </button>

                    {/* link / image */}
                    <button type="button" onClick={handleLink} className={btn}>
                        Link
                    </button>
                    <button type="button" onClick={triggerImageUpload} className={btn}>
                        Image
                    </button>

                    {/* undo / redo */}
                    <button type="button" onClick={() => exec("undo")} className={btn}>
                        ⤺
                    </button>
                    <button type="button" onClick={() => exec("redo")} className={btn}>
                        ⤻
                    </button>
                </div>
            )}

            {/* Contenteditable area */}
            <div
                className={`rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 ${
                    readOnly ? "opacity-80 cursor-default" : "cursor-text"
                }`}
                onClick={() => {
                    if (!readOnly) editorRef.current?.focus();
                }}
            >
                {!value && !isFocused && !readOnly && (
                    <div className="pointer-events-none select-none text-[10px] text-slate-500">
                        {placeholder}
                    </div>
                )}
                <div
                    ref={editorRef}
                    className="rich-text-content min-h-[120px] text-xs outline-none"
                    contentEditable={!readOnly}
                    suppressContentEditableWarning
                    onInput={handleInput}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                />
            </div>

            {/* hidden file input for images */}
            {!readOnly && (
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                />
            )}
        </div>
    );
}
