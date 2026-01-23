export const localStore_Key = "Parva_Notes_App";

export function loadNotes() {
    try {
        const rawNotes = localStorage.getItem(localStore_Key);
        if (!rawNotes) return null;
        const parsed = JSON.parse(rawNotes);

        // let migrated = false;
        // let oldCol = ["bg-pink-300", "bg-orange-300", "bg-green-300", "bg-violet-300", "bg-sky-300"];
        // let COLORS = ["pink", "orange", "green", "violet", "blue"];

        // const migratedNotes = parsed.map(note => {
        //     const idx = oldCol.indexOf(note.color);
        //     if (idx !== -1) {
        //         migrated = true;
        //         return { ...note, color: COLORS[idx] };
        //     }
        //     return note;
        // });

        // if (migrated) {
        //     localStorage.setItem(localStore_Key, JSON.stringify(migratedNotes));
        // }
        // return migratedNotes;
        return parsed;
    } catch (err) {
        console.error("Failed to load notes:", err);
        return null;
    }
}

export function savedNotes(newNotes) {
    localStorage.setItem(localStore_Key, JSON.stringify(newNotes));
}