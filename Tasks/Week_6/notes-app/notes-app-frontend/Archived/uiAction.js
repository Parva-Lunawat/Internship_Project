export const UI_SET_SEARCH = "UI_SET_SEARCH";
export const UI_OPEN_CREATE = "UI_OPEN_CREATE";
export const UI_CLOSE_CREATE = "UI_CLOSE_CREATE";
export const UI_OPEN_VIEW = "UI_OPEN_VIEW";
export const UI_CLOSE_VIEW = "UI_CLOSE_VIEW";
export const UI_OPEN_PANEL = "UI_OPEN_PANEL";
export const UI_CLOSE_PANEL = "UI_CLOSE_PANEL";
export const UI_START_EDIT = "UI_START_EDIT";
export const UI_CLEAR_EDITING = "UI_CLEAR_EDITING";

export const uiSetSearch = (search) => ({
    type: UI_SET_SEARCH,
    payload: search,
});

export const uiOpenCreate = () => ({
    type: UI_OPEN_CREATE,
});

export const uiCloseCreate = () => ({
    type: UI_CLOSE_CREATE,
});

export const uiOpenView = (id) => ({
    type: UI_OPEN_VIEW,
    payload: id,
});

export const uiCloseView = () => ({
    type: UI_CLOSE_VIEW,
});

export const uiOpenPanel = () => ({
    type: UI_OPEN_PANEL,
});

export const uiClosePanel = () => ({
    type: UI_CLOSE_PANEL,
});

export const uiStartEdit = (id) => ({
    type: UI_START_EDIT,
    payload: id,
});

export const uiClearEditing = () => ({
    type: UI_CLEAR_EDITING,
});
