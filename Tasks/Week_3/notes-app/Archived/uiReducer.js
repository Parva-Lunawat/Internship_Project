import {
    UI_SET_SEARCH,
    UI_OPEN_CREATE,
    UI_CLOSE_CREATE,
    UI_OPEN_VIEW,
    UI_CLOSE_VIEW,
    UI_OPEN_PANEL,
    UI_CLOSE_PANEL,
    UI_START_EDIT,
    UI_CLEAR_EDITING,
} from "./uiAction";

const initialState = {
    search: "",
    isCreateOpen: false,
    viewId: null,
    isPanelOpen: false,
    editingId: null,
    draft: null,
};

export default function uiReducer(state = initialState, action) {
    switch (action.type) {

        case UI_SET_SEARCH: {
            
            return {
                ...state,
                search: action?.payload ?? "",
            };
        }

        case UI_OPEN_CREATE: {
            return {
                ...state,
                isCreateOpen: true,
            };
        }

        case UI_CLOSE_CREATE: {
            return {
                ...state,
                isCreateOpen: false,
            };
        }

        case UI_OPEN_VIEW: {
            return {
                ...state,
                viewId: action?.payload ?? null,
            };
        }

        case UI_CLOSE_VIEW: {
            return {
                ...state,
                viewId: null,
            };
        }

        case UI_OPEN_PANEL: {
            return {
                ...state,
                isPanelOpen: true,
            };
        }

        case UI_CLOSE_PANEL: {
            return {
                ...state,
                isPanelOpen: false,
            };
        }

        case UI_START_EDIT: {
            return {
                ...state,
                editingId: action?.payload ?? null,
            };
        }

        case UI_CLEAR_EDITING: {
            return {
                ...state,
                editingId: null,
            };
        }

        default:
            return state;
    }
}
