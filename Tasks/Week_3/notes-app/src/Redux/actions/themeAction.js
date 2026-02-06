export const THEME_SET = "THEME_SET";
export const THEME_TOGGLE = "THEME_TOGGLE";

export const themeSet = (theme) => ({
    type: THEME_SET,
    payload: theme,
});

export const themeToggle = () => ({
    type: THEME_TOGGLE,
});


