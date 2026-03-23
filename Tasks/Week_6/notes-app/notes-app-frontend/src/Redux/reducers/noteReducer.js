import { NOTES_INIT, NOTES_CREATE, NOTES_DELETE, NOTES_UPDATE, NOTES_TOGGLE_STAR } from "../actions/noteAction";

const initialState = {
    items: []
}

export default function notesReducer(state = initialState, action) {
    switch (action.type) {
        case NOTES_INIT: {
            return { ...state, items: action?.payload || [] };
        }

        case NOTES_CREATE: {
            const newNote = action.payload;
            const updatedItems = [newNote, ...state.items];
            return {
                ...state, items: updatedItems
            };
        }

        case NOTES_DELETE: {
            const id = action.payload;
            const updatedItems = state.items.filter((i) => i.id !== id);
            return {
                ...state,
                items: updatedItems
            };
        }

        case NOTES_UPDATE: {
            const { id, updates } = action.payload;
            const updatedItems = (state.items.map((i) => (i.id === id) ?
                { ...i, ...updates } : i));
            return {
                ...state, items: updatedItems
            };
        }

        case NOTES_TOGGLE_STAR: { 
            const id = action.payload; 
            const updatedItems = (state.items.map((i) => (i.id === id) ? 
                { ...i, starred: !i.starred } : i)); 
            return { ...state, items: updatedItems }; 
        }

        default:
            return state;
    }
}