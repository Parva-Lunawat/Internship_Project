import { loadNotes, savedNotes } from "../../utils/storage/localeStorage";

export const NOTES_INIT = "NOTES_INIT";
export const NOTES_CREATE = "NOTES_CREATE";
export const NOTES_UPDATE = "NOTES_UPDATE";
export const NOTES_DELETE = "NOTES_DELETE";
export const NOTES_TOGGLE_STAR = "NOTES_TOGGLE_STAR";

export const notesInit = (notes) => ({
    type: NOTES_INIT,
    payload: notes,
});

export const notesCreate = (note) => ({
    type: NOTES_CREATE,
    payload: note,
});

export const notesUpdate = (id, updates) => ({
    type: NOTES_UPDATE,
    payload: { id, updates }, // partial update only as no change to createDate and ID
});

export const notesDelete = (id) => ({
    type: NOTES_DELETE,
    payload: id,
});

export const notesToggleStar = (id) => ({
    type: NOTES_TOGGLE_STAR,
    payload: id,
});

// helpers
function uid() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function makeNewNote({ title, body = "", color = "pink", starred = false }) {
    return {
        id: uid(),
        title: title.trim(),
        body,
        color,
        starred,
        createdAt: new Date().toISOString(),
    };
}

function saveFromState(getState) {
  const state = getState();
  const items = state?.notes?.items ?? [];
  savedNotes(items);
}

// thunk functions

export const showInitNotes = () =>(dispatch) => {
    const stored = loadNotes();
    const currStored = Array.isArray(stored) ? stored : []
    dispatch(notesInit(currStored));
};

export const noteCreation = (draft) => (dispatch, getState) => {
    if (!draft?.title?.trim()) return;
    const note = makeNewNote(draft);
    dispatch(notesCreate(note));
    saveFromState(getState);
};

export const updateNoteFunc = (id, updates) => (dispatch, getState) => {
    if (!id) return;
    if (updates?.title !== undefined && !updates.title.trim()) return;

    dispatch(notesUpdate(id, updates));
    saveFromState(getState);
};

export const deleteNotesFunc = (id) => (dispatch, getState) => {
    if (!id) return;
    dispatch(notesDelete(id));
    saveFromState(getState);

}

export const toggleStarFunc = (id) => (dispatch, getState) => {
    if (!id) return;
    dispatch(notesToggleStar(id));
    saveFromState(getState);
}
