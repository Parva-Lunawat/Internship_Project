import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import NotesGrid from '../components/Notesgrid';
import Modal from '../components/Open_Note_Modal'
import { useState } from "react";
import { useMemo } from "react";


// NotesPage will hold the addition deletion and all functionality + hold a dict for each added notes
// This dict will be passed to Notesgrid where it would be mapped each note via NotesCard

// Now addition of a method to call open_note_model to implement note addition function

const COLORS = ["bg-pink-300", "bg-orange-300", "bg-green-300", "bg-violet-300", "bg-sky-300"];

export default function NotesPage() {
    const [notes, setNotes] = useState([
        {
            id: "1",
            title: "The beginning of this page",
            body: "olla",
            color: "bg-yellow-200",
            starred: false,
            createdAt: new Date("2020-05-21"),
        },
    ]);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [color, setColor] = useState(COLORS[0]);
    const [starred, setStarred] = useState(false);
    const [viewNoteId, setViewNoteId] = useState(null);
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const filteredNotes = useMemo(() => {
        return notes.filter(note => {
            const q = searchQuery.toLowerCase();
            return (
                note.title.toLowerCase().includes(q) || note.body.toLowerCase().includes(q)
            );
        }).sort((a, b) => (Number(b.starred) - Number(a.starred)));
    }, [notes, searchQuery]);
    const viewedNote = notes.find(n => n.id === viewNoteId) || null;


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
                id: crypto.randomUUID(),
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
                        <div className="py-10">
                            <NotesGrid notes={filteredNotes} onEdit={openEdit} onStar={toggleStar} onView={openView} />
                        </div>
                    </div>
                </main>
            </div>

            <Modal open={isCreateOpen} title={editingNoteId ? "Edit Note" : "New Note"} onClose={closeCreate}>
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
                            type="button"
                            onClick={saveNote}
                            className="rounded-xl px-4 py-2.5 border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                            disabled={!title.trim()}
                        >
                            {editingNoteId ? "Save" : "Create"}
                        </button>
                    </div>
                </div>
            </Modal>
            <Modal open={!!viewNoteId} title="Note" onClose={closeView}>
                {viewedNote && (
                    <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                            <h3 className="text-xl font-semibold whitespace-pre-line">{viewedNote.title}</h3>
                        </div>

                        <div className="text-sm text-zinc-500">
                            {new Date(viewedNote.createdAt).toLocaleDateString("en-us", { year: "numeric", month: "short", day: "numeric" })}
                        </div>

                        <div className="whitespace-pre-wrap break-words text-zinc-800 leading-relaxed max-h-[60vh] overflow-auto pr-1">
                            {viewedNote.body}
                        </div>
                    </div>
                )}
            </Modal>

        </div>
    );
}
