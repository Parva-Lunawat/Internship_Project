import { useState, useEffect } from "react";
import { loadNotes, savedNotes } from "../utils/storage/localeStorage";

export const COLORS = ["pink", "orange", "green", "violet", "blue"];
export const COLOR_MAP = {
    light: {pink: "bg-pink-300", orange: "bg-orange-300", green: "bg-green-300", violet: "bg-violet-300", blue: "bg-sky-300"},
    dark: {pink: "bg-rose-700", orange: "bg-amber-700", green: "bg-emerald-700", violet: "bg-violet-700", blue: "bg-sky-700"},
}
export function uid() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
export function useNotes() {
    // notes saver loader
    const [notes, setNotes] = useState(() => {
        const stored = loadNotes();
        if (stored) return stored;
        return [];
    });
    useEffect(() => {
        savedNotes(notes);
    }, [notes]);
    // Functions 
    function createNote({ title, body, color, starred}) {
        const t = title.trim();
        if (!t) return;
        const newNote = {
            id: uid(),
            title: t,
            body: body,
            color: color,
            starred: starred,
            createdAt: new Date(),
        };
        setNotes((prev) => [newNote, ...prev]);
    }

    function updateNote( editingNoteId, updation ) {
        setNotes(
            prev => prev.map(
                note => note.id === editingNoteId ? { ...note, ...updation } : note
            )
        );
    }

    function deletionNote(id) {
        setNotes(prev => prev.filter(note => note.id !== id));
    }

    function toggleStar(id) {
        setNotes(prev =>
            prev.map(note => {
                return note.id === id ? { ...note, starred: !note.starred } : note
            })
        );
    }
    return { notes, createNote, updateNote, deletionNote, toggleStar, COLORS };
}