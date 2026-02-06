import { COLOR_MAP, COLORS } from "../constants/constants";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import QuotesBar from "../components/QuotesBar";
import NotesGrid from "../components/Notesgrid";
import Modal from "../components/Open_Note_Modal";
import ToolkitShortcuts from "../components/ToolkitShortcuts";
import { useState, useMemo, useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { useEscape, useNewNoteShortcut, useEnter, useChangeTheme } from "../context/keyboardHooks";

import { ToastContainer, toast } from "react-toastify";

import {
    showInitNotes,
    noteCreation,
    updateNoteFunc,
    deleteNotesFunc,
    toggleStarFunc,
} from "../Redux/actions/noteAction";
import { selectTheme, selectIsDark } from "../Redux/selector-functions/themeSelector";

// NotesPage will hold the addition deletion and all functionality + hold a dict for each added notes
// This dict will be passed to Notesgrid where it would be mapped each note via NotesCard

// Now addition of a method to call open_note_model to implement note addition function

export default function NotesPage() {
    const dispatch = useDispatch();
    const notes = useSelector((state) => state.notes.items);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [viewNoteId, setViewNoteId] = useState(null);
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [color, setColor] = useState(COLORS[0]);
    const [starred, setStarred] = useState(false);

    const isDark = useSelector(selectIsDark);
    const theme = useSelector(selectTheme);

    useEffect(() => {
        dispatch(showInitNotes());
    }, [dispatch]);

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


    useEscape((isCreateOpen || viewNoteId !== null || isPanelOpen), () => {
        if (isCreateOpen) closeCreate();
        else if (isPanelOpen) closePanel();
        else closeView();
    })
    useNewNoteShortcut((!isCreateOpen), () => { openCreate() });
    useEnter(isCreateOpen, () => { saveNote() });
    useChangeTheme(isCreateOpen && viewNoteId === null);

    function openCreate() {
        setTitle("");
        setBody("");
        setColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
        setStarred(false);
        setEditingNoteId(null);
        setIsCreateOpen(true);
    }
    function openPanel() {
        setIsPanelOpen(true);
    }
    function closePanel() {
        setIsPanelOpen(false);
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
        const notify = () => toast(`Note Succesfully ${editingNoteId !== null ? "Edited" : "Created"}`);
        const t = title.trim();
        if (!t) return;
        if (editingNoteId === null) {
            dispatch(noteCreation({ title: t, body, color, starred }));
        } else {
            dispatch(updateNoteFunc(editingNoteId, { title: t, body, color, starred }));
        }
        setEditingNoteId(null);
        setIsCreateOpen(false);
        notify();
    }
    function deleteNote() {
        dispatch(deleteNotesFunc(editingNoteId));
        setIsCreateOpen(false);
        setEditingNoteId(null);
        toast("Note Deleted");
    }
    function viewToEdit(viewedNote) {
        closeView();
        openEdit(viewedNote);
    }

    const toggleStar = (id) => dispatch(toggleStarFunc(id));

    return (
        <div className={`
            min-h-lvh max-h-max
            ${isDark
                ? "bg-zinc-900/90 text-zinc-100"
                : "bg-zinc-100 text-zinc-900"}
        `}>
            <div className="flex">
                <Sidebar onCreate={openCreate} onTools={openPanel} />
                <main className="flex-1">
                    <div className="ml-16 px-10 pt-8">
                        <Topbar value={searchQuery} onChange={setSearchQuery} />
                        <h1 className="my-6 text-6xl font-extrabold tracking-tight">
                            Notes
                        </h1>
                        <div className="py-10 mb-5 max-h-[75vh] overflow-auto">
                            <NotesGrid notes={filteredNotes} onEdit={openEdit} onStar={toggleStar} onView={openView} />
                        </div>
                    </div>
                    <div className="ml-25">
                        <QuotesBar />
                    </div>
                </main>
            </div>
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
                            <span className="text-sm font-medium">COLORS: </span>
                            <div className="flex items-center gap-2">
                                {COLORS.map((c) => {
                                    const bgClass = COLOR_MAP[theme][c];
                                    return (
                                        <input
                                            key={c}
                                            type="button"
                                            onClick={() => setColor(c)}
                                            title={c}
                                            className={`h-7 w-7 rounded-full ${bgClass} border-2 
                                            ${color === c ? (isDark ? "border-white/50" : "border-zinc-900") : (isDark ? "border-zinc-900" : "border-white/50")}`}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                        <label className="flex items-center gap-2 text-sm select-none">
                            <input type='checkbox' checked={starred} onChange={(e) => setStarred(e.target.checked)}
                                className="h-4 w-4 rounded border-zinc-300" /> Starred
                        </label>
                    </div>
                    <div className="pt-2 flex items-center justify-end gap-2">
                        {editingNoteId !== null ? (<button
                            type="button"
                            onClick={deleteNote}
                            className={`px-4 py-2.5 rounded-xl border text-red-400`}
                        >
                            Delete
                        </button>) : null}
                        <button
                            type="button"
                            onClick={closeCreate}
                            className={`px-4 py-2.5 rounded-xl border text-zinc-900
                                ${isDark
                                    ? "bg-zinc-100 hover:bg-zinc-200"
                                    : "bg-zinc-900 hover:bg-zinc-800"}
                            `}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            onClick={saveNote}
                            className={`px-4 py-2.5 rounded-xl font-medium border text-zinc-900
                                ${isDark
                                    ? "bg-zinc-100 hover:bg-zinc-200"
                                    : "bg-zinc-900 hover:bg-zinc-800"}
                            `}
                            disabled={false}
                        >
                            {editingNoteId !== null ? "Save" : "Create"}
                        </button>
                    </div>
                </div>
            </Modal>
            <Modal open={!!viewNoteId} title={viewModalTitle} onClose={closeView}>
                {viewedNote && (
                    <div className="space-y-3 -mx-1">
                        <div className="pt-3 flex items-center justify-between gap-3">
                            <div className="text-sm">
                                {new Date(viewedNote.createdAt).toLocaleDateString("en-us", { year: "numeric", month: "short", day: "numeric" })}
                            </div>
                            <button
                                onClick={() => viewToEdit(viewedNote)}
                                type="button"
                                // className="h-10 px-4 rounded-full flex items-center justify-center hover:bg-white/50"
                                className={`rounded-lg px-4 py-1.5 text-sm text-zinc-900
                                    ${isDark
                                        ? "hover:bg-zinc-700"
                                        : "hover:bg-zinc-100"}
                                    `}
                            >
                                Edit
                            </button>
                        </div>
                        <div className="whitespace-pre-wrap break-words leading-relaxed max-h-[40vh] overflow-auto pr-1">
                            {viewedNote.body}
                        </div>
                    </div>
                )}
            </Modal>
            <Modal open={isPanelOpen} title="TOOLKIT" onClose={closePanel}>
                <ToolkitShortcuts />
            </Modal>
            <ToastContainer />
        </div>
    );
}
