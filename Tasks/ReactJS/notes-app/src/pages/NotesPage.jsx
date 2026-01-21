import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import QuotesBar from '../components/QuotesBar';
import NotesGrid from '../components/Notesgrid';
import Modal from '../components/Open_Note_Modal';
import { loadNotes, savedNotes } from '../utils/storage/localeStorage';
import React from "react";
import { useState, useMemo, useEffect, createContext } from "react";



// NotesPage will hold the addition deletion and all functionality + hold a dict for each added notes
// This dict will be passed to Notesgrid where it would be mapped each note via NotesCard

// Now addition of a method to call open_note_model to implement note addition function

const COLORS = ["bg-pink-300", "bg-orange-300", "bg-green-300", "bg-violet-300", "bg-sky-300"];
function uid() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
// export const noteTitleContext = React.createContext(null);

export default function NotesPage() {
    // const [notes, setNotes] = useState([
    //     {
    //         id: "1",
    //         title: "The beginning of this page",
    //         body: "olla",
    //         color: "bg-yellow-200",
    //         starred: false,
    //         createdAt: new Date("2020-05-21"),
    //     },
    // ]);
    const [notes, setNotes] = useState(() => {
        const stored = loadNotes();
        if (stored) return stored;
        return [];
    });
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [color, setColor] = useState(COLORS[0]);
    const [starred, setStarred] = useState(false);
    const [viewNoteId, setViewNoteId] = useState(null);
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    const viewedNote = notes.find(n => n.id === viewNoteId) || null;
    const viewModalTitle = (viewedNote !== null) ? viewedNote.title : "Note";
    const createEditModalTitle = editingNoteId !== null ? "Edit Note" : "New Note";

    const filteredNotes = useMemo(() => {
        return notes.filter(note => {
            const q = searchQuery.toLowerCase();
            return (
                note.title.toLowerCase().includes(q) || note.body.toLowerCase().includes(q)
            );
        }).sort((a, b) => (Number(b.starred) - Number(a.starred)));
    }, [notes, searchQuery]);

    useEffect(() => {
        savedNotes(notes);
    }, [notes]);

    useEffect(() => {
        if (!isCreateOpen && viewNoteId === null) return;
        function handleEsc(event) {
            if (event.key === "Escape") {
                if (isCreateOpen) {
                    closeCreate();
                } else if (viewNoteId !== null) {
                    closeView();
                }
            }
        }

        window.addEventListener("keydown", handleEsc);
        return () => {
            window.removeEventListener("keydown", handleEsc);
        };
    }, [isCreateOpen, viewNoteId]);

    function openCreate() {
        setTitle("");
        setBody("");
        setColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
        setStarred(false);
        setIsCreateOpen(true);
    }
    function openEdit(note) {
        setEditingNoteId(note.id);
        setTitle(note.title);
        setBody(note.body);
        setColor(note.color);
        setStarred(note.starred);
        setIsCreateOpen(true);
    }
    function openView(id) {
        setViewNoteId(id);
    }
    function closeView() {
        setViewNoteId(null);
    }
    function closeCreate() {
        setEditingNoteId(null);
        setIsCreateOpen(false);
    }
    function saveNote() {
        const t = title.trim();
        if (!t) return;
        if (editingNoteId === null) {
            const newNote = {
                id: uid(),
                title: t,
                body: body,
                color: color,
                starred: starred,
                createdAt: new Date(),
            };
            setNotes((prev) => [newNote, ...prev]);
        } else {
            setNotes(
                prev => prev.map(
                    note => note.id === editingNoteId ? { ...note, title: t, body, color, starred } : note
                )
            );
        }
        setEditingNoteId(null);
        setIsCreateOpen(false);
    }
    function deleteNote() {
        setNotes(prev => prev.filter(note => note.id !== editingNoteId));
        setIsCreateOpen(false);
        setEditingNoteId(null);
    }
    function viewToEdit(viewedNote) {
        closeView();
        openEdit(viewedNote);
    }
    function toggleStar(id) {
        setNotes(prev =>
            prev.map(note => {
                return note.id === id ? { ...note, starred: !note.starred } : note
            })
        );
    }
    // function toggleStar(id) {
    //     setNotes(prev =>
    //         prev.map(note =>
    //             note.id === id? { ...note, starred: !note.starred } : note
    //         )
    //     );
    // }

    return (
        <div className="min-h-lvh max-h-max bg-zinc-100">
            <div className="flex">
                <Sidebar onCreate={openCreate} />
                <main className="flex-1">
                    <div className="ml-16 px-10 pt-8">
                        <Topbar value={searchQuery} onChange={setSearchQuery} />
                        <h1 className="mt-6 text-6xl font-extrabold tracking-tight text-zinc-900">
                            Notes
                        </h1>
                        <div className="py-10 mb-50">
                            <NotesGrid notes={filteredNotes} onEdit={openEdit} onStar={toggleStar} onView={openView} />
                        </div>
                    </div>
                    <div className="ml-25">
                        <QuotesBar />
                    </div>
                </main>
            </div>
            {/* <noteTitleContext.Provider value={title}> */}
            <Modal open={isCreateOpen} title={createEditModalTitle} onClose={closeCreate}>
                <div className="space-y-4">
                    <div className="flex justify-left gap-10 items-center py-2">
                        <label>TITLE</label>
                        <textarea rows={1} value={title} onChange={(e) => setTitle(e.target.value)}
                            placeholder='Enter Note Title'
                            className="mt-1 w-full rounded-xl border border-zinc-900 px-4 py-3 outline-none focus:ring-2 focus:ring-zinc-900/10" />
                    </div>
                    <div className="flex flex-col justify-between gap-2 items-center py-2">
                        <label>BODY</label>
                        <textarea rows={5} value={body} onChange={(e) => setBody(e.target.value)}
                            placeholder='Enter Note Body'
                            className="mt-1 w-full rounded-xl border border-zinc-900 px-4 py-3 outline-none focus:ring-2 focus:ring-zinc-900/10" />
                    </div>
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-zinc-700">COLORS: </span>
                            <div className="flex items-center gap-2">
                                {COLORS.map((c) => (
                                    <input
                                        key={c}
                                        type="button"
                                        onClick={() => setColor(c)}
                                        title={c}
                                        className={`h-7 w-7 rounded-full ${c} border ${color === c ? "border-zinc-900" : "border-white/50"}`}
                                    />
                                ))}
                            </div>
                        </div>
                        <label className="flex items-center gap-2 text-sm text-zinc-700 select-none">
                            <input type='checkbox' checked={starred} onChange={(e) => setStarred(e.target.checked)}
                                className="h-4 w-4 rounded border-zinc-300" /> Starred
                        </label>
                    </div>
                    <div className="pt-2 flex items-center justify-end gap-2">
                        {editingNoteId !== null ? (<button
                            type="button"
                            onClick={deleteNote}
                            className="rounded-xl px-4 py-2.5 border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                        >
                            Delete
                        </button>) : null}
                        <button
                            type="button"
                            onClick={closeCreate}
                            className="rounded-xl px-4 py-2.5 border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            onClick={saveNote}
                            className="rounded-xl px-4 py-2.5 border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                            disabled={false}
                        >
                            {editingNoteId !== null ? "Save" : "Create"}
                        </button>
                    </div>
                </div>
            </Modal>
            <Modal open={!!viewNoteId} title={viewModalTitle} onClose={closeView}>
                {viewedNote && (
                    <div className="space-y-3">

                        <div className="text-sm text-zinc-500">
                            {new Date(viewedNote.createdAt).toLocaleDateString("en-us", { year: "numeric", month: "short", day: "numeric" })}
                        </div>
                        <div className="mt-auto pt-6 flex items-center justify-between gap-3">
                            <div className="whitespace-pre-wrap break-words text-zinc-800 leading-relaxed max-h-[60vh] overflow-auto pr-1">
                                {viewedNote.body}
                            </div>
                            <button
                                onClick={() => viewToEdit(viewedNote)}
                                type="button"
                                className="h-10 px-4 rounded-full bg-white/30 text-zinc-900 flex items-center justify-center hover:bg-white/50"
                            >
                                Edit
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
            {/* </noteTitleContext.Provider> */}
        </div>
    );
}
