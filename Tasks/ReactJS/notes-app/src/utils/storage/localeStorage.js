export const localStore_Key = "Parva_Notes_App";

export function loadNotes() {
    try {
        const rawNotes = localStorage.getItem(localStore_Key);
        if (!rawNotes) return null;
        const parsed = JSON.parse(rawNotes);
        return parsed;
    } catch {
        return null;
    }
}

export function savedNotes(newNotes) {
    localStorage.setItem(localStore_Key, JSON.stringify(newNotes));
}